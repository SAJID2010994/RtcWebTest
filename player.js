/*
 Player.js - refactored (PixiJS + PeerJS stickman game)

 What changed:
 - No globals inside the class. Game code plugs in through `player.hooks`.
 - No ticker inside the constructor. Call `player.update(dtSeconds)` from your own loop.
 - No setTimeout / onFrameChange juggling. One frame handler + a tiny timer list that is
   tied to the player's game clock (so it pauses during hit-stop) and ignores stale timers.
 - Per-state data (speed, loop, hitbox) lives in Player.STATES. New state = one table entry.
 - Gravity and sprite smoothing are frame-rate independent.

 Wiring example (put this in your game code):

   const player = new Player(container, anims)
   player.floorY = floor.y
   player.gravity = <same number you used before>
app.ticker.add(t => {
	const dt = t.deltaMS / 1000
	player.update(dt)
	enemyPlayer.update(dt)
})

player.hooks.onDash = () => {
	const id = sounds.dash.play()
	sounds.dash.seek(0.2, id)
	CameraShake(7, 16, 100)
}
player.hooks.findPunchTarget = () => isCollidingPlayers(player, enemyPlayer) ? enemyPlayer : null
player.hooks.onPunchLanded = (me, target) => {
	target.damage(10)
	sounds.punch.play('hit1')
	CameraShake(2, 1, 200)
	try { conn.send({ type: 'hit', direction: me.direction }) } catch (e) {}
	me.hitStop(500)
	target.hitStop(500)
}
player.hooks.onGotHit = (me) => {
	sounds.punch.play('hit1')
	CameraShake(2, 1, 200)
	me.hitStop(500)
	enemyPlayer.hitStop(500)
}
   
*/

class Player {
	// Tunable numbers
	static CONFIG = {
		dashSpeed: 2000,       // px/s while dashing
		dashDurationMs: 130,   // how long the dash lasts after its second frame
		punchRecoveryMs: 50,   // recovery after the punch hit frame
		stunDamage: 10,
		smoothing: 0.4,        // sprite follow factor per 1/60s
	}

	// Per-state data. hitBox is defined FACING RIGHT and mirrored automatically for left.
	static STATES = (() => {
		const body = { x: 0, y: 32, width: 16, height: 37 }
		return {
			idle: { speed: 0.125, loop: true,  hitBox: body },
			run:  { speed: 0.25,  loop: true,  hitBox: body },
			hit1: { speed: 0.3,   loop: false, hitBox: { x: 16, y: 32, width: 20, height: 37 } },
			dash: { speed: 0.3,   loop: false, hitBox: { x: 0,  y: 32, width: 0,  height: 0 } },
			stun: { speed: 0.2,   loop: false, hitBox: body },
		}
	})()

	constructor(container, anims,app) {
		this.anims = anims
		this.onStateChange = () => {}

		// The game code fills these in. Defaults do nothing.
		this.hooks = {
			onDash: (player) => {},
			findPunchTarget: (player) => null,          // return the enemy Player if the punch connects
			onPunchLanded: (player, target) => {},
			onGotHit: (player) => {},
		}

		// Sprite
		this.sprite = new PIXI.AnimatedSprite(anims.animations['idle'])
		this.sprite.scale.set(3)
		this.sprite.anchor.set(0.5)
		container.addChild(this.sprite)

		// Cooldowns (stored as "ready at" times on the game clock)
		this.coolDownTime = { dash: 300, punch: 500 }
		this.cooldownUntil = { dash: 0, punch: 0 }

		// State
		this._state = ''
		this.stateId = 0                    // bumps on every state change; invalidates stale timers
		this.previousState = 'idle'
		this.direction = 'right'
		this.isCurrentStateChangable = true
		this.pendingFrameAction = null      // 'dash' | 'punch' | null
		this.stateOnPending=null
		// Stats / physics
		this.health = 100
		this.gravity = 0                    // same units as before (per-frame at 60fps)
		this.floorY = 720             // set from game code: player.floorY = floor.y
		this.speed = 300
		this.velocity = { x: 0, y: 0 }
		this.x = 0
		this.y = 0

		// Clocks
		this.clock = 0                      // always advances
		this.time = 0                       // advances only when not in hit-stop
		this.hitStopUntil = 0
		this.timers = []

		// One handler each, dispatching by state (nothing gets overwritten by another move)
		this.sprite.onFrameChange = (frame) => this.handleFrame(frame)
		this.sprite.onComplete = () => this.handleComplete()

		this.setState('idle')
		
		
		
		
		
		
		
	}

	// ---------- getters / setters (kept compatible with the old class) ----------

	get state() { return this._state }
	set state(val) { this.setState(val) }

	// Mirrored for the current facing direction
	get hitBox() {
		const box = Player.STATES[this._state].hitBox
		return {
			x: this.direction === 'left' ? -box.x : box.x,
			y: box.y,
			width: box.width,
			height: box.height,
		}
	}

	get hitStun() { return this.clock < this.hitStopUntil }

	get onCoolDown() {
		return {
			dash: this.time < this.cooldownUntil.dash,
			punch: this.time < this.cooldownUntil.punch,
		}
	}

	// ---------- core loop ----------

	update(dt) {
		const ms = dt * 1000
		this.clock += ms
		if (this.clock < this.hitStopUntil) return   // frozen by hit-stop
		this.time += ms
		if (this.stateOnPending!=null) {
			this.setState(this.stateOnPending)
			this.stateOnPending=null
			
		}
		

		this.flip_h(this.direction)
		this.runTimers()

		// Floor check + gravity (gravity keeps its old per-frame meaning at 60fps)
		const onFloor = this.y + (64 * this.sprite.scale.y) / 2 >= this.floorY
		if (onFloor) {
			this.velocity.y = 0
		} else {
			this.velocity.y += this.gravity * 60 * dt
		}

		this.x += this.velocity.x * dt
		this.y -= this.velocity.y * dt

		// Frame-rate independent smoothing
		const t = 1 - Math.pow(1 - Player.CONFIG.smoothing, dt * 60)
		this.sprite.x += (this.x - this.sprite.x) * t
		this.sprite.y += (this.y - this.sprite.y) * t
	}
	

	// ---------- state machine ----------

	setState(name, restart = false) {
		if (this.clock < this.hitStopUntil) {
			this.stateOnPending=name
			
			return
		}else if (name === this._state && !restart) {return}
		const data = Player.STATES[name]
		if (!data) {
			console.warn('Unknown player state:', name)
			return
		}
    this.flip_h(this.direction)
		this.stateId++
		this.pendingFrameAction = null
		this._state = name

		this.sprite.textures = this.anims.animations[name]
		this.sprite.animationSpeed = data.speed
		this.sprite.loop = data.loop
		this.sprite.gotoAndPlay(0)

		this.onStateChange()
	}

	savePreviousState() {
		if (this._state === 'idle' || this._state === 'run') {
			this.previousState = this._state
		}
	}

	returnToPreviousState() {
		if (this.previousState === 'run') this.run(this.direction)
		else this.idle()
	}

	// ---------- timers ----------

	// Runs fn after `ms` of game time, but only if the state hasn't changed since.
	after(ms, fn) {
		this.timers.push({ at: this.time + ms, id: this.stateId, fn })
	}

	runTimers() {
		if (this.timers.length === 0) return
		const due = this.timers.filter((t) => t.at <= this.time)
		this.timers = this.timers.filter((t) => t.at > this.time)
		for (const t of due) {
			if (t.id === this.stateId) t.fn()
		}
	}

	// Freezes this player's update loop (call it on both players for a hit-stop).
	hitStop(ms) {
		this.hitStopUntil = this.clock + ms
	}
	activateHitStun(ms) { this.hitStop(ms) }   // old name, now only affects this player

	// ---------- frame events ----------

	handleFrame(frame) {
		if (!this.pendingFrameAction) return
		const action = this.pendingFrameAction
		this.pendingFrameAction = null
		if (action === 'dash') this.onDashFrame(frame)
		else if (action === 'punch') this.onPunchFrame(frame)
	}

	handleComplete() {
		if (this._state === 'stun') {
			this.isCurrentStateChangable = true
			this.returnToPreviousState()
		}
	}

	onDashFrame(frame) {
		this.velocity.x += this.direction === 'right' ? Player.CONFIG.dashSpeed : -Player.CONFIG.dashSpeed
		if (frame==1) {
			this.isCurrentStateChangable = true
		this.after(Player.CONFIG.dashDurationMs, () => this.returnToPreviousState())

		}
			}

	onPunchFrame() {
		this.after(Player.CONFIG.punchRecoveryMs, () => {
			this.isCurrentStateChangable = true
			this.returnToPreviousState()
		})

		const target = this.hooks.findPunchTarget(this)
		if (target && target.state !== 'stun') {
			this.hooks.onPunchLanded(this, target)
		}
	}

	// ---------- actions ----------

	flip_h(direction) {
		const s = Math.abs(this.sprite.scale.x)
		this.sprite.scale.x = direction === 'left' ? -s : s
	}

	run(direction) {
		if (!this.isCurrentStateChangable) return
		this.savePreviousState()
		this.direction = direction
		this.velocity.x = direction === 'right' ? this.speed : -this.speed
		this.setState('run')
	}

	idle() {
		if (this.isCurrentStateChangable) {
			this.savePreviousState()
			this.velocity.x = 0
			this.setState('idle')
		} else {
			this.previousState = 'idle'
		}
	}

	dash() {
		if (!this.isCurrentStateChangable || this.time < this.cooldownUntil.dash) return

		this.savePreviousState()
		this.isCurrentStateChangable = false   // first frame can't be cancelled
		this.velocity.x = 0
		this.setState('dash', true)
		this.pendingFrameAction = 'dash'
		this.cooldownUntil.dash = this.time + this.coolDownTime.dash

		this.hooks.onDash(this)
	}

	punch() {
		if (!this.isCurrentStateChangable || this.time < this.cooldownUntil.punch) return

		this.savePreviousState()
		this.isCurrentStateChangable = false
		if (this._state === 'dash') this.velocity.x = 0   // don't keep sliding at dash speed
		this.setState('hit1', true)
		this.pendingFrameAction = 'punch'
		this.cooldownUntil.punch = this.time + this.coolDownTime.punch
	}

	gotHit(direction) {
		this.savePreviousState()
		this.isCurrentStateChangable = false
		this.velocity.x = 0
		this.direction = direction === 'right' ? 'left' : 'right'
		this.setState('stun', true)
		this.damage(Player.CONFIG.stunDamage)

		this.hooks.onGotHit(this)
	}

	damage(amount) {
		this.health -= amount
	}

	// ---------- multiplayer helpers ----------

	getSnapshot() {
		return {
			x: this.x,
			y: this.y,
			state: this._state,
			direction: this.direction,
			health: this.health,
		}
	}

	applySnapshot(s) {
		this.x = s.x
		this.y = s.y
		this.direction = s.direction
		this.health = s.health
		if (s.state !== this._state) this.setState(s.state)
	}

	destroy() {
		this.sprite.onFrameChange = null
		this.sprite.onComplete = null
		this.sprite.destroy()
	}
}


function createMainPlayer(world,textures,app) {
	player = new Player(world, textures, app)
world
	.follow(player, { speed: 0 }) // speed 0 = locked to the player
	.clamp({ direction: 'all' }); // never show outside the level
	app.ticker.add(t => {
	const dt = t.deltaMS / 1000
	player.update(dt)
	
})

player.hooks.onDash = () => {
	const id = sounds.dash.play()
	sounds.dash.seek(0.2, id)
	CameraShake(7, 16, 100)
}
player.hooks.findPunchTarget = () => isCollidingPlayers(player, enemyPlayer) ? enemyPlayer : null
player.hooks.onPunchLanded = (me, target) => {
	
	sounds.punch.play('hit1')
	CameraShake(2, 1, 200)
	try { conn.send({ type: 'hit', direction: me.direction }) } catch (e) {}
	me.hitStop(500)
//	target.hitStop(500)
}
player.hooks.onGotHit = (me) => {
	sounds.punch.play('hit1')
	CameraShake(2, 1, 200)
	me.hitStop(500)
	enemyPlayer.hitStop(500)
}
	
	
	
	
}



function createEnemyPlayer(world,textures,app) {
enemyPlayer = new Player(world, textures, app)
enemyPlayer.y = 720 - 128
enemyPlayer.x=200
app.ticker.add(t => {
	const dt = t.deltaMS / 1000
	enemyPlayer.update(dt)
	
})

/*enemyPlayer.hooks.onGotHit = () => {
	
	enemyPlayer.hitStop(500)
}
*/
}




class playerHealthIndicator {
	constructor(app, player, pos) {
		let gfx = new PIXI.Graphics()
		app.stage.addChild(gfx)
		app.ticker.add(() => {
			gfx.clear()
			gfx.rect(pos.x, pos.y, player.health, 50).stroke({ width: 2 })
		})
	}
}
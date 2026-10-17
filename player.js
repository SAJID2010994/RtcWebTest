class Player{
	constructor(container,anims,app){
		//storing the animations in the class
		this.anims=anims
		
		
		//player animatedSprite
	this.sprite = new PIXI.AnimatedSprite(anims.animations['idle'])
	
	//power up cooldwn times(ms)
	
	this.coolDownTime={dash:300,punch:300}
	
	//power ups on cooldown
	
	this.onCoolDown={
		dash:false,
		punch:false
	}
	
	//setting scale
	this.sprite.scale=3
	
	//setting anchor
	this.sprite.anchor.set(0.5)
	
	//adding to the container
	container.addChild(this.sprite)
	
	//cancelable states
	
	this.cancelable=['run','idle']

	//setting up hitbox
	this.hitBox={
		x:0,
		y:32,
		width:16,
		height:37
	}
	//initialzing currentAnimation
	this.sprite.currentAnimation='run_left'
	
	//initializing state and direction
	this.state='idle'
	this.stateChanged=false
	this.previousState=''
	
	this.isCurrentStateChangable=true
	
	this.direction='right'
	
	
	this.health=100
	
	
	//gravity related stuff
	this.gravity=0
	
	this.hitStun=false
	//
	this.x=0
	this.y=0
	
	//setting animation speed
	this.sprite.animationSpeed = 0.25
	
	//initializing speed
	this.speed=300
	
	//initializing velocity
	this.velocity={x:0,y:0}
	
	let sec;
	
	//loop for the player
	
	//mr mini meowwwww Nyaa~~~~!
	
	app.ticker.add((ticker)=>{
		if(this.hitStun) return;
		
		 sec = ticker.deltaMS / 1000;
		
		 //flips the player according to the direction
		 this.flip_h(this.direction)
		 
		 if (this.sprite.currentAnimation!=this.state) {
		 	
		 	this.sprite.currentAnimation=this.state
		 			 	//sets the state animation to the sprite
	this.sprite.textures = this.anims.animations[this.state]
	
		 //plays the animation
this.sprite.play()
//this switch statement sets the speed and looping and hitBox size
switch (this.state) {
	case 'run':
		this.sprite.animationSpeed = 0.25
		this.sprite.loop = true
		this.hitBox = {
			x: 0,
			y: 32,
			width: 16,
			height: 37
		}
		break;
	case 'idle':
		this.sprite.animationSpeed = 0.125
		this.sprite.loop = true
		this.hitBox = {
			x: 0,
			y: 32,
			width: 16,
			height: 37
		}
		break;
	case 'hit1':
		this.sprite.animationSpeed = 0.6
		this.sprite.loop = false
		if (this.direction == 'right') {
			this.hitBox = {
				x: 16,
				y: 32,
				width: 20,
				height: 37
			}
		} else {
			this.hitBox = {
				x: -16,
				y: 32,
				width: 20,
				height: 37
			}
		}
		break;
	case 'dash':
		this.sprite.animationSpeed = 0.3
		this.sprite.loop = false
		this.hitBox = {
			x: 0,
			y: 32,
			width: 0,
			height: 0
		}
		break;
	case 'stun':
		this.sprite.animationSpeed = 0.3
		this.sprite.loop = false
		break;
		
}
		 
		 
		 }
		 
		 
		 
		 
		//checks if the player is touching the floor or not
		if (this.y+((64*this.sprite.scale.y)/2)>=floor.y) {
			this.velocity.y=0
		}else{
			//incresing the y velocity according to the gravity
			this.velocity.y += this.gravity
		}
		
		
		//moving the player according to the his velocity
		this.x+=this.velocity.x*sec
		this.y-=this.velocity.y*sec
		
		this.sprite.x=lerp(this.sprite.x,this.x,0.4)
		this.sprite.y=lerp(this.sprite.y,this.y,0.4)
	})
	
	
	
	
	
	//constructor end
	}
	//flipper function
	flip_h(direction){
		switch (direction) {
			case 'right':
				this.sprite.scale.x=Math.abs(this.sprite.scale.x)
				break;
			case 'left':
				this.sprite.scale.x=-Math.abs(this.sprite.scale.x)
				break;
			
		}
	}
	
	
	run(direction){
		if (this.isCurrentStateChangable) {
			this.isCurrentStateChangable=true
			this.savePreviousState()
			this.state = 'run'
			this.direction = direction
			switch (direction) {
	case 'right':
		this.velocity.x = this.speed
		break;
	case 'left':
		this.velocity.x = -this.speed
		break;
}
		}
	}
	
	
	
	idle(){
		if (this.isCurrentStateChangable){
			this.savePreviousState()
			this.isCurrentStateChangable=true
this.velocity.x = 0
this.state = 'idle'
		}else{
			this.previousState='idle'
		}
	}
	
	
	
	dash(){
		//first checking if current state is changable or not and if dash is on cooldown
		
		if (this.isCurrentStateChangable && this.onCoolDown.dash==false) {
			//storing the previous state
			this.savePreviousState()
			
			//setting the state to dash
			this.state = 'dash'
			let id=sounds.dash.play();
			sounds.dash.seek(0.2,id)
			//the first frame of dash is not changable
			this.isCurrentStateChangable=false
			this.velocity.x=0
			
			//this is to chck if dash has reaced the second frame or not and this is also responsible for the acceleration when dashing
		this.sprite.onFrameChange = frame => {
			//this if statement sets the acceleration
	if (this.state == 'dash') {
		switch (this.direction) {
			case 'right':
				
				this.velocity.x += 2000
				break;
			case 'left':
				
				this.velocity.x -= 2000
				break;
		}
	}
	
	
	//this if statement makes dash changable when reached the second frame
	if (frame==1) {
		this.isCurrentStateChangable=true
		
		//this timeout changes the state to the old state when dash ends
setTimeout(() => {
	//lets begin explaining whatvthis part does
	
	//This first if checks if the player is still dashing after the timeout completes.If he is,then it sets the state to the previous state, but if he already has changed his state during mid dash then it does nothing
	if (this.state == 'dash') {
		this.returnToPreviousState()
	}
	
	
}, 130)


this.sprite.onFrameChange = ''
	}
	
	
}
//shakes the camera a bit 
CameraShake(7, 16, 100)



//this timeout sets the dash on cooldown
this.onCoolDown.dash=true
setTimeout(()=>{
	this.onCoolDown.dash=false
},this.coolDownTime.dash)

		}
	}
	
	
	
	punch(){
		if (this.isCurrentStateChangable==true && this.onCoolDown.punch==false) {
			
			this.isCurrentStateChangable=false
			this.savePreviousState()
		this.state='hit1'
		this.resetCurrentAnimation()
		//this.sprite.texture=this.sprite.textures[0]
		/*this.sprite.textures=this.anims.animations[this.state]
		this.sprite.play()*/
		this.sprite.onFrameChange=frame=>{
			
			if (frame==1) {
				
				setTimeout(()=>{
					this.isCurrentStateChangable=true
					
					this.returnToPreviousState()
					
					
				},50)
				if (isCollidingPlayers(player, enemyPlayer) && enemyPlayer.state!='stun') {
					
					
					conn.send({
						type: 'hit',
						direction:this.direction
					})
					
					CameraShake(2,1,200)
					this.activateHitStun(500)
					enemyPlayer.damage(10)
				}
				



				this.sprite.onFrameChange = ''
				
				
				
			}
		}
		this.onCoolDown.punch=true
		setTimeout(()=>
		this.onCoolDown.punch=false,this.coolDownTime.punch)
		}
			}
			
			
	gotHit(){
		this.savePreviousState()
		this.state='stun'
		this.resetCurrentAnimation()
		this.isCurrentStateChangable=false
		this.damage(10)
	 this.sprite.onComplete=()=>{
	 	this.activateHitStun(500)
	 	this.isCurrentStateChangable = true
this.returnToPreviousState()
	 	this.sprite.onComplete=''
	 }
		
	}
	
	
	damage(amount){
		this.health-=amount
	}
	
	returnToPreviousState(){
		switch (this.previousState) {
	case 'run':
		this.run(this.direction)
		break;
	case 'idle':
		this.idle()
		break;
}
	}
	
	
	savePreviousState(){
		if (this.state=='idle' || this.state=='run') {
			this.previousState=this.state
		}
	}
	
	activateHitStun(time){
		player.hitStun=true
		enemyPlayer.hitStun=true
		setTimeout(() => {
	player.hitStun = false
	enemyPlayer.hitStun=false
}, time)
	}
	
	
	
	//getters and setters
	resetCurrentAnimation(){
		this.sprite.textures = this.anims.animations[this.state]
		this.sprite.play()
	}
	
	
	
	
	
}





class playerHealthIndicator{
	constructor(app,player,pos){
		let gfx=new PIXI.Graphics()
		app.stage.addChild(gfx)
		app.ticker.add(()=>{
			gfx.clear()
			gfx.rect(pos.x,pos.y,player.health,50).stroke({width:2})
		})
	}
}
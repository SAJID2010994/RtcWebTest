class Player{
	constructor(container,anims,app){
		//storing the animations in the class
		this.anims=anims
		
		
		//player animatedSprite
	this.sprite = new PIXI.AnimatedSprite(anims.animations['run'])
	
	//power up cooldwn times(ms)
	
	this.coolDownTime={dash:500}
	
	//power ups on cooldown
	
	this.onCoolDown={
		dash:false
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
	
	this.previousState=''
	
	this.isCurrentStateChangable=true
	
	this.direction='right'
	
	
	this.health=100
	
	
	//gravity related stuff
	this.gravity=0
	
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
	app.ticker.add((ticker)=>{
		 sec = ticker.deltaMS / 1000;
		
		 //flips the player according to the direction
		 this.flip_h(this.direction)
		 
		 
		 //checks is the currentAnimation is similar to the current state
		if (this.sprite.currentAnimation!=this.state) {
			//sets the currentAnimatiom var to the state value
			this.sprite.currentAnimation=this.state
			
			//sets the state animation to the sprite
			this.sprite.textures=this.anims.animations[this.state]
			
			//plays the animation
			this.sprite.play()
			//this switch statement sets the speed and looping and hitBox size
			switch (this.state) {
	case 'run':
		this.sprite.animationSpeed = 0.25
		this.sprite.loop=true
		this.hitBox={
	x: 0,
	y: 32,
	width: 16,
	height: 37
}
		break;
	case 'idle':
		this.sprite.animationSpeed = 0.125
		this.sprite.loop=true
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
if (this.direction=='right') {
	this.hitBox = {
	x: 16,
	y: 32,
	width: 20,
	height: 37
}
}else{
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
	width: 1,
	height: 1
}
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
			this.previousState=this.state
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
			this.previousState = this.state
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
			this.previousState=this.state
			
			//setting the state to dash
			this.state = 'dash'
			
			//the first frame of dash is not changable
			this.isCurrentStateChangable=false
			
			
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
	}
	
	
}
//shakes the camera a bit 
CameraShake(7, 16, 100)

//this timeout changes the state to the old state when dash ends
setTimeout(() => {
	//lets begin explaining whatvthis part does
	
	//This first if checks if the player is still dashing after the timeout completes.If he is,then it sets the state to the previous state, but if he already has changed his state during mid dash then it does nothing
	if (this.state=='dash') {
		this.state = this.previousState
		
		//this checks if the previous state was run.If yes then it sets the player to run and if not then sets the velocitu to 0
		
		if (this.state!='run') {
			this.velocity.x = 0
		}else{
			this.run(this.direction)
		}
	}
	
	this.sprite.onFrameChange = ''
}, 100)

//this timeout sets the dash on cooldown
this.onCoolDown.dash=true
setTimeout(()=>{
	this.onCoolDown.dash=false
},this.coolDownTime.dash)

		}
	}
	punch(){
		if (this.isCurrentStateChangable) {
			this.previousState=this.state
		this.state='hit1'
		this.sprite.onFrameChange=e=>{
			if (e==1) {
				if (isCollidingPlayers(player, enemyPlayer)) {
					conn.send({
						type: 'hit'
					})
					enemyPlayer.damage(10)
				}
				



				this.sprite.onFrameChange = ''
				
				
				setTimeout(()=>this.state=this.previousState,50)
			}
		}

		}
			}
	damage(amount){
		this.health-=amount
	}
	
	
	
	
	
	/*getters and setters
	set x(val){
		this.sprite.x=val
	}
	get x(){
		return this.sprite.x
	}
	set y(val){
		this.sprite.y=val
	}
	get y(){
		return this.sprite.y
	}*/
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
class Player{
	constructor(container,anims,app){
		//storing the animations in the class
		this.anims=anims
		
		
		//player animatedSprite
	this.sprite = new PIXI.AnimatedSprite(anims.animations['run'])
	
	
	//setting scale
	this.sprite.scale=2.5
	
	//setting anchor
	this.sprite.anchor.set(0.5)
	
	//adding to the container
	container.addChild(this.sprite)
	
	//initialzing currentAnimation
	this.sprite.currentAnimation='run_left'
	
	//initializing state
	this.state='idle_right'
	
	//gravity related stuff
	this.gravity=0
	
	
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
		 //checks is the currentAnimation is similar to the current state
		if (this.sprite.currentAnimation!=this.state) {
			//sets the currentAnimatiom var to the state value
			this.sprite.currentAnimation=this.state
			
			//sets the state animation to the sprite
			this.sprite.textures=this.anims.animations[this.state.split('_')[0]]
			
			//plays the animation
			this.sprite.play()
			//this switch statement flips the sprite according to the direction and sets the speed and looping
			switch (this.state) {
	case 'run_right':
		this.sprite.animationSpeed = 0.25
		this.sprite.loop=true
		this.flip_h('right')
		break;
	case 'run_left':
		this.sprite.loop=true
		this.sprite.animationSpeed = 0.25
		this.flip_h('left')
		break;
	case 'idle_left':
		this.sprite.animationSpeed = 0.125
		this.flip_h('left')
		break;
	case 'idle_right':
		this.sprite.animationSpeed = 0.125
this.flip_h('right')
		break;
	
	
}
		}
		//checks if the player is touching the floor or not
		if (isColliding({x:this.sprite.x-32*this.sprite.scale.y,y:this.sprite.y-32*this.sprite.scale.y,width:64*this.sprite.scale.y,height:64*this.sprite.scale.y},{x:floor.x,y:floor.y,width:1280,height:50})) {
			this.velocity.y=0
		}else{
			//incresing the y velocity according to the gravity
			this.velocity.y += this.gravity
		}
		//moving the player according to the his velocity
		this.sprite.x+=this.velocity.x*sec
		this.sprite.y-=this.velocity.y*sec
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
		switch (direction) {
			case 'right':
				this.velocity.x=this.speed
				this.state='run_right'
				break;
			case 'left':
				this.velocity.x=-this.speed
				this.state='run_left'
				break;
		}
	}
	idle(){
		switch (this.state.split('_')[1]) {
	case 'right':
		this.velocity.x = 0
		this.state = 'idle_right'
		break;
	case 'left':
		this.velocity.x = 0
		this.state = 'idle_left'
		break;
}
	}
	//getters and setters
	set x(val){
		this.sprite.x=val
	}
	get y(){
		return this.sprite.x
	}
	set y(val){
		this.sprite.y=val
	}
	get y(){
		return this.sprite.y
	}
}
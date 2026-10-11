let player
let enemyPlayer
let floor
let app
let world

let startGame=async ()=>{
	//adding class "hidden" to ui-1 and removing it from ui-2
	document.querySelector('.ui-2').removeAttribute('hidden')
document.querySelector('.ui-1').setAttribute('hidden','')
	
	
	
	
	//setting things up
	app = new PIXI.Application()
await app.init({ resizeTo: window, autoDensity: true, resolution: window.devicePixelRatio || 1 ,backgroundColor:0xffffff})
PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest'
document.querySelector('.ui-2').appendChild(app.canvas);


//creating A container to create a camera effect
 world=new PIXI.Container()
app.stage.addChild(world)

//loading texture and jsons
let anims=await PIXI.Assets.load('player.json')
let floorImg=await PIXI.Assets.load('floor.png')


//creating the main player
player=new Player(world,anims,app)
player.gravity=-10
//creating the opponent player
enemyPlayer=new Player(world,anims,app)


floor=new PIXI.Sprite(floorImg)
world.addChild(floor)
floor.y=720

app.ticker.add(() => {
	world.x = -player.x+window.innerWidth/2
	world.y = -player.y+window.innerHeight/2
})

/*window.onclick=()=>{
	if (player.state=='run-right') {
		player.run('left')
	}else if(player.state=='run-left'){
		player.run('right')
	}
}*/
}
startGame()
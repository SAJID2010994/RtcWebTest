let player
let enemyPlayer
let floor
let app
let world
let shakeOffset={x:0,y:0}

//this var stores all the textures
let textures={}


//sounds
let sounds={
	
}


//this function loads all the textures and sfxs
async function loadAll() {
	textures.anims = await PIXI.Assets.load('textures/player.json')
 textures.floorImg = await PIXI.Assets.load('textures/floor.png')
textures.lightPng = await PIXI.Assets.load('textures/light.png')


 sounds.dash = new Howl({
	src: ['sounds/dash.wav'], // browser picks the first it supports
	volume: 0.8,
	loop: false,
});


}



let startGame=async ()=>{
	//adding class "hidden" to ui-1 and removing it from ui-2
	document.querySelector('.ui-2').removeAttribute('hidden')
document.querySelector('.ui-1').setAttribute('hidden','')
	
	
	
	
	
	
	//setting things up
	app = new PIXI.Application()
await app.init({ resizeTo: window, autoDensity: true, resolution: window.devicePixelRatio || 1 ,backgroundColor:0x135B66})
PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest'
document.querySelector('.ui-2').appendChild(app.canvas);

createJoystick()
//creating A container to create a camera effect
 world=new PIXI.Container()
app.stage.addChild(world)
//loading texture and jsons


//creating the main player
player=new Player(world,textures.anims,app)
player.gravity=-10
//creating the opponent player
enemyPlayer=new Player(world,textures.anims,app)
enemyPlayer.y=720-128

floor=new PIXI.Sprite(textures.floorImg)
world.addChild(floor)
floor.y=720
//world.scale=0.5


let indicator=new playerHealthIndicator(app,player,{x:10,y:10})
let enemyIndicator = new playerHealthIndicator(app,enemyPlayer,{x:window.innerWidth-100,y:10})


const debug = new HitboxDebug(app, world, [player, enemyPlayer]);

world.scale=0.5
let worldScale=world.scale.x

//CameraShake(5,10,5000)
app.ticker.add(() => {
	world.x = ((-player.x*worldScale)+window.innerWidth/2)+shakeOffset.x
	world.y = ((-player.y*worldScale)+window.innerHeight/2)-shakeOffset.y
	
	if (player.health<=0 || enemyPlayer.health<=0) {
		player.health=100
		enemyPlayer.health=100
	} 
	
})


}

loadAll().then(()=>{
	//startGame()
})







//these codes prevent the context menu from opening and enters fullscreen mode
document.addEventListener('contextmenu', e => {
	if (e.target.tagName === 'IMG') e.preventDefault();
});

document.querySelectorAll('img').forEach(img => {
	img.setAttribute('draggable', 'false');
});
/*window.ondblclick=()=>{
	document.documentElement.requestFullscreen();
}*/
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
sounds.punch= new Howl({
	src: ['sounds/punch.wav'],
	sprite: {
		hit1: [10, 400], 
		hit2: [500, 300],
	},
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
const DESIGN_W = 1280*5;
const DESIGN_H = 720;

 world=new pixi_viewport.Viewport({
	screenWidth: app.screen.width,
	screenHeight: app.screen.height,
	worldWidth: 1280,
	worldHeight: 1000,
	events: app.renderer.events,
});
app.stage.addChild(world)


function resize() {
	world.resize(app.screen.width, app.screen.height, DESIGN_W, DESIGN_H);
	world.fit(true, DESIGN_W, DESIGN_H);
	world.moveCenter(DESIGN_W / 2, DESIGN_H / 2);
}

//app.renderer.on('resize', resize);
//resize();

//loading texture and jsons


//creating the main player

createMainPlayer(world,textures.anims,app)

player.gravity=-10
//creating the opponent player
createEnemyPlayer(world,textures.anims,app)

floor=new PIXI.Sprite(textures.floorImg)
world.addChild(floor)
floor.scale.x=100
floor.y=720
//world.scale=0.5


let indicator=new playerHealthIndicator(app,player,{x:10,y:10})
let enemyIndicator = new playerHealthIndicator(app,enemyPlayer,{x:window.innerWidth-100,y:10})



const layers = [];
const defs = [
	{ src: 'textures/layer-0-sky.png', speed: 0, fit: 'cover', align: 'top' },
	{ src: 'textures/layer-1-crystals.png', speed: 0.2, fit: 'height', align: 'bottom' },
	{ src: 'textures/layer-2-city.png', speed: 0.5, fit: 'height', align: 'bottom' },
	{ src: 'textures/layer-3-city.png', speed: 1, fit: 'height', align: 'bottom' },
];

// world scroll position (update from your player/camera)/*
const camera = { x: 0 };
/*
async function createParallax(app) {
   
	for (let i = 0; i < defs.length; i++) {
		const d = defs[i];
		const texture = await PIXI.Assets.load(d.src);
		
		const sprite = new PIXI.TilingSprite({
			texture,
			width: app.screen.width,
			height: texture.height,
		});
		
		app.stage.addChildAt(sprite, i);
		layers.push({ sprite, ...d });
	}
	
	layoutLayers(app);
	app.renderer.on('resize', () => layoutLayers(app));
	
	app.ticker.add(() => {
		for (const l of layers) {
      if(l==layers[0]) continue;
			l.sprite.tilePosition.x = world.x * l.speed +shakeOffset.x;
      l.sprite.tilePosition.y=shakeOffset.y
		}
	});
}

function layoutLayers(app) {
	const W = app.screen.width;
	const H = app.screen.height;
	
	for (const l of layers) {
		const tex = l.sprite.texture;
		
		const scale =
			l.fit === 'cover' ?
			Math.max(W / tex.width, H / tex.height) :
			H / tex.height;
		
		l.sprite.tileScale.set(scale);
		l.sprite.width = W;
		l.sprite.height = tex.height * scale;
		
		l.sprite.y = l.align === 'top' ? 0 : H - l.sprite.height;
	}
}

await createParallax(app);
*/
//let dashIndicator=new playerDashIndicator(app,player)

const debug = new HitboxDebug(app, world, [player, enemyPlayer]);
debug.enabled=false
world.scale=0.7
let worldScale=world.scale.x

//CameraShake(5,10,5000)
app.ticker.add(() => {
world.x +=shakeOffset.x;
world.y -=shakeOffset.y;



  
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
window.ondblclick=()=>{
	document.documentElement.requestFullscreen();
	//player.gotHit('left')
}



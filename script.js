let app
let texture
let myid
let move
let playerHashMap={}
let playerSprites=[]
let iceConfig = {
	iceServers: [
		{ urls: "stun:stun.cloudflare.com:3478" },
		{
			urls: [
				"turn:turn.cloudflare.com:3478?transport=udp",
				"turn:turn.cloudflare.com:3478?transport=tcp",
				"turns:turn.cloudflare.com:5349?transport=tcp"
			],
			username: "g05afd4e013e8557463bea3d4d41470d0adc5fe8c78aa095892fe975ac780b4e",
			credential: "c518271ff742c00025391b37255ec325d0483fefa54ee0ecb71fafc7d8dccdb3"
		}
	]
}
let velocity={x:0,y:0}
let connection
let hostId
let peer=new Peer({config:iceConfig})
let host=prompt('wanna be the host?')
if (host !='yes') {
	hostId=prompt('Enter host id:')
	connection=peer.connect(hostId)
	 	connection.on('open', () => {
 		addChild(hostId)
 		connection.on('data', data => {
 			UpdatePlayer(conn.peer, data)
 		})
 	})
}
function addPlayer(id) {
	playerHashMap[name]=playerSprites.length
	let sprite=new PIXI.Sprite(texture)
	playerSprites.push(sprite)
	app.stage.addChild(sprite)
	
}
function UpdatePlayer(id,pos) {
	playerSprites[playerHashMap[id]].x=pos.x
	playerSprites[playerHashMap[id]].y=pos.y
}
let joystick=nipplejs.create({
	
	mode: 'static',
	position: { left: '100px', bottom: "100px" },
	color: 'white',
	size: 120,
	className: 'abc',
	restOpacity: 1,
});
let speed=3;
joystick.on('move',(evt,data)=>{
	move=true
	velocity.x=data.vector.x*speed
	velocity.y=data.vector.y*speed
})
joystick.on('end',e=>{
	move=false
});
(async () =>{
 app = new PIXI.Application()
await app.init({ resizeTo: window, autoDensity: true, resolution: window.devicePixelRatio || 1 })
document.body.appendChild(app.view)
 texture=await PIXI.Assets.load('rect.png')
 peer.on('open',e=>{
 	myid=e
 	if (host=='yes') {
 		alert(e)
 	}
 	addPlayer(e)
 })
peer.on('connection',conn=>{
 	peer.on('open',()=>{
 		connection=conn
 		addChild(conn.peer)
 		peer.on('data',data=>{
 			UpdatePlayer(conn.peer,data)
 		})
 	})
 })
 app.ticker.add(()=>{
 	if (move==true) {
 	playerSprites[0].x+=velocity.x
 	playerSprites[0].y-=velocity.y
 	if (connection) {
connection.send({x:playerSprites[0].x,y:playerSprites[0].y})
 	}
 	}
 })
})()
let app
let texture
let myid
let audioElement=document.querySelector('#audio')
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
let localStream
navigator.mediaDevices.getUserMedia({audio:true}).then(ztream=>{
	localStream=ztream
})
let call
let hostId
let peer=new Peer({debug:3,config:iceConfig})
let host=prompt('wanna be the host?')
if (host !='yes') {
	document.querySelector('button').onclick=()=>{
		hostId=document.querySelector('#hostId').value
		
		call = peer.call(hostId, localStream)
call.on('stream',remStream=>{
			audioElement.srcObject = remStream
			
		})
		connection = peer.connect(hostId)
connection.on('open', () => {
	addPlayer(hostId)
	connection.on('data', data => {
		UpdatePlayer(1, data)
	})
})
	}
	
}
function addPlayer(id) {
	playerHashMap[name]=playerSprites.length
	let sprite=new PIXI.Sprite(texture)
	playerSprites.push(sprite)
	app.stage.addChild(sprite)
	
}
function findDistance(pos1,pos2) {
	return Math.sqrt(Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2))
}
function getAudioVolume(distance) {
	if ((distance/64)<=1) {
		return 1;
	} else {
		return 1/(Math.pow(distance/64))
	}
}
function UpdatePlayer(no,pos) {
	playerSprites[no].x=pos.x
	playerSprites[no].y=pos.y
}
let joystick=nipplejs.create({
	zone:document.querySelector('.a'),
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
 		document.querySelector('label').innerText+=e
 	}
 	addPlayer(e)
 })
peer.on('connection',conn=>{

 	conn.on('open',()=>{
 		alert(conn.peer)
 		connection=conn
 		addPlayer(conn.peer)
 		conn.on('data',data=>{
 			UpdatePlayer(1,data)
 		})
 	})
 })
 peer.on('call',call=>{
 	call.answer(localStream)
 	call.on('stream',remStream=>{
 		audioElement.srcObject = remStream

 	})
 })
 app.ticker.add(()=>{
 	if (move==true) {
 	playerSprites[0].x+=velocity.x
 	playerSprites[0].y-=velocity.y
 	if (connection) {
 		audioElement.volume=getAudioVolume(findDistance({x:playerSprites[0].x,y:playerSprites[0].y},{x:playerSprites[1].x,y:playerSprites[1].y}))
connection.send({x:playerSprites[0].x,y:playerSprites[0].y})
 	}
 	}
 })
})()
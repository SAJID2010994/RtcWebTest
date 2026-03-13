const iceConfig = {
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
};
let name=prompt('Enter you name!!')
let host=prompt('Do u wanna be the host??')
let peer=new Peer({debug:3,config:iceConfig})
let connections={}
let sendBtn=document.querySelector('#button')
let msgBox=document.querySelector('#msg')

peer.on('open',id=>{
	document.getElementById('id').innerText+=id
})
function broadCast(senderId,msg) {
	Object.keys(connections).forEach(e=>{
		if(e!=senderId){
			connections[e].send(msg)
		}
	})
}
function display(from,msg) {
	document.querySelector('.remoteMsg').innerHTML+=`<label>${from}:${msg}</label>`
}
if (host =='true') {
	peer.on('connection',conn=>{
		conn.on('open',()=>{
			alert('connection opened')
			connections[conn.peer]=conn
			sendBtn.onclick = () => {
				display('You',msgBox.value)
	broadCast('',{from:name,msg:msgBox.value})
	msgBox.value = null
}
			conn.on('data',data=>{
				display(data.from,data.msg)
				broadCast(conn.peer,data)
			})
		})
	})
}else{
	
	document.querySelector('.nonHost').removeAttribute('hidden')
	document.querySelector('.nonHost button').onclick=()=>{
		let conn = peer.connect(document.querySelector('.nonHost input').value)
conn.on('open', () => {
	alert('connection opened')
	sendBtn.onclick = () => {
		display('You', msgBox.value)
		conn.send({ from: name, msg: msgBox.value })
		msgBox.value = null
	}
	conn.on('data', data => {
		display(data.from, data.msg)
	})
})
	}
	
}


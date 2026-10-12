let amItheHost=null
let hostId
let myId
let peer
//config for the peer
let config={config:{
	iceServers: [
		{ urls: "stun:stun.cloudflare.com:3478" },
		{
			urls: "turn:turn.cloudflare.com:3478?transport=udp",
			username: "g05afd4e013e8557463bea3d4d41470d0adc5fe8c78aa095892fe975ac780b4e",
			credential: "c518271ff742c00025391b37255ec325d0483fefa54ee0ecb71fafc7d8dccdb3"
		},
		{
			urls: "turn:turn.cloudflare.com:3478?transport=tcp",
			username: "g05afd4e013e8557463bea3d4d41470d0adc5fe8c78aa095892fe975ac780b4e",
			credential: "c518271ff742c00025391b37255ec325d0483fefa54ee0ecb71fafc7d8dccdb3"
		},
		{
			urls: "turns:turn.cloudflare.com:5349?transport=tcp",
			username: "g05afd4e013e8557463bea3d4d41470d0adc5fe8c78aa095892fe975ac780b4e",
			credential: "c518271ff742c00025391b37255ec325d0483fefa54ee0ecb71fafc7d8dccdb3"
		}
	]
}}
	
//dom elements
let hostIdTextBox=document.getElementById('hostId')
	
//the connection with the other peer will be stored here
let conn

//this function will send the other player our state
function sendState(conn) {
	conn.send({
		x:player.x,
		y:player.y,
		state:player.state,
		direction:player.direction
	})
}

//this function will do the stuffs after reciving the data from the other player
function analyzeData(data) {
	enemyPlayer.state=data.state
	enemyPlayer.direction=data.direction
	enemyPlayer.x=data.x
	enemyPlayer.y=data.y
	
}


//when the connection between the two peers establishes sucessfully this function will send data to the other peer and analyze received data from the other peer
//And this function also starts the game
function CallWhenConnectionOpenes(conn) {
		//starts the game
			startGame().then(()=>{
//this loop will continiously send our states to the other player
			setInterval(()=>{
				sendState(conn)
			},33)
			
//this callback gets called when our peer receives data from the other peer
			conn.on('data',data=>{
				analyzeData(data)
			})
			
			
			
			})
			

			
}


//this function will be called when the player presses the join button
function join(hostId) {
	hostId=hostId
	amItheHost=false
	//creates a new peer
	peer=new Peer(config)
	console.log(hostId)
	//callback when the peer id received
	peer.on('open',id=>{
		myId=id
		//trying to connect with the host peer
		conn = peer.connect(hostId)
		
		//callback when successfully connected with the host peer
		conn.on('open',()=>{
			CallWhenConnectionOpenes(conn)
		})
	})
	
}



//thus function will be called when the player presses the host button
function host() {
	amItheHost=true
	
	peer=new Peer(config)
	
	peer.on('open',id=>{
		myId=id
		hostIdTextBox.value=id
	})
	peer.on('connection',conn=>{
		conn=conn
		conn.on('open',()=>{
			CallWhenConnectionOpenes(conn)
		})
	})
}
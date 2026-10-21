let joystick
function createJoystick() {
	joystick = nipplejs.create({
	zone: document.querySelector('.zone'),
	mode: 'static',
	position: { left: '100px', bottom: "100px" },
	color: 'black',
	size: 120,
	className: 'abc',
	restOpacity: 1,
});
let isRunning=false
let direction='right'
joystick.on('move', (evt, data) => {
	try {
		isRunning=true
		direction=data.direction.angle
	} catch (e) {}
})
joystick.on('end', e => {
	isRunning=false
	player.idle()
});
setInterval(()=>{
	if (isRunning) {
		player.run(direction)
		CameraShake(0.7,16,50)
	}
},70)



}

//Accessing thr don elems
let dashBtn=document.getElementById('dash')
let punchBtn=document.getElementById('punch')

//responsing to the clicks of the buttons


//dash
dashBtn.addEventListener("touchstart", e => {
	e.preventDefault();
	player.dash();
}, { passive: false });

//punch
punchBtn.ontouchstart=()=>{
	player.punch()
}
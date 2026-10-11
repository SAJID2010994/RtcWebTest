let joystick = nipplejs.create({
	zone: document.querySelector('.ui-2'),
	mode: 'static',
	position: { left: '100px', bottom: "100px" },
	color: 'black',
	size: 120,
	className: 'abc',
	restOpacity: 1,
});
joystick.on('move', (evt, data) => {
	try {
		
		player.run(data.direction.angle)
	}catch (e) {}
})
joystick.on('end', e => {
	player.idle()
});
function lerp(a, b, t) {
	return a + (b - a) * t;
}

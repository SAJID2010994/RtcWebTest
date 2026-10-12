function isColliding(obj1, obj2) {
	if (obj1.x + obj1.width > obj2.x && obj2.x + obj2.width > obj1.x && obj1.y + obj1.height > obj2.y && obj2.y + obj2.height > obj1.y) {
		return true
	}
	else {
		return false
	}
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function CameraShake(intensity,speed,time){
	let currentPerformance
	let test=0
	let shakeInterval=setInterval(()=>{
		currentPerformance=performance.now()
		shakeOffset.x=Math.sin(currentPerformance*40)*intensity
		shakeOffset.y=Math.cos(currentPerformance*50)*intensity
	},speed)
	setTimeout(()=>{
		console.log('sk')
		clearInterval(shakeInterval)
		shakeOffset={x:0,y:0}
	},time)
}
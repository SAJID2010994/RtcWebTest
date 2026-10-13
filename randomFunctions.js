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
function isCollidingPlayers(p1, p2) {
	const s1 = p1.sprite;
	const s2 = p2.sprite;
	
	const s1HitboxX=s1.x+p1.hitBox.x
	const s1HitboxY=s1.y+p1.hitBox.y
	
	const s2HitboxX = s2.x + p2.hitBox.x
const s2HitboxY = s2.y + p2.hitBox.y
	
	
	
	const w1 = p1.hitBox.width * Math.abs(s1.scale.x);
	const h1 = p1.hitBox.height * Math.abs(s1.scale.y);
	const w2 = p2.hitBox.width * Math.abs(s2.scale.x);
	const h2 = p2.hitBox.height * Math.abs(s2.scale.y);
	
	return (
		Math.abs(s1HitboxX - s2HitboxX) < (w1 + w2) / 2 &&
		Math.abs(s1HitboxY - s2HitboxY) < (h1 + h2) / 2
	);
}
class HitboxDebug {
	constructor(app, container, players) {
		this.players = players;
		this.enabled = true;
		
		this.gfx = new PIXI.Graphics();
		this.gfx.zIndex = 9999;
		container.sortableChildren = true;
		container.addChild(this.gfx);
		
		window.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() === "h") {
				this.enabled = !this.enabled;
				if (!this.enabled) this.gfx.clear();
			}
		});
		
		app.ticker.add(() => this.draw());
	}
	
	draw() {
		if (!this.enabled) return;
		const g = this.gfx;
		g.clear();
		
		for (const p of this.players) {
			const s = p.sprite;
			const hitBox={x:s.x+p.hitBox.x,y:s.y+p.hitBox.y}
			const w = p.hitBox.width * Math.abs(s.scale.x);
			const h = p.hitBox.height * Math.abs(s.scale.y);
			
			const hit = this.players.some((o) => o !== p && isCollidingPlayers(p, o));
			const color = hit ? 0x00ff00 : 0xff0000;
			
			if (g.rect) {
				g.rect(hitBox.x - w / 2, hitBox.y - h / 2, w, h).stroke({ width: 2, color });
				g.circle(hitBox.x, hitBox.y, 2).fill(color);
			} else {
				g.lineStyle(2, color).drawRect(hitBox.x - w / 2, hitBox.y - h / 2, w, h);
				g.beginFill(color).drawCircle(hitBox.x, hitBox.y, 2).endFill();
			}
		}
	}
}
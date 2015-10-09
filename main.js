var render;
var mouse = {}
var keyboard = {}
var width = 800;
var height = 400;
var stretch = 1;

mouse.mouseOffsetX = 0;
mouse.mouseOffsetY = 0;
mouse.mouseTrueDrag = false;
mouse.defaultEnabled = false;
mouse.drag = 0;
mouse.x = -1;
mouse.y = -1;
mouse.startX = -1;
mouse.startY = -1;

keyboard.defaultEnabled = true;
keyboard.left = 0;
keyboard.up = 0;
keyboard.right = 0;
keyboard.down = 0;
keyboard.space = false;
keyboard.shift = false;
keyboard.enter = false;
keyboard.back = false;
keyboard.tab = false;
keyboard.command = false;
keyboard.alt = false;

function eventLoad (e) {
	
	render = document.createElement("canvas").getContext("2d");
	
	document.body.appendChild(render.canvas);
	
	document.body.style.position = "absolute";
	document.body.style.left = "0";
	document.body.style.op = "0";
	document.body.style.width = "100%";
	document.body.style.height = "100%";
	document.body.style.margin = "0";
	document.body.style.padding = "0";
	
	document.body.addEventListener("keydown", eventKeyPress, false);
	document.body.addEventListener("keyup", eventKeyRelease, false);
	
	if (typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1) {
		
		document.body.addEventListener("touchstart", eventTouchStart, false);
		document.body.addEventListener("touchmove", eventTouchDrag, false);
		document.body.addEventListener("touchend", eventTouchRelease, false);
		
	} else {
		
		document.body.addEventListener("mousedown", eventMousePress, false);
		document.body.addEventListener("mousemove", eventMouseMove, false);
		document.body.addEventListener("mouseup", eventMouseRelease, false);
		document.body.addEventListener("mouseout", eventBlur, false);
		
	}
	
	loaded();
	
	window.addEventListener("resize", eventResize, false);
	window.requestAnimationFrame(eventLoop);
	
	document.title = "Nutworks";
	
}

window.addEventListener("load", eventLoad, false);

function fitCanvas () {
	
	render.canvas.width = width * stretch;
	render.canvas.height = height * stretch;
	render.canvas.style.width = width + "px";
	render.canvas.style.height = height + "px";
	render.canvas.style.position = "absolute";
	render.canvas.style.left = "50%";
	render.canvas.style.top = "50%";
	render.canvas.style.marginLeft = -0.5 * width + "px";
	render.canvas.style.marginTop = -0.5 * height + "px";
	
	render.setTransform(stretch, 0, 0, stretch, 0, 0);
	
}

function loadFile (file, callback, data) {
	
	var req = new XMLHttpRequest();
	
	req.open("POST", file, true);
	req.setRequestHeader("Content-type", "application/json");
	req.addEventListener("readystatechange", (function () {
		
		if (req.readyState == 4 && req.status == 200) {
			
			callback(req);
			
		}
		
	}), false);
	req.send(JSON.stringify(data));
	
}

function eventKeyPress (e) {
	
	var i = e.keyCode;
	
	if (i == 91 || i == 93 || e.metaKey) keyboard.command = true;
	
	if (!keyboard.defaultEnabled || i == 9) e.preventDefault();
	
	if (i == 16) keyboard.shift = true;
	if (i == 9) keyboard.tab = true;
	if (i == 8 || i == 46) keyboard.back = true;
	if (i == 32) keyboard.space = true;
	if (i == 13) keyboard.enter = true;
	if (i == 18) keyboard.alt = true;
	
	if (i == 37 || i == 65) keyboard.left = 1;
	if (i == 39 || i == 68) keyboard.right = 1;
	if (i == 38 || i == 87) keyboard.up = 1;
	if (i == 40 || i == 83) keyboard.down = 1;
	
	if (!keyboard.defaultEnabled || i == 9) e.preventDefault();
	
}

function eventKeyRelease (e) {
	
	var i = e.keyCode;
	
	if (i == 91 || i == 93 || e.metaKey) keyboard.command = false;
	
	if (!keyboard.defaultEnabled || i == 9) e.preventDefault();
	
	if (i == 16) keyboard.shift = false;
	if (i == 9) keyboard.tab = false;
	if (i == 8 || i == 46) keyboard.back = false;
	if (i == 32) keyboard.space = false;
	if (i == 13) keyboard.enter = false;
	if (i == 18) keyboard.alt = false;
	
	if (i == 37 || i == 65) keyboard.left = 0;
	if (i == 39 || i == 68) keyboard.right = 0;
	if (i == 38 || i == 87) keyboard.up = 0;
	if (i == 40 || i == 83) keyboard.down = 0;
	
	if (!keyboard.defaultEnabled || i == 9) e.preventDefault();
	
}

function eventBlur (e) {
	
	var previousTarget = e.relatedTarget || e.toElement;
	
	if (!previousTarget || previousTarget.nodeName == "HTML") {
		
		mouse.mouseTrueDrag = false;
		
	}
	
}

function eventTouchStart (e) {
	
	mouse.mouseTrueDrag = true;
	
	mouse.drag = 1;
	mouse.x = e.touches[0].pageX - mouse.mouseOffsetX;
	mouse.y = e.touches[0].pageY - mouse.mouseOffsetY;
	mouse.startX = mouse.x;
	mouse.startY = mouse.y;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventTouchDrag (e) {
	
	mouse.x = e.changedTouches[0].pageX - mouse.mouseOffsetX;
	mouse.y = e.changedTouches[0].pageY - mouse.mouseOffsetY;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventTouchRelease (e) {
	
	mouse.mouseTrueDrag = false;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventMousePress (e) {
	
	mouse.mouseTrueDrag = true;
	
	mouse.drag = 1;
	mouse.startX = mouse.x;
	mouse.startY = mouse.y;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventMouseMove (e) {
	
	mouse.x = e.clientX - mouse.mouseOffsetX;
	mouse.y = e.clientY - mouse.mouseOffsetY;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventMouseRelease (e) {
	
	mouse.mouseTrueDrag = false;
	
	if (!mouse.defaultEnabled) e.preventDefault();
	
}

function eventResize () {
	
	var canvasClientRect = document.getElementsByTagName("canvas")[0].getBoundingClientRect();
	
	mouse.mouseOffsetX = +canvasClientRect.left;
	mouse.mouseOffsetY = +canvasClientRect.top;
	
}

function eventLoop () {
	
	if (!mouse.mouseTrueDrag) mouse.drag = 0;
	else mouse.drag++;
	
	loop();
	
	window.requestAnimationFrame(eventLoop);
	
}
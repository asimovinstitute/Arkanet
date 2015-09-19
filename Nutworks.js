var brain = [];

function loaded () {
	
	defineBrain(2, 4, 4, 1);
	
	for (var a = 0; a < 50000; a++) {
		
		var x = 100 * (Math.random() - 0.5);
		var y = 100 * (Math.random() - 0.5);
		
		train([x, y], func(x) < y ? -1 : 1);
		
	}
	
	fitCanvas();
	draw();
	
}

function func (x) {
	
	return 7 * x + 20;
	
}

function loop () {
	
	
}

function draw () {
	
	render.clearRect(0, 0, width, height);
	
	render.fillStyle = "#09f";
	render.fillRect(0, 0, width, height);
	
	render.strokeStyle = "rgba(0, 0, 0, 1)";
	
	for (var a = 0; a < brain.length - 1; a++) {
		
		for (var b = 0; b < brain[a].length; b++) {
			
			for (var c = 0; c < brain[a + 1].length; c++) {
				
				if (brain[a + 1][c].fixed) continue;
				
				render.lineWidth = Math.sqrt(Math.abs(brain[a][b].weight)) + 1;
				render.beginPath();
				render.moveTo(brain[a][b].x, brain[a][b].y);
				render.lineTo(brain[a + 1][c].x, brain[a + 1][c].y);
				render.stroke();
				
			}
			
		}
		
	}
	
	render.fillStyle = "#fff";
	render.beginPath();
	
	for (var a = 0; a < brain.length; a++) {
		
		for (var b = 0; b < brain[a].length; b++) {
			
			var r = 10;
			
			render.moveTo(brain[a][b].x + r, brain[a][b].y);
			render.arc(brain[a][b].x, brain[a][b].y, r, 0, 2 * Math.PI, false);
			
		}
		
	}
	
	render.fill();
	
}

function addLayer (n, i, min, max) {
	
	brain.push([]);
	
	if (brain.length < i) n++;
	
	for (var a = 0; a < n; a++) {
		
		brain[brain.length - 1].push({	fixed:a == n - 1 && brain.length < i,
										weight:min + Math.random() * (max - min),
										x:(brain.length) * (width / (i + 1)),
										y:(a + 1) * (height / (n + 1))});
		
	}
	
}

function defineBrain () {
	
	for (var a = 0; a < arguments.length; a++) {
		
		addLayer(arguments[a], arguments.length, -1, 1);
		
	}
	
}

function ask (values) {
	
	var sum = brain[0][brain[0].length - 1].weight;
	
	for (var a = 0; a < values.length; a++) sum += brain[0][a].weight * values[a];
	
	return 1 / (1 + Math.pow(Math.E, -sum));
	
}

function train (values, outcome) {
	
	var attempt = ask(values);
	var error = outcome - attempt;
	
	for (var a = 0; a < values.length; a++) brain[0][a].weight += 0.01 * values[a] * error;
	
}
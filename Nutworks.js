// ### variables
// flat array, contains all the cells (1 cell = 1 object = 1 array item) position is stored in properties.
var cells = [];

// the scalar applied to the random weights
var weightRange = 50;

// rgn seed
var seed = 1;

// amount of cells that get a random output value and random "last" (see ### cell creation) value assigned per tick
var impulseCount = 5;

// amount of cells that are updated per tick
var updateCount = 1000;

// scalar to the weight change (see ### cell updates)
var changeRate = 0.05;

// activation function. self explanetory i hope. input <-∞, ∞> output <0, 1> (note <> not inclusive)
// note the positive only values, so network will be most useful if measured through a linear output layer
function activate (x) {
	
	return 1 / (1 + Math.exp(-x));
	
}

// n: size of the "perfect grid" (see ### cell creation)
// gs: grid size for the axon building, maximum manhatten distance for connections/axons (see ### axon building)
// ssseeed: seed
function buildBrain (n, gs, ssseeed) {
	
	// (re-)set the seed, ssseeed pronounced as "SEEEEEED!"
	seed = ssseeed;
	
	// clear the cells, so that calling the function at runtime clears the current crap on the field
	cells = [];
	
	// margin from the edges, eye candy
	var m = 20;
	
	// ### cell creation
	// instead of plomping down the cells at random, we place the cells in a perfect grid, with a small offset.
	// looks random but gives a much more even distribution.
	for (var a = m + 0.5 * n; a < width - m; a += n) {
		
		for (var b = m + 0.5 * n; b < height - m; b += n) {
			
			var cell = {};
			
			// my position (the random offset from perfect grid thing)
			cell.x = a + 0.8 * (random() - 0.5) * n;
			cell.y = b + 0.8 * (random() - 0.5) * n;
			
			// my inputs
			cell.in = [];
			
			// my weights, same length as inputs
			cell.w = [];
			
			// accumulates the absolute weight delta of past updates
			cell.activity = 0;
			
			// output, init to random
			cell.out = random();
			
			// previous out value, init to output
			cell.last = cell.out;
			
			// importance is activity scaled to <0, 1>
			cell.importance = activate(-1 + cell.activity);
			
			cells.push(cell);
			
		}
		
	}
	
	// ### axon building
	// new variation on grid based collision detection:
	// use a grid with squares of size x
	// and a second grid to account for warping entities (on the edges) which
	// would normally occupy 2 or 4 cells. this "warp" grid has cells of size x as well
	// but all the entities are transposed by half of x. x in this case is in the "gs"
	// variable, as in grid size.
	var grid = [];
	var warp = [];
	
	for (var a = 0; a < width / gs + 1; a++) {
		
		grid[a] = [];
		warp[a] = [];
		
		for (var b = 0; b < height / gs + 1; b++) {
			
			grid[a][b] = [];
			warp[a][b] = [];
			
		}
		
	}
	
	// fastest way to determine the place in the grid/warp of each cell:
	// the floored position devided by the grid cell.
	// it works just like snapping, which is snap * _(x / snap)
	// if you leave out the multiplication you get the correct grid/warp position.
	for (var a = 0; a < cells.length; a++) {
		
		grid[Math.floor(cells[a].x / gs)][Math.floor(cells[a].y / gs)].push(a);
		warp[1 + Math.floor((cells[a].x - 0.5 * gs) / gs)][1 + Math.floor((cells[a].y - 0.5 * gs) / gs)].push(a);
		
	}
	
	// every cell is connected to all cells in the same grid or warp spot.
	// note that it's all doubly linked, cell a binds to b and b to a.
	for (var a = 0; a < grid.length; a++) {
		
		for (var b = 0; b < grid[0].length; b++) {
			
			for (var c = 0; c < grid[a][b].length; c++) {
				
				for (var d = 0; d < c; d++) {
					
					cells[grid[a][b][c]].in.push(grid[a][b][d]);
					cells[grid[a][b][d]].in.push(grid[a][b][c]);
					
				}
				
			}
			
			for (var c = 0; c < warp[a][b].length; c++) {
				
				for (var d = 0; d < c; d++) {
					
					cells[warp[a][b][c]].in.push(warp[a][b][d]);
					cells[warp[a][b][d]].in.push(warp[a][b][c]);
					
				}
				
			}
			
		}
		
	}
	
	// ### initial weights
	// now that we have a connected system, we now how many axons each cell has.
	// assign a random weight to each cell. weights can be negative.
	for (var a = 0; a < cells.length; a++) {
		
		for (var b = 0; b < cells[a].in.length; b++) {
			
			cells[a].w.push(random() * -weightRange + 0.5 * weightRange);
			
		}
		
	}
	
}

// bash head on keyboard style rgn. probably horribly repetitive and non-uniform but it works ok for most things.
function random () {
	
	seed = 312541332155 * (4365216455 + seed) % 7654754253243312;
	
	return 0.0000001 * (seed % 10000000);
	
}

function loaded () {
	
	// ### input crap
	// from the boilerplate main.js, allows right clicking and dragging and stuffs.
	mouse.defaultEnabled = true;
	
	// input crap
	var texts = ["Update count ", "Random activations ", "Weight change rate "];
	
	for (var a = 0; a < 3; a++) {
		
		// more input crap
		inputs[a] = document.createElement("input");
		inputs[a].type = "range";
		inputs[a].step = 0.1;
		inputs[a].min = 0;
		inputs[a].max = 100;
		inputs[a].defaultValue = a == 0 ? 33.3 : a == 1 ? 2.2 : 5;
		inputs[a].style.display = "inline-block";
		
		// dom crap
		document.body.style.font = "20px Geneva";
		document.body.appendChild(document.createTextNode(texts[a]));
		document.body.appendChild(inputs[a]);
		document.body.appendChild(document.createElement("br"));
		
	}
	
	// boiler plate stuff again, for the canvas
	width = 1000;
	height = 500;
	fitCanvas();
	
	// works best with parameters like (x, 1.8ish * x, y)
	buildBrain(30, 55, 1);
	
}

// each frame, default vsynced 60hz
function loop () {
	
	// based on input sliders for now
	updateCount = inputs[0].value * inputs[0].value;
	impulseCount = +inputs[1].value;
	changeRate = 0.01 * inputs[2].value;
	
	// ### random triggers
	// randomly mess with cells, slider value
	for (var a = 0; a < impulseCount; a++) {
		
		cells[Math.floor(random() * cells.length)].out = random();
		cells[Math.floor(random() * cells.length)].last = random();
		
	}
	
	// ### cell updates
	// pick updateCount number of random cells, change out to activate(∑ iw)
	// updateCount is slider based
	for (var a = 0; a < updateCount; a++) {
		
		var c = cells[Math.floor(random() * cells.length)];
		var sum = 0;
		
		for (var b = 0; b < c.in.length; b++) {
			
			sum += cells[c.in[b]].out * c.w[b];
			
			// change every weight according to importance (activity based) and output,
			// both shifted to a <-0.5, 0.5> range, scaled by the changeRate (slider value as well)
			c.w[b] += changeRate * (c.importance - 0.5) * (c.out - 0.5);
			
		}
		
		c.out = activate(sum);
		
		// every frame, increase activity by current output compared to previous output
		// so flickering cells are highly active cells. active cells are not cells that are firing,
		// nor cells that have a particular high or low output.
		c.activity += Math.abs(c.out - c.last);
		// constantly reduce the activity, so that activity slowly declines if it's not actively switching
		c.activity /= 1.05;
		
		// activity brought down to <0, 1>
		c.importance = activate(-1 + c.activity);
		
		c.last = c.out;
		
	}
	
	// ### rendering
	render.clearRect(0, 0, width, height);
	// in case of little to no experience with css: # indicates hexidecimal color code,
	// shorthand is to provide 3 digits which will then be copied. so #rgb, making #f0f pink for example.
	render.fillStyle = "#000";
	render.fillRect(0, 0, width, height);
	// get your shit straight html5 spec, stroke or line, pick one term and stick with it.
	// but nooo let's use different terms. watcha gonna dew.
	render.lineWidth = 1;
	render.strokeStyle = "#333";
	
	var x;
	
	// draw all the lines in one go for efficiency (canvas doesn't like lines, especially thick ones)
	render.beginPath();
	
	for (var a = 0; a < cells.length; a++) {
		
		x = cells[a];
		
		for (var b = 0; b < x.in.length; b++) {
			
			if (x.in[b] > a - 1) continue;
			
			render.moveTo(cells[x.in[b]].x, cells[x.in[b]].y);
			render.lineTo(x.x, x.y);
			
		}
		
	}
	
	// done
	render.stroke();
	
	// draw all the cells one by one, after drawing the lines
	for (var a = 0; a < cells.length; a++) {
		
		x = cells[a];
		
		// red channel is output, green channel is importance, blue channel unused
		render.fillStyle = "rgb(" + Math.floor(255 * x.out) + ", " + Math.floor(255 * x.importance) + ", 0)";
		render.beginPath();
		// cell size is also based on importance for clarity
		render.arc(x.x, x.y, 6 * x.importance, 0, 2 * Math.PI, false);
		render.fill();
		
	}
	
}
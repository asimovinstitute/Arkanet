(function () {
	
	// n: size of the "perfect grid" (see ### cell creation)
	// gs: grid size for the axon building, maximum manhatten distance for connections/axons (see ### axon building)
	// seed: seed
	// update count: update all cells n times
	// change rate: see below
	Brain = function (n, gs, seed, updateCount, changeRate) {
		
		// the scalar applied to the random weights
		this.cells = [];
		
		// starting weight range
		this.weightRange = 50;
		
		// random seed
		this.seed = seed;
		
		// amount of iterations to update all cells
		this.updateCount = updateCount;
		
		// chance of a cell to output noise
		this.impulseCount = 0;
		
		// scalar to the weight change (see ### cell updates)
		this.changeRate = changeRate;
		
		this.buildBrain(n, gs, seed);
		
	};
	
	// activation function. self explanetory i hope. input <-∞, ∞> output <0, 1> (note <> not inclusive)
	// note the positive only values, so network will be most useful if measured through a linear output layer
	Brain.prototype.activate = function (x) {
		
		return 1 / (1 + Math.exp(-x));
		
	};
	
	
	Brain.prototype.buildBrain = function (n, gs, seed) {
		
		// (re-)set the seed
		this.seed = seed;
		
		// clear the cells, so that calling the function at runtime clears the current crap on the field
		this.cells = [];
		
		// margin from the edges, eye candy
		var m = 20;
		
		// ### cell creation
		// instead of plomping down the cells at random, we place the cells in a perfect grid, with a small offset.
		// looks random but gives a much more even distribution.
		for (var a = m + 0.5 * n; a < width - m; a += n) {
			
			for (var b = m + 0.5 * n; b < height - m; b += n) {
				
				var cell = {};
				
				// my position (the random offset from perfect grid thing)
				cell.x = a + 0.8 * (this.random() - 0.5) * n;
				cell.y = b + 0.8 * (this.random() - 0.5) * n;
				
				// my inputs
				cell.in = [];
				
				// my weights, same length as inputs
				cell.w = [];
				
				// accumulates the absolute weight delta of past updates
				cell.activity = 0;
				
				// output, init to random
				cell.out = this.random();
				
				// previous out value, init to output
				cell.last = cell.out;
				
				// importance is activity scaled to <0, 1>
				cell.importance = this.activate(-1 + cell.activity);
				
				this.cells.push(cell);
				
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
		
		// the quick brown fox jumps over the lazy shorthand
		var cells = this.cells;
		
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
				
				cells[a].w.push(this.random() * -this.weightRange + 0.5 * this.weightRange);
				
			}
			
		}
		
	};
	
	// bash head on keyboard style rgn. probably horribly repetitive and non-uniform but it works ok for most things.
	Brain.prototype.random = function () {
		
		this.seed = 312541332155 * (4365216455 + this.seed) % 7654754253243312;
		
		return 0.0000001 * (this.seed % 10000000);
		
	}
	
	Brain.prototype.update = function () {
		
		// ### cell updates
		// change out to activate(∑ iw) unless random [0, 1> > impulseCount
		// updateCount is slider based
		for (var a = 0; a < this.updateCount; a++) {
			
			for (var d = 0; d < this.cells.length; d++) {
				
				var c = this.cells[d];
				
				if (this.random() > this.impulseCount) {
					
					var sum = 0;
					
					for (var b = 0; b < c.in.length; b++) {
						
						sum += this.cells[c.in[b]].out * c.w[b];
						
						// change every weight according to importance (activity based) and output,
						// both shifted to a <-0.5, 0.5> range, scaled by the changeRate (slider value as well)
						c.w[b] += this.changeRate * (c.importance - 0.5) * (c.out - 0.5);
						
					}
					
					c.out = this.activate(sum);
					
				} else {
					
					c.out = this.random();
					
				}
				
				// every frame, increase activity by current output compared to previous output
				// so flickering cells are highly active cells. active cells are not cells that are firing,
				// nor cells that have a particular high or low output.
				c.activity += Math.abs(c.out - c.last);
				// constantly reduce the activity, so that activity slowly declines if it's not actively switching
				c.activity /= 1.05;
				
				// activity brought down to <0, 1>
				c.importance = this.activate(-1 + c.activity);
				
				c.last = c.out;
				
			}
			
		}
		
	};
	
})();

var brain;
var output;

function loaded () {
	
	// boiler plate stuff, for the canvas
	width = 1000;
	height = 500;
	fitCanvas();
	
	// works best with parameters like (x, 1.8ish * x, y)
	brain = new Brain(30, 55, 3, 1, 0.1);
	
	// output @captain obvious
	output = document.createElement("div");
	output.style.font = "15px monospace";
	output.style.margin = "15px";
	output.style.whiteSpace = "pre";
	
	document.body.appendChild(output);
	
}

// each frame, default vsynced 60hz
function loop () {
	
	brain.update();
	
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
	
	for (var a = 0; a < brain.cells.length; a++) {
		
		x = brain.cells[a];
		
		for (var b = 0; b < x.in.length; b++) {
			
			if (x.in[b] > a - 1) continue;
			
			render.moveTo(brain.cells[x.in[b]].x, brain.cells[x.in[b]].y);
			render.lineTo(x.x, x.y);
			
		}
		
	}
	
	// done
	render.stroke();
	
	// draw all the cells one by one, after drawing the lines
	for (var a = 0; a < brain.cells.length; a++) {
		
		x = brain.cells[a];
		
		// red channel is output, green channel is importance, blue channel unused
		render.fillStyle = "rgb(" + Math.floor(255 * x.out) + ", " + Math.floor(255 * x.importance) + ", 0)";
		render.beginPath();
		// cell size is also based on importance for clarity
		render.arc(x.x, x.y, 8 * x.importance, 0, 2 * Math.PI, false);
		render.fill();
		
	}
	
	// ### measuring
	// measure and print stuff, like the sum of the importance, activity and other stuff.
	
	var out = "";
	var totalActivity = 0;
	var totalAbsoluteOutput = 0;
	var totalOutput = 0;
	var totalImportance = 0;
	
	for (var a = 0; a < brain.cells.length; a++) {
		
		totalActivity += brain.cells[a].activity;
		totalAbsoluteOutput += Math.abs(brain.cells[a].out);
		totalOutput += brain.cells[a].out;
		totalImportance += brain.cells[a].importance;
		
	}
	
	out += "activity - output - absolute output - importance";
	
	output.textContent = out;
	
}
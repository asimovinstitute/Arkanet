(function () {
	
	// n: size of the "perfect grid" (see ### cell creation)
	// distance: grid size for the axon building, maximum manhatten distance for connections/axons (see ### axon building)
	// seed: seed
	// update count: update all cells n times
	// change rate: see below
	Brain = function (n, distance, seed, updateCount, changeRate) {
		
		// the scalar applied to the random weights
		this.cells = [];
		
		// output cells of the network
		this.outs = [];
		
		// input cells of the network
		this.ins = [];
		
		// random seed
		this.seed = seed;
		
		// amount of iterations to update all cells
		this.updateCount = updateCount;
		
		// chance of a cell to output noise
		this.impulseCount = 0;
		
		this.buildBrain(n, distance, seed);
		
	};
	
	var idt = 0;
	
	// this cell just "is"
	Brain.NEUTRAL = idt++;
	
	// also measured/changed in input or output
	Brain.INPUT = idt++;
	Brain.OUTPUT = idt++;
		
	Brain.prototype.buildBrain = function (n, distance, seed) {
		
		// (re-)set the seed
		this.seed = seed;
		
		// clear the cells, so that calling the function at runtime clears the current crap on the field
		this.cells = [];
		this.ins = [];
		this.outs = [];
		
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
				
				// eye-candy
				cell.smoothing = 0;
				
				// my inputs
				cell.in = [];
				
				// output
				cell.out = this.random() > 0.5;
				
				// the role of this cell in the network
				cell.kind = Brain.NEUTRAL;
				
				this.cells.push(cell);
				
			}
			
		}
		
		// ### axon building
		// new variation on grid based collision detection:
		// use a grid with squares of size x
		// and a second grid to account for warping entities (on the edges) which
		// would normally occupy 2 or 4 cells. this "warp" grid has cells of size x as well
		// but all the entities are transposed by half of x. x in this case is in the "distance"
		// variable, as in grid size.
		var grid = [];
		var warp = [];
		
		for (var a = 0; a < width / distance + 1; a++) {
			
			grid[a] = [];
			warp[a] = [];
			
			for (var b = 0; b < height / distance + 1; b++) {
				
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
			
			grid[Math.floor(cells[a].x / distance)]
				[Math.floor(cells[a].y / distance)].push(a);
			
			warp[1 + Math.floor((cells[a].x - 0.5 * distance) / distance)]
				[1 + Math.floor((cells[a].y - 0.5 * distance) / distance)].push(a);
			
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
		
	};
	
	// bash head on keyboard style rgn. probably horribly repetitive and non-uniform but it works ok for most things.
	Brain.prototype.random = function () {
		
		this.seed = 312541332155 * (4365216455 + this.seed) % 7654754253243312;
		
		return 0.0000001 * (this.seed % 10000000);
		
	};
	
	// select exactly n cells, change their type and return their indices
	Brain.prototype.setInputsAndOuputs = function (nIns, nOuts) {
		
		var indices = [];
		
		// n cannot be bigger than 80% of the number of cells, to prevent this lazy solution form freezing.
		for (var a = 0; a < Math.min(nIns + nOuts, this.cells.length / 1.2); a++) {
			
			var x = 0;
			var invalid = false;
			
			do {
				
				invalid = false;
				
				x = Math.floor(this.random() * this.cells.length);
				
				for (var b = 0; b < indices.length; b++) {
					
					if (indices[b] == x) {
						
						invalid = true;
						break;
						
					}
					
				}
				
			} while (invalid);
			
			indices.push(x);
			
		}
		
		for (var a = 0; a < indices.length; a++) {
			
			if (a < nIns) {
				
				this.cells[indices[a]].kind = Brain.INPUT;
				this.ins.push(indices[a]);
				
			} else {
				
				this.cells[indices[a]].kind = Brain.OUTPUT;
				this.outs.push(indices[a]);
				
			}
			
		}
		
	};
	
	Brain.prototype.update = function () {
		
		// ### cell updates
		// change out to activate(∑ iw) unless random [0, 1> > impulseCount
		// updateCount is slider based
		for (var a = 0; a < this.updateCount; a++) {
			
			for (var d = 0; d < this.cells.length; d++) {
				
				var c = this.cells[d];
				
				if (this.random() > this.impulseCount) {
					
					var count = 0;
					
					for (var b = 0; b < c.in.length; b++) {
						
						count += this.cells[c.in[b]].out;
						
					}
					
					c.out = count > 1 && (count % 2 == 0);
					
				} else {
					
					c.out = this.random() > 0.5;
					
				}
				
				c.last = c.out;
				
			}
			
		}
		
	};
	
	Brain.prototype.animate = function () {
		
		for (var a = 0; a < this.cells.length; a++) {
			
			this.cells[a].smoothing += 0.2 * (this.cells[a].out - this.cells[a].smoothing);
			
		}
		
	};
	
})();

var brain;

// unused, for outputting values
var output;

// measurements
var mes = {smooth:[0, 0, 0]};

var player = {x:0, y:0, tx:0, ty:0};
var blobs = [];
var spawners = [];
var timer = 0;

function loaded () {
	
	// boiler plate stuff, for the canvas
	width = 1000;
	height = 500;
	fitCanvas();
	
	player.x = 0.5 * width;
	player.tx = 0.5 * width;
	player.y = 0.5 * height;
	player.ty = 0.5 * height;
	
	// works best with parameters like (x, 1.8ish * x, y)
	brain = new Brain(25, 45, Math.floor(Math.random() * 1000), 1, 0.1);
	brain.setInputsAndOuputs(150, 9);
	
	// output @captain obvious
	output = document.createElement("div");
	output.style.font = "15px monospace";
	output.style.margin = "15px";
	output.style.whiteSpace = "pre";
	
	document.body.appendChild(output);
	
}

// each frame, default vsynced 60hz
function loop () {
	
	// ### rendering
	render.clearRect(0, 0, width, height);
	
	if (mouse.drag) {
		
		for (var a = 0; a < brain.ins.length; a++) {
			
			brain.cells[brain.ins[a]].out = Math.random() > 0.5;
			
		}
		
	}
	
	timer--;
	
	if (timer < 0) {
		
		brain.update();
		timer = 10;
		
	}
	
	brain.animate();
	
	drawBrain();
	// drawGame();
	
}

function drawGame () {
	
	render.fillStyle = "rgba(255, 255, 255, 0.9)";
	render.fillRect(0, 0, width, height);
	
	render.fillStyle = "#000";
	render.beginPath();
	render.arc(player.x, player.y, Math.max(3, player.radius), 0, 2 * Math.PI, false);
	render.fill();
	
	for (var a = 0; a < orbs.length; a++) {
		
		if (orbs[a].radius <= 0) continue;
		
		render.fillStyle = "rgb(" + orbs[a].red + ", " + orbs[a].green + ", " + orbs[a].blue + ")";
		render.beginPath();
		render.arc(orbs[a].x, orbs[a].y, orbs[a].radius, 0, 2 * Math.PI, false);
		render.fill();
		
	}
	
}

function drawBrain () {
	
	// in case of little to no experience with css: # indicates hexidecimal color code,
	// shorthand is to provide 3 digits which will then be copied. so #rgb, making #f0f pink for example.
	render.fillStyle = "#000";
	render.fillRect(0, 0, width, height);
	// get your shit straight html5 spec, stroke or line, pick one term and stick with it.
	// but nooo let's use different terms. watcha gonna dew.
	render.lineWidth = 1;
	render.strokeStyle = "#666";
	
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
	
	
	// draw all the cells one by one due different colors
	
	for (var a = 0; a < brain.cells.length; a++) {
		
		x = brain.cells[a];
		
		render.fillStyle = x.kind == Brain.OUTPUT ? "#f90" : x.kind == Brain.INPUT ? "#6c0" : "#09f";
		render.beginPath();
		
		// cell size is now based on direct output only
		render.arc(x.x, x.y, 3 + 4 * x.smoothing, 0, 2 * Math.PI, false);
		
		render.fill();
		
	}
	
}
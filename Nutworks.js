// arcade learning environment
// papers
// tijdgebonden netwerk
// localiteit kleine chuncks
// spel bedenken, possibility space finite but uncomputable, differs widely from sensible moves space
// hard to perfect

// for html
var output;
var seed = 1;
var cells = [];
var cellScale = 10;
// for the graphs
var records = [];
// how many samples to collect before trashing old ones
var recordSampleSize = 50;
// how often to record data
var recordFrequency = 5;
var recordTimer = recordFrequency;
var subdivisions = [8, 4];
var selection = {x:0, y:0, ex:0, ey:0, fade:0};

function loaded () {
	
	// boiler plate stuff, for the canvas
	width = 1000;
	height = 500;
	fitCanvas();
	
	seed = 3;
	
	buildBrain(20, 100);
	
	// output @captain obvious
	output = document.createElement("div");
	output.style.font = "10px monospace";
	output.style.margin = "10px";
	output.style.whiteSpace = "pre";
	
	document.body.style.background = "#000";
	document.body.style.color = "#09f";
	document.body.appendChild(output);
	
}

// each frame, default vsynced 60hz
function loop () {
	
	// ### rendering
	render.clearRect(0, 0, width, height);
	
	for (var a = 0; a < cells.length; a++) {
		
		var dx = mouse.x - cells[a].x;
		var dy = mouse.y - cells[a].y;
		
		if (keyboard.space && dx * dx + dy * dy < 60 * 60) {
			
			cells[a].energy = 1;
			
		}
		
	}
	
	if (mouse.drag) {
		
		selection.x = Math.min(mouse.x, mouse.startX);
		selection.y = Math.min(mouse.y, mouse.startY);
		selection.ex = Math.max(mouse.x, mouse.startX);
		selection.ey = Math.max(mouse.y, mouse.startY);
		
	}
	
	updateBrain(1);
	drawBrain();
	drawSelection();
	performMeasurements();
	
	if (keyboard.enter) drawGraphs();
	
}

function drawGraphs () {
	
	render.fillStyle = "rgba(0, 0, 0, 0.6)";
	render.fillRect(0, 0, width, height);
	
	
	for (var a = 0; a < records.length; a++) {
		
		for (var b = 0; b < records[a].length; b++) {
			
			render.fillStyle = "rgba(255, 255, 255, 0.6)";
			render.fillRect((b - 1 + recordTimer / recordFrequency) * (width / (-1 + records[a].length)),
							a * (height / (-1 + records.length)),
							width / (-1 + records[a].length),
							Math.pow(records[a][b].s, 2) * (height / (-1 + records.length)));
			
		}
		
	}
	
}

function drawSelection () {
	
	if (mouse.drag) selection.fade = 0.2;
	
	if (selection.fade > 0.001) {
		
		selection.fade -= 0.05 * selection.fade;
		
		render.fillStyle = "rgba(255, 255, 255, " + selection.fade + ")";
		render.fillRect(selection.x, selection.y, selection.ex - selection.x, selection.ey - selection.y);
		
	} else {
		
		selection.fade = 0;
		
	}
	
}

function performMeasurements () {
	
	var shannonValues = "";
	var energyValues = "";
	var areasToMeasure = [];
	var customArea = [];
	var result = {};
	
	for (var a = 0; a < subdivisions[0]; a++) {
		
		areasToMeasure[a] = [];
		
		for (var b = 0; b < subdivisions[1]; b++) {
			
			areasToMeasure[a][b] = [];
			
		}
		
	}
	
	for (var a = 0; a < cells.length; a++) {
		
		areasToMeasure	[Math.floor(cells[a].x / (width / subdivisions[0]))]
						[Math.floor(cells[a].y / (height / subdivisions[1]))].push(cells[a]);
		
		if (cells[a].x > selection.x && cells[a].x < selection.ex &&
			cells[a].y > selection.y && cells[a].y < selection.ey) {
			
			customArea.push(cells[a]);
			
		}
		
	}
	
	recordTimer--;
	if (recordTimer < 0) recordTimer = recordFrequency;
	
	var measurementPrecision = 2;
	var measurementCount = 0;
	
	for (var a = 0; a < subdivisions[0]; a++) {
		
		for (var b = 0; b < subdivisions[1]; b++) {
			
			result = measureShannon(areasToMeasure[a][b]);
			
			if (recordTimer == recordFrequency) {
				
				if (!records[measurementCount]) records[measurementCount] = [];
				records[measurementCount++].push({e:result.e, s:result.s});
				
			}
			
			shannonValues += result.s.toFixed(measurementPrecision) + " ";
			energyValues += result.e.toFixed(measurementPrecision) + " ";
			
		}
		
	}
	
	result = measureShannon(customArea);
	
	if (recordTimer == recordFrequency) {
		
		if (!records[measurementCount]) records[measurementCount] = [];
		records[measurementCount++].push({e:result.e, s:result.s});
		
	}
	
	shannonValues += "- " + result.s.toFixed(measurementPrecision);
	energyValues += "- " + result.e.toFixed(measurementPrecision);
	
	output.innerHTML = "shannon entropies\n" + shannonValues + "\ntotal energies\n" + energyValues;
	
	for (var a = 0; a < records.length; a++) {
		
		if (records[a].length > recordSampleSize) records[a] = records[a].slice(-recordSampleSize);
		
	}
	
}

function measureShannon (c) {
	
	var txt = "";
	var shannonEntropy = 0;
	var totalEnergy = 0;
	var numSets = 100;
	var sets = [];
	var frequency = 0;
	
	for (var a = 0; a < numSets; a++) {
		
		sets.push(0);
		
	}
	
	for (var a = 0; a < c.length; a++) {
		
		totalEnergy += c[a].energy;
		sets[Math.max(0, Math.min(numSets - 1, Math.floor(c[a].energy * numSets)))]++;
		
	}
	
	for (var b = 0; b < sets.length; b++) {
		
		frequency = sets[b] / c.length;
		shannonEntropy -= frequency == 0 ? 0 : frequency * (Math.log(frequency) / Math.log(numSets));
		
	}
	
	return {e:totalEnergy, s:shannonEntropy};
	
}

function updateBrain (updateCount) {
	
	// ### cell updates
	var c;
	var sum;
	
	for (var a = 0; a < updateCount; a++) {
		
		for (var d = 0; d < cells.length; d++) {
			
			c = cells[d];
			
			if (c.energy > c.threshold) {
				
				sum = 0;
				
				for (var b = 0; b < c.axonStrengths.length; b++) {
					
					c.axonStrengths[b] = (20 * c.axonStrengths[b] + cells[c.axons[b]].energy) / 21;
					
					sum += c.axonStrengths[b];
					
				}
				
				for (var b = 0; b < c.axons.length; b++) {
					
					cells[c.axons[b]].energy += c.energy * c.power * (c.axonStrengths[b] / sum);
					
				}
				
				c.energy -= c.energy * c.power;
				c.threshold -= 0.3;
				c.power += 0.01;
				
			}
			
			// c.energy -= 0.001;
			c.threshold += 0.01;
			c.power -= 0.01;
			
			c.energy = Math.max(0, Math.min(1, c.energy));
			c.threshold = Math.max(0.1, Math.min(0.9, c.threshold));
			c.power = Math.max(0.1, Math.min(1, c.power));
			
		}
		
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
	
	var cell;
	
	// draw all the lines in one go for efficiency (canvas doesn't like lines, especially thick ones)
	/*render.beginPath();
	
	for (var a = 0; a < cells.length; a++) {
		
		cell = cells[a];
		
		for (var b = 0; b < cell.axons.length; b++) {
			
			if (cell.axons[b] > a - 1) continue;
			
			render.moveTo(cells[cell.axons[b]].x, cells[cell.axons[b]].y);
			render.lineTo(cell.x, cell.y);
			
		}
		
	}
	
	// done
	render.stroke();*/
	
	// draw all the cells one by one due different colors
	for (var a = 0; a < cells.length; a++) {
		
		cell = cells[a];
		
		if (cells[a].x > selection.x && cells[a].x < selection.ex &&
			cells[a].y > selection.y && cells[a].y < selection.ey) {
			
			render.fillStyle = "rgb(" + Math.floor(255 * cell.threshold) + ", " + Math.floor(255 * cell.power) + ", 153)";
			
		} else {
			
			render.fillStyle = "rgb(" + Math.floor(255 * cell.threshold) + ", " + Math.floor(255 * cell.power) + ", 255)";
			
		}
		
		// cell size is now based on direct output only
		render.fillRect(cell.x - 0.5 * cellScale * (0.1 + 0.9 * cell.energy),
						cell.y - 0.5 * cellScale * (0.1 + 0.9 * cell.energy),
						cellScale * (0.1 + 0.9 * cell.energy),
						cellScale * (0.1 + 0.9 * cell.energy));
		
	}
	
}

function buildBrain (n, distance) {
	
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
			cell.axons = [];
			
			// my weights;
			cell.axonStrengths = [];
			
			// output
			cell.energy = random();
			
			// threshold
			cell.threshold = random();
			
			// percentage of energy to release
			cell.power = random() * 0.9 + 0.1;
			
			cells.push(cell);
			
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
	// check for euclidian distance to eliminate manhatten patterns.
	var dx = 0;
	var dy = 0;
	
	for (var a = 0; a < grid.length; a++) {
		
		for (var b = 0; b < grid[0].length; b++) {
			
			for (var c = 0; c < grid[a][b].length; c++) {
				
				for (var d = 0; d < c; d++) {
					
					dx = cells[grid[a][b][c]].x - cells[grid[a][b][d]].x;
					dy = cells[grid[a][b][c]].y - cells[grid[a][b][d]].y;
					
					if (dx * dx + dy * dy > distance * distance * 0.25) continue;
					
					cells[grid[a][b][c]].axons.push(grid[a][b][d]);
					cells[grid[a][b][c]].axonStrengths.push(random());
					cells[grid[a][b][d]].axons.push(grid[a][b][c]);
					cells[grid[a][b][d]].axonStrengths.push(random());
					
				}
				
			}
			
			for (var c = 0; c < warp[a][b].length; c++) {
				
				for (var d = 0; d < c; d++) {
					
					dx = cells[warp[a][b][c]].x - cells[warp[a][b][d]].x;
					dy = cells[warp[a][b][c]].y - cells[warp[a][b][d]].y;
					
					if (dx * dx + dy * dy > distance * distance * 0.25) continue;
					
					cells[warp[a][b][c]].axons.push(warp[a][b][d]);
					cells[warp[a][b][c]].axonStrengths.push(random());
					cells[warp[a][b][d]].axons.push(warp[a][b][c]);
					cells[warp[a][b][d]].axonStrengths.push(random());
					
				}
				
			}
			
		}
		
	}
	
}

// bash head on keyboard style rgn. probably horribly repetitive and non-uniform but it works ok for most things.
function random () {
	
	seed = 312541332155 * (4365216455 + seed) % 7654754253243312;
	
	return 0.0000001 * (seed % 10000000);
	
}
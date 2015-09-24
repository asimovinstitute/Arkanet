var cells = [];
var momentum = 0;
var learningRate = 0;

function buildBrain (layers) {
	
	for (var a = 0; a < layers.length - 1; a++) layers[a]++;
	
	cells[0] = [];
	
	for (var a = 0; a < layers[0]; a++) {
		
		cells[0][a] = {value:0, bias:a == layers[0] - 1};
		
		if (cells[0][a].bias) cells[0][a].value = -1;
		
	}
	
	for (var a = 1; a < layers.length; a++) {
		
		cells[a] = [];
		
		for (var b = 0; b < layers[a]; b++) {
			
			cells[a][b] = {error:0, value:0, weights:[], lastWeights:[], bias:false};
			
			if (a < layers.length - 1 && b == layers[a] - 1) {
				
				cells[a][b].bias = true;
				cells[a][b].value = -1;
				
			}
			
			for (var c = 0; c < layers[a - 1]; c++) {
				
				cells[a][b].weights[c] = Math.random();
				cells[a][b].lastWeights[c] = 0;
				
			}
			
		}
		
	}
	
}

function activate (x) {
	
	return 1 / (1 + Math.exp(-x));
	// return 0.1 * Math.sqrt(Math.abs(x)) * (x / Math.abs(x));
	// return 0.5 * x + Math.sin(x);
	
	// var y = Math.exp(2 * x);
	// 
	// return (y - 1) / (y + 1);
	
}

function feedForward (input) {
	
	if (cells[0].length - 1 != input.length) console.log("incorrect ff data");
	
	for (var a = 0; a < input.length; a++) {
		
		cells[0][a].value = input[a];
		
	}
	
	var sum = 0;
	
	for (var a = 1; a < cells.length; a++) {
		
		for (var b = 0; b < cells[a].length; b++) {
			
			sum = 0;
			
			for (var c = 0; c < cells[a - 1].length; c++) {
				
				sum += cells[a - 1][c].value * cells[a][b].weights[c];
				
			}
			
			// cells[a][b].value = activate(sum);
			cells[a][b].value = (a == cells.length - 1) ? sum : activate(sum);
			
		}
		
	}
	
}

function backpropagate (targets) {
	
	var cell;
	
	if (targets.length != cells[cells.length - 1].length) console.log("incorrect bp data");
	
	for (var a = 0; a < cells[cells.length - 1].length; a++) {
		
		cell = cells[cells.length - 1][a];
		
		cell.error = targets[a] - cell.value;
		// cell.error = cell.value * (1 - cell.value) * (targets[a] - cell.value);
		
	}
	
	var sum = 0;
	
	for (var a = cells.length - 2; a > 0; a--) {
		
		for (var b = 0; b < cells[a].length; b++) {
			
			sum = 0;
			cell = cells[a][b];
			
			for (var c = 0; c < cells[a + 1].length; c++) {
				
				sum += cells[a + 1][c].error * cells[a + 1][c].weights[b];
				
			}
			
			cell.error = cell.value * (1 - cell.value) * sum;
			
		}
		
	}
	
	for (var a = 1; a < cells.length; a++) {
		
		for (var b = 0; b < cells[a].length; b++) {
			
			cell = cells[a][b];
			
			for (var c = 0; c < cells[a - 1].length; c++) {
				
				cell.weights[c] += learningRate * cell.error * cells[a - 1][c].value;
				cell.lastWeights[c] = cell.weights[c];
				
			}
			
		}
		
	}
	
}

function ask (input) {
	
	feedForward(input);
	
	var ret = [];
	
	for (var a = 0; a < cells[cells.length - 1].length; a++) {
		
		ret.push(Math.round(10000 * cells[cells.length - 1][a].value) / 10000);
		
	}
	
	return ret;
	
}

function loaded () {
	
	momentum = 0.1;
	learningRate = 0.1;
	
	buildBrain([5, 1]);
	
	for (var a = 0; a < 10000; a++) {
		
		var v = [Math.random(),
				Math.random(),
				Math.random(),
				Math.random(),
				Math.random()];
		
		feedForward(v);
		
		backpropagate([v[3]]);
		
	}
	
	traceNetwork();
	
	console.log("------> " + ask([1, 2, 3, 4, 5]).join(", "));
	
}

function traceNetwork (callName) {
	
	var s = "";
	// var s = "####################\n" + callName + "\n####################\n";
	
	var precision = 6;
	
	for (var a = 0; a < cells.length; a++) {
		
		for (var b = 0; b < cells[a].length; b++) {
			
			s += "--- " + a + " X " + b;
			
			if (a == cells.length - 1) s += " output";
			else if (cells[a][b].bias) s += " bias";
			if (a == 0) s += " input";
			
			s += "\nv " + ("" + cells[a][b].value).slice(0, precision);
			
			if (cells[a][b].weights) {
				
				s += "\nw";
				
				for (var c = 0; c < cells[a][b].weights.length; c++) {
					
					s += " " + ("" + cells[a][b].weights[c]).slice(0, precision);
					
				}
				
				s += "\nd";
				
				for (var c = 0; c < cells[a][b].lastWeights.length; c++) {
					
					s += " " + ("" + cells[a][b].lastWeights[c]).slice(0, precision);
					
				}
				
				s += "\ne " + ("" + cells[a][b].error).slice(0, precision);
				
			}
			
			s += "\n";
			
		}
		
	}
	
	console.log(s);
	
}

function loop () {
	
	
	
}

/*var outputs = [];
var errors = [];
var weights = [];
var layers = [];
var lastWeights = [];
var lastLayer = -1;
var learningRate = 0;
var momentum = 0;

function buildBrain () {
	
	lastLayer = layers.length - 1;
	
	errors = [];
	outputs = [];
	
	for (var a = 0; a < layers.length; a++) {
		
		errors[a] = [];
		outputs[a] = [];
		
		for (var b = 0; b < layers[a]; b++) {
			
			errors[a][b] = 0;
			outputs[a][b] = 0;
			
		}
		
	}
	
	weights = [];
	lastWeights = [];
	
	for (var a = 1; a < layers.length; a++) {
		
		weights[a] = [];
		lastWeights[a] = [];
		
		for (var b = 0; b < layers[a] + 1; b++) {
			
			weights[a][b] = [];
			lastWeights[a][b] = [];
			
			for (var c = 0; c < layers[a - 1]; c++) {
				
				weights[a][b][c] = 2 * Math.random() - 1;
				lastWeights[a][b][c] = 0;
				
			}
			
			weights[a][b][layers[a - 1]] = -1;
			
		}
		
	}
	
}

function feedForward (values) {
	
	for (var a = 0; a < layers[0]; a++) {
		
		outputs[0][a] = values[a];
		
	}
	
	for (var a = 1; a < layers.length; a++) {
		
		for (var b = 0; b < layers[a]; b++) {
			
			var sum = 0;
			
			for (var c = 0; c < layers[a - 1]; c++) {
				
				sum += outputs[a - 1][c] * weights[a][b][c];
				
			}
			
			sum += weights[a][b][layers[a - 1]];
			
			outputs[a][b] = sigmoid(sum);
			
		}
		
	}
	
}

function backpropagate (target) {
	
	for (var a = 0; a < layers[lastLayer]; a++) {
		
		errors[lastLayer][a] = outputs[lastLayer][a] * (1 - outputs[lastLayer][a]);
		errors[lastLayer][a] *= (target - outputs[lastLayer][a]);
		
	}
	
	for (var a = lastLayer - 1; a > 0; a--) {
		
		for (var b = 0; b < layers[a]; b++) {
			
			var sum = 0;
			
			for (var c = 0; c < layers[a + 1]; c++) {
				
				sum += errors[a + 1][c] * weights[a + 1][c][b];
				
			}
			
			errors[a][b] = outputs[a][b] * (1 - outputs[a][b]) * sum;
			
		}
		
	}
	
	for (var a = 1; a < lastLayer; a++) {
		
		for (var b = 0; b < layers[a]; b++) {
			
			for (var c = 0; c < layers[a - 1]; c++) {
				
				weights[a][b][c] += momentum * lastWeights[a][b][c];
				
			}
			
			weights[a][b][layers[a - 1]] += momentum * lastWeights[a][b][layers[a - 1]];
			
		}
		
	}
	
	for (var a = 1; a < lastLayer; a++) {
		
		for (var b = 0; b < layers[a]; b++) {
			
			for (var c = 0; c < layers[a - 1]; c++) {
				
				lastWeights[a][b][c] = learningRate * errors[a][b] * outputs[a - 1][c];
				
				weights[a][b][c] += lastWeights[a][b][c];
				
			}
			
			lastWeights[a][b][layers[a - 1]] = learningRate * errors[a][b];
			
			weights[a][b][layers[a - 1]] += lastWeights[a][b][layers[a - 1]];
			
		}
		
	}
	
}

function sigmoid (x) {
	
	return 1 / (1 + Math.exp(-x));
	
}

function out (i) {
	
	return outputs[lastLayer][i];
	
}

function loaded () {
	
	momentum = 0.1;
	learningRate = 0.2;
	layers = [2, 1];
	
	buildBrain();
	
	// train
	for (var a = 0; a < 100000; a++) {
		
		var x = Math.random() < 0.5 ? 1 : 0;
		var y = Math.random() < 0.5 ? 1 : 0;
		
		feedForward([x, y]);
		backpropagate(targetFunction(x, y));
		
	}
	
	// test
	for (var a = 0; a < 10; a++) {
		
		var x = Math.random() < 0.5 ? 1 : 0;
		var y = Math.random() < 0.5 ? 1 : 0;
		
		feedForward([x, y]);
		
		console.log(x + " " + y + " " + targetFunction(x, y) + "" + Math.round(out(0)) + " " + out(0));
		
	}
	
	fitCanvas();
	draw();
	
}

function targetFunction (x, y) {
	
	return x + y;
	
}

function loop () {
	
	
	
}

function draw () {
	/*
	render.clearRect(0, 0, width, height);
	
	render.fillStyle = "#09f";
	render.fillRect(0, 0, width, height);
	
}

/*

Exclusive OR (XOR)

0 XOR 0 = 0 (no)
1 XOR 0 = 1 (yes)
0 XOR 1 = 1 (yes)
1 XOR 1 = 0 (no)

The rule: Say yes if the first one is 0 or the second is 1,
but not both.

 Scale data for values beyond 0 and 1.

By freedelta freedelta.free.fr January-2010
 
error_reporting(E_STRICT);
define("_RAND_MAX",32767);

class BackPropagation
{	
/* Output of each neuron 
public output=null;

/* delta error value for each neuron 
public delta=null;

/* Array of weights for each neuron 
public weight=null;

/* Num of layers in the net, including input layer 
public numLayers=null;

/* Array num elments containing size for each layer 
public layersSize=null;

/* Learning rate 
public beta=null;

/* Momentum 
public alpha=null;

/* Storage for weight-change made in previous epoch (three-dimensional array) 
public prevDwt=null;

/* Data 
public data=null;

/* Test Data 
public testData=null;

/* N lines of Data 
public NumPattern=null;

/* N columns in Data 
public NumInput=null;


public function __construct(numLayers,layersSize,beta,alpha)
{			
	this.alpha=alpha;
	this.beta=beta;
	
	// Set no of layers and their sizes
	this.numLayers=numLayers;
	this.layersSize=layersSize;
	
	// Seed and assign random weights
	for(i=1;i<this.numLayers;i++)
	{
		for(j=0;j<this.layersSize[i];j++)
		{
			for(k=0;k<this.layersSize[i-1]+1;k++)				
			{
				this.weight[i][j][k]=this.rando();
			}
			// bias in the last neuron				
			this.weight[i][j][this.layersSize[i-1]]=-1;
		}
	}	
	
	// initialize previous weights to 0 for first iteration		
	for(i=1;i<this.numLayers;i++)
	{
		for(j=0;j<this.layersSize[i];j++)
		{
			for(k=0;k<this.layersSize[i-1]+1;k++)
			{					
				this.prevDwt[i][j][k]=(double)0.0;
			}				
		}
	}	
	
	/*
	// Note that the following variables are unused,
	//
	// delta[0]
	// weight[0]
	// prevDwt[0]

	//  I did this intentionaly to maintains consistancy in numbering the layers.
	//  Since for a net having n layers, input layer is refered to as 0th layer,
	//  first hidden layer as 1st layer and the nth layer as outputput layer. And 
	//  first (0th) layer just stores the inputs hence there is no delta or weigth
	//  values corresponding to it.
	
}

public function rando()
{
	return (double)(rand())/(_RAND_MAX/2) - 1;//32767
}

// sigmoid function
public function sigmoid(inputSource)
{
	return (double)(1.0 / (1.0 + exp(-inputSource)));
}

// mean square error
public function mse(target)
{	
	mse=0;
	
	for(i=0;i<this.layersSize[this.numLayers-1];i++)
	{
		mse+=(target-this.output[this.numLayers-1][i])*(target-this.output[this.numLayers-1][i]);		
	}	
	return mse/2;	
}

// returns i'th outputput of the net
public function Out(i)
{
	return this.output[this.numLayers-1][i];
}

// Feed forward one set of input
// to update the output values for each neuron. 
// This function takes the input to the net and finds the output of each neuron
public function ffwd(inputSource)
{	
	sum=0.0;

	// assign content to input layer
	for(i=0;i<this.layersSize[0];i++)
	{
		this.output[0][i]=inputSource[i];  // outputput_from_neuron(i,j) Jth neuron in Ith Layer		
	}
		
	// assign output (activation) value to each neuron usng sigmoid func
	for(i=1;i<this.numLayers;i++)									// For each layer
	{	
		for(j=0;j<this.layersSize[i];j++)								// For each neuron in current layer
		{	
			sum=0.0;
			for(k=0;k<this.layersSize[i-1];k++)						// For each input from each neuron in preceeding layer
			{					
                          sum+=this.output[i-1][k]*this.weight[i][j][k];	                        // Apply weight to inputs and add to sum	
			}
			// Apply bias
			sum+=this.weight[i][j][this.layersSize[i-1]];	
			// Apply sigmoid function					
			this.output[i][j]=this.sigmoid(sum);						
		}
	}	
}

/* ---	Backpropagate errors from outputput layer back till the first hidden layer 
public function bpgt(inputSource,target)
{	
	/* ---	Update the output values for each neuron 
	this.ffwd(inputSource);

	///////////////////////////////////////////////
	/// FIND DELTA FOR OUPUT LAYER (Last Layer) ///
	///////////////////////////////////////////////
	
	for(i=0;i<this.layersSize[this.numLayers-1];i++)
	{	
		this.delta[this.numLayers-1][i]=this.output[this.numLayers-1][i]*(1-this.output[this.numLayers-1][i])*(target-this.output[this.numLayers-1][i]);
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////
	/// FIND DELTA FOR HIDDEN LAYERS (From Last Hidden Layer BACKWARDS To First Hidden Layer) ///
	/////////////////////////////////////////////////////////////////////////////////////////////
	
	for(i=this.numLayers-2;i>0;i--)
	{
		for(j=0;j<this.layersSize[i];j++)
		{
			sum=0.0;
			for(k=0;k<this.layersSize[i+1];k++)
			{
				sum+=this.delta[i+1][k]*this.weight[i+1][k][j];
			}			
			this.delta[i][j]=this.output[i][j]*(1-this.output[i][j])*sum;
		}
	}
	
	////////////////////////
	/// MOMENTUM (Alpha) ///
	////////////////////////
	
	for(i=1;i<this.numLayers;i++)
	{
		for(j=0;j<this.layersSize[i];j++)
		{
			for(k=0;k<this.layersSize[i-1];k++)
			{
				this.weight[i][j][k]+=this.alpha*this.prevDwt[i][j][k];				
			}
			this.weight[i][j][this.layersSize[i-1]]+=this.alpha*this.prevDwt[i][j][this.layersSize[i-1]];
		}
	}
	
	///////////////////////////////////////////////
	/// ADJUST WEIGHTS (Using Steepest Descent) ///
	///////////////////////////////////////////////
	
	for(i=1;i<this.numLayers;i++)
	{
		for(j=0;j<this.layersSize[i];j++)
		{
			for(k=0;k<this.layersSize[i-1];k++)
			{
				this.prevDwt[i][j][k]=this.beta*this.delta[i][j]*this.output[i-1][k];
				this.weight[i][j][k]+=this.prevDwt[i][j][k];
			}
			/* --- Apply the corrections 
			this.prevDwt[i][j][this.layersSize[i-1]]=this.beta*this.delta[i][j];
			this.weight[i][j][this.layersSize[i-1]]+=this.prevDwt[i][j][this.layersSize[i-1]];
		}
	}
}

public function Run(data,testData)
{
	/* --- Threshhold - thresh (value of target mse, training stops once it is achieved) 
	Thresh =  0.0001;
	numEpoch = 200000;	
	MSE=0.0;	
	NumPattern=count(data);	// Lines
	NumInput=count(data[0]);	// Columns
	
	/* --- Start training: looping through epochs and exit when MSE error < Threshold 
	echo  "\nNow training the network....";	
	
	for(e=0;e<numEpoch;e++)
	{			
		/* -- Backpropagate 
		this.bpgt(data[e%NumPattern],data[e%NumPattern][NumInput-1]);
				
		MSE=this.mse(data[e%NumPattern][NumInput-1]);
		if(e==0)
		{
			echo "\nFirst epoch Mean Square Error: MSE";
		}
		
		if( MSE < Thresh)		
		{
           echo "\nNetwork Trained. Threshold value achieved in ".e." iterations.";
           echo "\nMSE:  ".MSE;
           break;
        }
	}
	
	echo "\nLast epoch Mean Square Error: MSE";
	
	echo "\nNow using the trained network to make predictions on test data....";	
	
    for (i = 0 ; i < NumPattern; i++ )
    {
        this.ffwd(testData[i]);
				
        echo "\n";
		
		for(j=0;j<NumInput-1;j++)
		{
			echo testData[i][j]."  ";
		}
					
		echo (double)this.Out(0);	
    }
	
	echo "\nThat's it\n";
}

}

/* --- Sample use 

// prepare XOR traing data
data=array(0=>array(0,	0,	0,	0),
			1=>array(0,	0,	1,	1),
			2=>array(0,	1,	0,	1),
			3=>array(0,	1,	1,	0),
			4=>array(1,	0,	0,	1),
			5=>array(1,	0,	1,	0),
			6=>array(1,	1,	0,	0),
			7=>array(1,	1,	1,	1)
			);

// prepare test =(data-last output values)
testData=array(0=>array(0,	0,	0),
				1=>array(0,	0,	1),
				2=>array(0,	1,	0),
				3=>array(0,	1,	1),
				4=>array(1,	0,	0),
				5=>array(1,	0,	1),
				6=>array(1,	1,	0),
				7=>array(1,	1,	1)
			);
			
 * Defining a net with 4 layers having 3,3,3, and 1 neuron respectively,
 * the first layer is input layer i.e. simply holder for the input parameters
 * and has to be the same size as the no of input parameters, in out example 3
 

layersSize=array(3,3,3,1);
numLayers = count(layersSize);

// Learning rate - beta
// momentum - alpha
beta = 0.3;
alpha = 0.1;

// Creating the net    
bp=new BackPropagation(numLayers,layersSize,beta,alpha);
bp.Run(data,testData);*/
angular.module('ng-charts', [])
.constant('ng-charts.defaults', {
	scaleFontFamily : "'Arial'",
	scaleFontSize : 12,
	scaleFontStyle : "normal",
	scaleFontColor : "#666",
	scaleOverlay : false,
	xFilters : 'number:0',
	yFilters : 'number:0',
	onAnimationComplete : null,
	animationEasing : "easeOutQuart",
	animation : true,
	animationSteps : 70,
	zeroXAxis : true,				// Whether to start the X or Y axis scale at 0
	zeroYAxis : true,
	xScaleLimits : { min: null, max : null },
	yScaleLimits : { min: null, max : null },
});

angular.module('ng-charts').factory('ng-charts.utils', ['$filter', function($filter){
	"use strict";

	var utils = {};

	//Easing functions adapted from Robert Penner's easing equations
	//http://www.robertpenner.com/easing/
	var animationOptions = {
		linear : function (t){
			return t;
		},
		easeInQuad: function (t) {
			return t*t;
		},
		easeOutQuad: function (t) {
			return -t*(t-2);
		},
		easeInOutQuad: function (t) {
			if ((t *= 2) < 1) return 0.5*t*t;
			return -0.5 * ((--t)*(t-2) - 1);
		},
		easeInCubic: function (t) {
			return t*t*t;
		},
		easeOutCubic: function (t) {
			return 1*((t=t/1-1)*t*t + 1);
		},
		easeInOutCubic: function (t) {
			if ((t*=2) < 1) return 0.5*t*t*t;
			return 0.5*((t-=2)*t*t + 2);
		},
		easeInQuart: function (t) {
			return t*t*t*t;
		},
		easeOutQuart: function (t) {
			return -1 * ((t=t/1-1)*t*t*t - 1);
		},
		easeInOutQuart: function (t) {
			if ((t *= 2) < 1) return 0.5*t*t*t*t;
			return -0.5 * ((t-=2)*t*t*t - 2);
		},
		easeInQuint: function (t) {
			return 1*(t/=1)*t*t*t*t;
		},
		easeOutQuint: function (t) {
			return 1*((t=t/1-1)*t*t*t*t + 1);
		},
		easeInOutQuint: function (t) {
			if ((t*=2) < 1) return 0.5*t*t*t*t*t;
			return 0.5*((t-=2)*t*t*t*t + 2);
		},
		easeInSine: function (t) {
			return -1 * Math.cos(t/1 * (Math.PI/2)) + 1;
		},
		easeOutSine: function (t) {
			return 1 * Math.sin(t/1 * (Math.PI/2));
		},
		easeInOutSine: function (t) {
			return -1/2 * (Math.cos(Math.PI*t/1) - 1);
		},
		easeInExpo: function (t) {
			return (t===0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
		},
		easeOutExpo: function (t) {
			return (t===1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
		},
		easeInOutExpo: function (t) {
			if (t===0) return 0;
			if (t==1) return 1;
			if ((t*=2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
			return 0.5 * (-Math.pow(2, -10 * --t) + 2);
			},
		easeInCirc: function (t) {
			if (t>=1) return t;
			return -1 * (Math.sqrt(1 - (t/=1)*t) - 1);
		},
		easeOutCirc: function (t) {
			return 1 * Math.sqrt(1 - (t=t/1-1)*t);
		},
		easeInOutCirc: function (t) {
			if ((t*=2) < 1) return -0.5 * (Math.sqrt(1 - t*t) - 1);
			return 0.5 * (Math.sqrt(1 - (t-=2)*t) + 1);
		},
		easeInElastic: function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t===0) return 0;
			if (t==1) return 1;
			if (!p) p=0.3;

			if (a < Math.abs(1)) {
				a=1;
				s=p/4;
			} else {
				s = p/(2*Math.PI) * Math.asin (1/a);
			}

			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
		},
		easeOutElastic: function (t) {
			var s=1.70158,
				p=0,
				a=1;

			if (t===0) return 0;
			if ((t/=1)==1) return 1;
			if (!p) p=0.3;
			if (a < Math.abs(1)) {
				a=1;
				s=p/4;
			} else {
				s = p/(2*Math.PI) * Math.asin (1/a);
			}

			return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
		},
		easeInOutElastic: function (t) {
			var s=1.70158,
				p=0,
				a=1;

			if (t===0) return 0;
			if ((t*=2)==2) return 1;
			if (!p) p=0.3*1.5;

			if (a < Math.abs(1)) {
				a=1;
				s=p/4;
			} else {
				s = p/(2*Math.PI) * Math.asin (1/a);
			}

			if (t < 1) {
				return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
			}

			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p )*0.5 + 1;
		},
		easeInBack: function (t) {
			var s = 1.70158;
			return 1*(t/=1)*t*((s+1)*t - s);
		},
		easeOutBack: function (t) {
			var s = 1.70158;
			return 1*((t=t/1-1)*t*((s+1)*t + s) + 1);
		},
		easeInOutBack: function (t) {
			var s = 1.70158;
			if ((t*=2) < 1) return 1/2*(t*t*(((s*=(1.525))+1)*t - s));
			return 1/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
		},
		easeInBounce: function (t) {
			return 1 - animationOptions.easeOutBounce (1-t);
		},
		easeOutBounce: function (t) {
			if ((t/=1) < (1/2.75)) {
				return (7.5625*t*t);
			} else if (t < (2/2.75)) {
				return (7.5625*(t-=(1.5/2.75))*t + 0.75);
			} else if (t < (2.5/2.75)) {
				return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
			} else {
				return (7.5625*(t-=(2.625/2.75))*t + 0.984375);
			}
		},
		easeInOutBounce: function (t) {
			if (t < 1/2) return animationOptions.easeInBounce (t*2) * 0.5;
			return animationOptions.easeOutBounce (t*2-1) * 0.5 + 0.5;
		}
	};

	utils.getColor = function(datasetIndex, valueIndex, noDatasets) {
		var colors = ['#23b5e4', '#51e2d1', '#fe7e7b', '#fabf00'],
			index = 1;

		if (noDatasets === 1) {
			index = valueIndex;
		} else {
			index = datasetIndex;
		}

		if (index < colors.length) {
			return colors[index];
		} else {
			return colors[colors.length % index - 1];
		}
	};

	utils.setCanvasSize = function(ctx, width, height) {
		ctx.width = width;
		ctx.height = height;

		if (window.devicePixelRatio) {
			ctx.style.width = width + "px";
			ctx.style.height = height + "px";
			ctx.height = height * window.devicePixelRatio;
			ctx.width = width * window.devicePixelRatio;
			ctx.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
		}
	};

	utils.getValueBounds = function(datasets) {
		var upperValue = Number.MIN_VALUE,
			lowerValue = Number.MAX_VALUE,
			i, j,
			ret = {};

		for (i = 0; i < datasets.length; i++) {
			for (j = 0; j < datasets[i].y.length; j++){
				if ( datasets[i].y[j] > upperValue) {
					upperValue = datasets[i].y[j];
				}

				if ( datasets[i].y[j] < lowerValue) {
					lowerValue = datasets[i].y[j];
				}
			}
		}

		ret.maxY = upperValue;
		ret.minY = lowerValue;

		// If the chart has x data (e.g. line chart) find the values
		if(typeof datasets[0].x !== 'undefined') {
			upperValue = Number.MIN_VALUE;
			lowerValue = Number.MAX_VALUE;

			for (i = 0; i < datasets.length; i++) {
				for (j = 0; j < datasets[i].x.length; j++){
					if ( datasets[i].x[j] > upperValue) {
						upperValue = datasets[i].x[j];
					}

					if ( datasets[i].x[j] < lowerValue) {
						lowerValue = datasets[i].x[j];
					}
				}
			}

			ret.maxX = upperValue;
			ret.minX = lowerValue;
		}

		return ret;
	};

	utils.calculateScale = function(maxValue, minValue, filters, zeroAxis, scaleLimits) {
		var stepValue,
			rangeOrderOfMagnitude,
			numberOfSteps,
			range;

		maxValue = scaleLimits.max ? scaleLimits.max : maxValue;

		if (scaleLimits.min) {
			minValue = scaleLimits.min;
		} else if(zeroAxis) {
			minValue = 0;
		} else {
			range = maxValue - minValue;

			if(range !== 0) {
				rangeOrderOfMagnitude = Math.floor(Math.log(range) / Math.LN10);
				var minValueOrderOfMagnitude = Math.floor(Math.log(minValue) / Math.LN10);

				minValue = Math.floor(minValue/Math.pow(10, (minValueOrderOfMagnitude - rangeOrderOfMagnitude - 1)))*Math.pow(10, (minValueOrderOfMagnitude - rangeOrderOfMagnitude - 1));
			}
		}

		// Re-calculate the range for the new minium value
		range = maxValue - minValue;

		if(range === 0) {
			rangeOrderOfMagnitude = Math.floor(Math.log(minValue) / Math.LN10);
			stepValue = 0.25*Math.pow(10, rangeOrderOfMagnitude);
			numberOfSteps = 2;
		} else {
			rangeOrderOfMagnitude = Math.floor(Math.log(range) / Math.LN10);

			var t = range/Math.pow(10, rangeOrderOfMagnitude);

			if (t <= 2) {
				stepValue = 0.25*Math.pow(10, rangeOrderOfMagnitude);
			} else if (t <= 6) {
				stepValue = Math.pow(10, rangeOrderOfMagnitude);
			} else {
				stepValue = 2*Math.pow(10, rangeOrderOfMagnitude);
			}

			stepValue = Math.ceil(stepValue);
			numberOfSteps = Math.ceil(range/stepValue);
		}

		maxValue = minValue + stepValue*numberOfSteps;

		var labels = [];
		this.populateLabels(filters, labels, numberOfSteps, minValue, stepValue);

		return {
			steps : numberOfSteps,
			stepValue : stepValue,
			minValue : minValue,
			maxValue : maxValue,
			labels : labels
		};
	};

	utils.populateLabels = function(filters, labels, numberOfSteps, graphMin, stepValue) {
		for (var i = 0; i < numberOfSteps + 1; i++) {
			var label = graphMin + (stepValue * i);

			if (filters) {
				label = applyFilters(label, filters);
			}

			labels.push(label);
		}
    };

	var applyFilters = function(value, filterSpec) {
		var filters = filterSpec.trim().split('|'),
			result = value;

		for (var i = 0; i < filters.length; i++) {
			var args = filters[i].trim().split(':'),
				filter = $filter(args.shift().trim());

			args.unshift(result);
			result = filter.apply(null, args);
		}

		return result;
	};

	var capValue = function(valueToCap, maxValue, minValue){
		if (isNumber(maxValue)) {
			if ( valueToCap > maxValue ) {
				return maxValue;
			}
		}

		if (isNumber(minValue)) {
			if ( valueToCap < minValue ) {
				return minValue;
			}
		}

		return valueToCap;
	};

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	utils.animationLoop = function(config, drawScale, drawData, canvas) {
		var animFrameAmount = (config.animation)? 1/capValue(config.animationSteps, Number.MAX_VALUE, 1) : 1,
			easingFunction = animationOptions[config.animationEasing],
			percentAnimComplete =(config.animation)? 0 : 1,
			ctx = canvas.getContext('2d');

		if (typeof drawScale !== "function") drawScale = function(){};

		requestAnimFrame(animLoop);

		function animateFrame(){
			var easeAdjustedAnimationPercent = (config.animation) ? capValue(easingFunction(percentAnimComplete),null,0) : 1;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (config.scaleOverlay) {
				drawData(easeAdjustedAnimationPercent);
				drawScale();
			} else {
				drawScale();
				drawData(easeAdjustedAnimationPercent);
			}
		}

		function animLoop() {
			//We need to check if the animation is incomplete (less than 1), or complete (1).
			percentAnimComplete += animFrameAmount;
			animateFrame();
			//Stop the loop continuing forever
			if (percentAnimComplete <= 1) {
				requestAnimFrame(animLoop);
			} else {
				if (typeof config.onAnimationComplete == "function") {
					config.onAnimationComplete();
				}
			}
		}
	};

	// shim layer with setTimeout fallback
	var requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	return utils;
}]);
angular.module('ng-charts').directive('barChart', ['ng-charts.utils', 'ng-charts.defaults', function(utils, defaults) {
	"use strict";

	var chartDefaults = {
		scaleLineColor : "rgba(0,0,0,.2)",
		scaleLineWidth : 1,
		scaleShowLabels : true,
		scaleShowGridLines : true,
		scaleGridLineColor : "rgba(0,0,0,.1)",
		scaleGridLineWidth : 1,
		barShowStroke : true,
		barStrokeWidth : 2,
		barValueSpacing : 5,
		barDatasetSpacing : 1,
	};

	var BarChart = function(data, config, canvas) {
		var ctx = canvas.getContext('2d'),
			height = canvas.height,
			width = canvas.width,
			valueBounds = utils.getValueBounds(data.datasets),
			yScale = utils.calculateScale(valueBounds.maxY, valueBounds.minY, config.yFilters, config.zeroYAxis, config.yScaleLimits),
			graphDimensions = calculateDrawingSizes();

		utils.animationLoop(config, drawScale, drawBars, canvas);

		function drawBars(animPc) {
			var datasetSize = data.datasets.length;

			ctx.lineWidth = config.barStrokeWidth;

			for (var i = 0; i < datasetSize; i++) {
				var dataset = data.datasets[i];

				for (var j = 0; j < dataset.y.length; j++) {

					var barOffset = graphDimensions.orgin.x + config.barValueSpacing + graphDimensions.gridSize.x*j + graphDimensions.barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i,
						yPos = animPc*dataset.y[j]/(yScale.maxValue - yScale.minValue)*graphDimensions.axisLength.y;

					ctx.fillStyle = dataset.fillColor || utils.getColor(i, j, datasetSize);
					ctx.strokeStyle = dataset.strokeColor || utils.getColor(i, j, datasetSize);

					ctx.beginPath();
					ctx.moveTo(barOffset, graphDimensions.orgin.y);
					ctx.lineTo(barOffset, graphDimensions.orgin.y - yPos);
					ctx.lineTo(barOffset + graphDimensions.barWidth, graphDimensions.orgin.y - yPos);
					ctx.lineTo(barOffset + graphDimensions.barWidth, graphDimensions.orgin.y);

					if (config.barShowStroke) {
						ctx.stroke();
					}

					ctx.closePath();
					ctx.fill();
				}
			}
		}

		function drawScale(){
			var i;

			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y);
			ctx.lineTo(graphDimensions.orgin.x + graphDimensions.axisLength.x, graphDimensions.orgin.y);
			ctx.stroke();

			if (graphDimensions.rotateLabels > 0) {
				ctx.save();
				ctx.textAlign = "right";
			} else {
				ctx.textAlign = "center";
			}

			ctx.fillStyle = config.scaleFontColor;

			for (i = 0; i < data.labels.length; i++) {
				ctx.save();

				if (graphDimensions.rotateLabels > 0) {
					ctx.translate(graphDimensions.orgin.x + i*graphDimensions.gridSize.x, graphDimensions.orgin.y + config.scaleFontSize);
					ctx.rotate(-(graphDimensions.rotateLabels * (Math.PI/180)));
					ctx.fillText(data.labels[i], 0, 0);
					ctx.restore();
				} else {
					ctx.fillText(data.labels[i], graphDimensions.orgin.x + i*graphDimensions.gridSize.x + graphDimensions.gridSize.x/2,graphDimensions.orgin.y + config.scaleFontSize);
				}

				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x + (i+1) * graphDimensions.gridSize.x, graphDimensions.orgin.y);

				//Check i isnt 0, so we dont go over the Y axis twice.
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				ctx.lineTo(graphDimensions.orgin.x + (i+1) * graphDimensions.gridSize.x, 5);
				ctx.stroke();
			}

			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y);
			ctx.lineTo(graphDimensions.orgin.x, config.scaleFontSize/2);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";

			for (i = 0; i < yScale.labels.length; i++) {
				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x-3, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));

				if (config.scaleShowGridLines){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(graphDimensions.orgin.x + graphDimensions.axisLength.x, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				} else {
					ctx.lineTo(graphDimensions.orgin.x - 0.5, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				}

				ctx.stroke();
				if (config.scaleShowLabels) {
					ctx.fillText(yScale.labels[i], graphDimensions.orgin.x-8, graphDimensions.orgin.y - (i * graphDimensions.gridSize.y));
				}
			}
		}

		function calculateDrawingSizes(){
			var yAxisLength = height,
				rotateLabels = 0,
				widestYLabel = 0,
				widestXLabel = 0,
				datasetSize = data.datasets.length,
				i;

			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;

			// Calculate X axis

			if (config.scaleShowLabels) {
				for (i = 0; i < yScale.labels.length; i++) {
					var measuredText = ctx.measureText(yScale.labels[i]).width;
					widestYLabel = (measuredText > widestYLabel)? measuredText : widestYLabel;
				}
				//Add a little extra padding from the y axis
				widestYLabel += 10;
			}

			// Calculate Y axis
			for (i = 0; i < data.labels.length; i++) {
				var textLength = ctx.measureText(data.labels[i]).width;
				//If the text length is longer - make that equal to longest text
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}

			if (width/data.labels.length < widestXLabel) {
				rotateLabels = 45;
				if (width/data.labels.length < Math.cos(rotateLabels) * widestXLabel) {
					rotateLabels = 90;
					yAxisLength -= widestXLabel;
				} else {
					yAxisLength -= Math.sin(rotateLabels) * widestXLabel;
				}
			} else {
				yAxisLength -= config.scaleFontSize;
			}

			//Add a little padding between the x line and the text
			yAxisLength -= config.scaleFontSize;

			var xAxisLength = width - widestYLabel - widestXLabel,
				yAxisPosX = Math.max(widestXLabel, widestYLabel),
				xAxisPosY = yAxisLength + config.scaleFontSize/2,
				xGridSize = Math.floor(xAxisLength/((datasetSize-1)*data.labels.length)),
				yGridSize = Math.floor(yAxisLength/yScale.steps),
				barWidth = (xGridSize - config.scaleGridLineWidth*2 - config.barValueSpacing*2 - (config.barDatasetSpacing*datasetSize-1) - ((config.barStrokeWidth/2)*datasetSize-1))/datasetSize;

			return {
				orgin : {'x' : yAxisPosX, 'y' : xAxisPosY},
				axisLength : {'x' : xAxisLength, 'y' : yAxisLength},
				gridSize : {'x' : xGridSize, 'y' : yGridSize},
				yLabelHeight : config.scaleFontSize,
				rotateLabels : rotateLabels,
				barWidth : barWidth
			};
		}
	};

	function link(scope, element, attr) {
		var config = angular.extend(chartDefaults, defaults),
			canvas = element[0];

		config = angular.extend(config, scope.options);
		utils.setCanvasSize(canvas, scope.width, scope.height);

		scope.instance = new BarChart(scope.data, config, canvas);
	}

	return {
		replace: true,
		scope : {
			data: '=',
			options: '=?',
			width: '=',
			height: '=',
		},
		template : '<canvas></canvas>',
		link : link
	};
}]);
angular.module('ng-charts').directive('hBarChart', ['ng-charts.utils', 'ng-charts.defaults', function(utils, defaults) {
	"use strict";

	var chartDefaults = {
		scaleLineColor : "rgba(0,0,0,.2)",
		scaleLineWidth : 1,
		scaleShowLabels : true,
		scaleShowGridLines : true,
		scaleGridLineColor : "rgba(0,0,0,.1)",
		scaleGridLineWidth : 1,
		barShowStroke : true,
		barStrokeWidth : 2,
		barValueSpacing : 5,
		barDatasetSpacing : 1,
	};

	var HorizontalBarChart = function(data, config, canvas){
		var widestYLabel = 1,		// Used to record the width of the longest sata series
			datasetSize = data.datasets.length,
			ctx = canvas.getContext('2d'),
			height = canvas.height,
			width = canvas.width,
			valueBounds = utils.getValueBounds(data.datasets),
			xScale = utils.calculateScale(valueBounds.maxY, valueBounds.minY, config.yFilters, config.zeroYAxis, config.yScaleLimits),
			graphDimensions = calculateDrawingSizes();

		utils.animationLoop(config, drawScale, drawBars, canvas);

		function drawScale(){
			var i;

			//Y axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y);
			ctx.lineTo(graphDimensions.orgin.x, 0);
			ctx.stroke();
			ctx.textAlign = "left";
			ctx.fillStyle = config.scaleFontColor;

			for(i = 0; i < data.labels.length; i++) {

				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y -((i+1) * graphDimensions.gridSize.y));

				if (config.scaleShowGridLines) {
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(width, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				} else {
					ctx.lineTo(graphDimensions.orgin.x-2, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				}

				ctx.stroke();
				ctx.fillText(data.labels[i], 0, ((i+0.5) * graphDimensions.gridSize.y));
			}

			// X axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y);
			ctx.lineTo(graphDimensions.orgin.x + graphDimensions.axisLength.x, graphDimensions.orgin.y);
			ctx.stroke();

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			for (i = 0; i < xScale.labels.length; i++){
				ctx.save();
				if (config.scaleShowLabels) {
					ctx.fillText(xScale.labels[i], graphDimensions.orgin.x + i*graphDimensions.gridSize.x, graphDimensions.orgin.y + config.scaleFontSize);
				}

				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x + i* graphDimensions.gridSize.x, graphDimensions.orgin.y);
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				ctx.lineTo(graphDimensions.orgin.x + i * graphDimensions.gridSize.x, 0);
				ctx.stroke();
			}
		}

		function drawBars(animPc){
			ctx.lineWidth = config.barStrokeWidth;
			//var top = height - graphDimensions.axisLength.y -
			for(var i = 0; i < datasetSize; i++) {
				var dataset = data.datasets[i];

				for (var j = 0; j < dataset.y.length; j++){

					var barOffset = j*graphDimensions.gridSize.y + i*(graphDimensions.barWidth  + config.barStrokeWidth) + (i+1)*config.barDatasetSpacing + config.barValueSpacing,
						xPoint = graphDimensions.orgin.x + animPc*dataset.y[j]/(xScale.maxValue - xScale.minValue)*graphDimensions.axisLength.x;

					ctx.fillStyle = data.datasets[i].fillColor  || utils.getColor(i, j, datasetSize);
					ctx.strokeStyle = data.datasets[i].strokeColor  || utils.getColor(i, j, datasetSize);

					ctx.beginPath();
					ctx.moveTo(graphDimensions.orgin.x, barOffset);
					ctx.lineTo(xPoint, barOffset);
					ctx.lineTo(xPoint, barOffset + graphDimensions.barWidth);
					ctx.lineTo(graphDimensions.orgin.x, barOffset + graphDimensions.barWidth);

					if(config.barShowStroke){
						ctx.stroke();
					}

					ctx.closePath();
					ctx.fill();
				}
			}
		}

		function calculateDrawingSizes() {
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;

			var textLength = 0,
				widestYLabel = 0,
				widestXLabel = 0,
				labelSize = 40,
				i;

			// Determine the longest data label shown on Y axis
			for (i = 0; i < data.labels.length; i++) {
				textLength = ctx.measureText(data.labels[i]).width;
				widestYLabel = (textLength > widestYLabel) ? textLength : widestYLabel;
			}
			// Add padding between the label and the axis
			widestYLabel += 10;

			for(i = 0; i < xScale.labels.length; i++) {
				textLength = ctx.measureText(xScale.labels[i]).width;
				widestXLabel = (textLength > widestXLabel) ? textLength : widestXLabel;
			}


			//How many horizontal lines will the label take
			var labelHeight = (widestYLabel/labelSize) * config.scaleFontSize;

			var yAxisLength = height - labelHeight - config.scaleFontSize,
				xAxisLength = width - widestYLabel - widestXLabel/2,
				yAxisPosX = Math.max(widestXLabel, widestYLabel),
				xAxisPosY = height - labelHeight - config.scaleFontSize,
				xGridSize = xAxisLength/(xScale.labels.length-1),
				yGridSize = yAxisLength/data.labels.length,
				//barWidth = (yGridSize - config.scaleGridLineWidth*2 - config.barValueSpacing*2 - (config.barDatasetSpacing*datasetSize-1) - ((config.barStrokeWidth/2)*datasetSize-1))/datasetSize;
				barWidth = (yGridSize - config.barValueSpacing)/datasetSize - config.barDatasetSpacing - 2*config.barStrokeWidth;

			return {
				orgin : {'x' : yAxisPosX, 'y' : xAxisPosY},
				axisLength : {'x' : xAxisLength, 'y' : yAxisLength},
				gridSize : {'x' : xGridSize, 'y' : yGridSize},
				yLabelHeight : config.scaleFontSize,
				barWidth : barWidth
			};
		}
	};

	function link(scope, element, attr) {
		var canvas = element[0],
			config = angular.extend(chartDefaults, defaults);

		config = angular.extend(config, scope.options);
		utils.setCanvasSize(canvas, scope.width, scope.height);

		scope.instance = new HorizontalBarChart(scope.data, config, canvas);
	}

	return {
		replace: true,
		scope : {
			data: '=',
			options: '=?',
			width: '=',
			height: '='
		},
		template : '<canvas></canvas>',
		link : link
	};
}]);
angular.module('ng-charts').directive('lineChart', ['ng-charts.utils', 'ng-charts.defaults', function(utils, defaults) {
	"use strict";

	var chartDefaults = {
		scaleLineColor : "rgba(0,0,0,.1)",
		scaleLineWidth : 1,
		scaleShowLabels : true,
		scaleShowGridLines : true,
		scaleGridLineColor : "rgba(0,0,0,.1)",
		scaleGridLineFrequency : 1,
		scaleGridLineWidth : 1,
		bezierCurve : true,
		pointDot : true,
		pointDotRadius : 6,
		pointDotStrokeWidth : 1,
		datasetStroke : true,
		datasetStrokeWidth : 6,
		datasetFill : false,
	};

	var LineChart = function(data, config, canvas){

		var ctx = canvas.getContext('2d'),
			height = canvas.height,
			width = canvas.width,
			valueBounds = utils.getValueBounds(data.datasets),
			yScale = utils.calculateScale(valueBounds.maxY, valueBounds.minY, config.yFilters, config.zeroYAxis, config.yScaleLimits),
			xScale = utils.calculateScale(valueBounds.maxX, valueBounds.minX, config.xFilters, config.zeroXAxis, config.xScaleLimits),
			graphDimensions = calculateDrawingSizes();


		utils.animationLoop(config, drawScale, drawLines, canvas);

		function drawLines(animPc){
			var i,j;

			for (i = 0; i < data.datasets.length; i++) {
				var dataset = data.datasets[i];

				ctx.strokeStyle = data.datasets[i].strokeColor;
				ctx.lineWidth = config.datasetStrokeWidth;
				ctx.beginPath();

				// Move to the first point
				ctx.moveTo(xPos(dataset.x[0]), yPos(dataset.y[0]));

				for (j = 1; j < dataset.y.length; j++) {
					var xCord = xPos(dataset.x[j]),
						yCord = yPos(dataset.y[j]);

					if (config.bezierCurve){
						// Calculate bezier curve control points
						var xCP = (xCord + xPos(dataset.x[j-1]))/2,
							yCP = yPos(dataset.y[j-1]);

						ctx.bezierCurveTo(xCP, yCP, xCP, yCord, xCord, yCord);
					} else {
						ctx.lineTo(xCord, yCord);
					}
				}
				ctx.stroke();

				if (config.datasetFill) {
					ctx.lineTo(xPos(dataset.x[dataset.x.length-1]), graphDimensions.orgin.y);
					ctx.lineTo(xPos(dataset.x[0]), graphDimensions.orgin.y);

					ctx.closePath();
					ctx.fillStyle = data.datasets[i].fillColor;
					ctx.fill();
				} else {
					ctx.closePath();
				}

				if (config.pointDot) {
					ctx.fillStyle = data.datasets[i].pointColor;
					ctx.strokeStyle = data.datasets[i].pointStrokeColor;
					ctx.lineWidth = config.pointDotStrokeWidth;

					for (j = 0; j < data.datasets[i].y.length; j++) {
						var xVal = dataset.x[j],
							yVal = dataset.y[j];

						if (xVal >= xScale.minValue) {
							ctx.beginPath();
							ctx.arc(xPos(xVal), yPos(yVal), config.pointDotRadius, 0, Math.PI*2, true);
							ctx.fill();
							ctx.stroke();
						}
					}
				}

				// Clean up the edge from when user specifies a max value
				var edgeX = graphDimensions.orgin.x + (xScale.labels.length - 1) * graphDimensions.gridSize.x + 0.5*config.scaleLineWidth,
					edgeY = graphDimensions.orgin.y;

				ctx.clearRect(edgeX, 0, width, edgeY);
			}

			function yPos(value) {
				return graphDimensions.orgin.y - animPc*(value-yScale.minValue)/(yScale.maxValue-yScale.minValue)*graphDimensions.axisLength.y;
			}

			function xPos(value){
				return Math.max(graphDimensions.orgin.x,
								graphDimensions.orgin.x + (value-xScale.minValue)/(xScale.maxValue-xScale.minValue)*graphDimensions.axisLength.x);
			}
		}

		function drawScale(){
			var i;

			//X axis line
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y);
			ctx.lineTo(graphDimensions.orgin.x + graphDimensions.axisLength.x, graphDimensions.orgin.y);

			ctx.stroke();

			if (graphDimensions.rotateLabels > 0) {
				ctx.save();
				ctx.textAlign = "right";
			} else {
				ctx.textAlign = "center";
			}

			ctx.fillStyle = config.scaleFontColor;

			for (i = 0; i < xScale.labels.length; i++) {
				ctx.save();

				if (graphDimensions.rotateLabels > 0) {
					ctx.translate(graphDimensions.orgin.x + i*graphDimensions.gridSize.x, graphDimensions.orgin.y + config.scaleFontSize);
					ctx.rotate(-(graphDimensions.rotateLabels * (Math.PI/180)));
					ctx.fillText(xScale.labels[i], 0,0);
					ctx.restore();
				} else {
					ctx.fillText(xScale.labels[i], graphDimensions.orgin.x + i*graphDimensions.gridSize.x, graphDimensions.orgin.y + config.scaleFontSize+3);
				}

				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x + i * graphDimensions.gridSize.x, graphDimensions.orgin.y+3);

				//Value used to test if a grid line should be drawn or skipped
				var gridLineTest = Math.round(i/config.scaleGridLineFrequency) - i/config.scaleGridLineFrequency;

				//Check i isnt 0, so we dont go over the Y axis twice.
				if(config.scaleShowGridLines && i > 0 && gridLineTest === 0){
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(graphDimensions.orgin.x + i * graphDimensions.gridSize.x, 5);
				} else {
					ctx.lineTo(graphDimensions.orgin.x + i * graphDimensions.gridSize.x, graphDimensions.orgin.y+3);
				}
				ctx.stroke();
			}

			//Y axis
			ctx.lineWidth = config.scaleLineWidth;
			ctx.strokeStyle = config.scaleLineColor;
			ctx.beginPath();
			ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y+5);
			ctx.lineTo(graphDimensions.orgin.x,5);
			ctx.stroke();

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";

			for (i = 0; i < yScale.steps+1; i++) {
				ctx.beginPath();
				ctx.moveTo(graphDimensions.orgin.x, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));

				if (config.scaleShowGridLines) {
					ctx.lineWidth = config.scaleGridLineWidth;
					ctx.strokeStyle = config.scaleGridLineColor;
					ctx.lineTo(graphDimensions.orgin.x + graphDimensions.axisLength.x + 5, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				} else {
					ctx.lineTo(graphDimensions.orgin.x-0.5, graphDimensions.orgin.y - ((i+1) * graphDimensions.gridSize.y));
				}

				ctx.stroke();

				if (config.scaleShowLabels){
					ctx.fillText(yScale.labels[i], graphDimensions.orgin.x-8, graphDimensions.orgin.y - (i* graphDimensions.gridSize.y));
				}
			}
		}

		function calculateDrawingSizes(){
			//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily;

			// Calculate the Y Axis dimensions
			var yAxisLength = height,
				rotateLabels = 0,
				widestYLabel = 0,
				widestXLabel = 0,
				i;

			for (i = 0; i < xScale.labels.length; i++) {
				var textLength = ctx.measureText(xScale.labels[i]).width;
				//If the text length is longer - make that equal to longest text!
				widestXLabel = (textLength > widestXLabel)? textLength : widestXLabel;
			}

			if (width/xScale.labels.length < widestXLabel) {
				rotateLabels = 45;

				if (width/xScale.labels.length < Math.cos(rotateLabels) * widestXLabel) {
					rotateLabels = 90;
					yAxisLength -= widestXLabel;
				} else {
					yAxisLength -= Math.sin(rotateLabels) * widestXLabel;
				}
			} else {
				yAxisLength -= config.scaleFontSize;
			}

			//Add a little padding between the x line and the text
			yAxisLength -= (config.scaleFontSize + 5);

			// Calculate the X Axis dimensions

			//if we are showing the labels go through and check the widest y label
			if (config.scaleShowLabels){
				for (i = 0; i < yScale.labels.length; i++){
					var measuredText = ctx.measureText(yScale.labels[i]).width;
					widestYLabel = (measuredText > widestYLabel)? measuredText : widestYLabel;
				}
				//Add a little extra padding from the y axis
				widestYLabel += 10;
			}

			var xAxisLength = width - widestYLabel - widestXLabel,
				yAxisPosX = Math.max(widestXLabel, widestYLabel),
				xAxisPosY = yAxisLength + config.scaleFontSize/2,
				xGridSize = Math.floor(xAxisLength/(xScale.labels.length-1)),
				yGridSize = Math.floor(yAxisLength/yScale.steps);

			return {
				orgin : {'x' : yAxisPosX, 'y' : xAxisPosY},
				axisLength : {'x' : xAxisLength, 'y' : yAxisLength},
				gridSize : {'x' : xGridSize, 'y' : yGridSize},
				yLabelHeight : config.scaleFontSize,
				rotateLabels : rotateLabels,
			};
		}
	};

	function link(scope, element, attr) {
		var config = angular.extend(chartDefaults, defaults),
			canvas = element[0];

		config = angular.extend(config, scope.options);
		console.log(config);
		utils.setCanvasSize(canvas, scope.width, scope.height);

		scope.instance = new LineChart(scope.data, config, canvas);
	}

	return {
		replace: true,
		scope : {
			data: '=',
			options: '=?',
			width: '=',
			height: '='
		},
		template : '<canvas></canvas>',
		link : link
	};
}]);
angular.module('ng-charts').directive('pieChart', ['ng-charts.utils', 'ng-charts.defaults', function(utils, defaults) {
	"use strict";

	var chartDefaults = {
		segmentShowStroke : true,
		segmentStrokeColor : "#fff",
		segmentStrokeWidth : 2,
		animateRotate : true,
		animateScale : false,
		legend : true,
		innerCutout : 0
	};

	var PieChart = function(data, config, canvas) {
		var ctx = canvas.getContext('2d'),
			height = canvas.height,
			width = canvas.width,
			values = data.datasets[0].y,
			dimensions = calculateDrawingSizes(),
			segmentTotal = 0;

		for (var i = 0; i < values.length; i++) {
			segmentTotal += values[i];
		}

		utils.animationLoop(config, null, drawPieSegments, canvas);

		function drawPieSegments (animationDecimal) {
			var cumulativeAngle = -Math.PI/2,
				scaleAnimation = 1,
				rotateAnimation = 1;

			if (config.animation) {
				if (config.animateScale) {
					scaleAnimation = animationDecimal;
				}
				if (config.animateRotate){
					rotateAnimation = animationDecimal;
				}
			}

			for (var i = 0; i < values.length; i++) {
				var segmentAngle = rotateAnimation * ((values[i]/segmentTotal) * (Math.PI*2));

				ctx.beginPath();
				ctx.arc(dimensions.center.x, dimensions.center.y, scaleAnimation * dimensions.radius, cumulativeAngle,cumulativeAngle + segmentAngle,false);
				ctx.arc(dimensions.center.x, dimensions.center.y, scaleAnimation * dimensions.innerRadius, cumulativeAngle + segmentAngle, cumulativeAngle,true);

				ctx.closePath();
				ctx.fillStyle = utils.getColor(0, i, 1);
				ctx.fill();

				if(config.segmentShowStroke){
					ctx.lineWidth = config.segmentStrokeWidth;
					ctx.strokeStyle = config.segmentStrokeColor;
					ctx.stroke();
				}
				cumulativeAngle += segmentAngle;

				// Add legend elements if requested
				if (config.legend) {
					ctx.fillRect(dimensions.legendX, dimensions.legendY+(2*i)*dimensions.legendTitleSize, dimensions.legendTitleSize, dimensions.legendTitleSize);
					ctx.fillStyle = '#000';
					ctx.textBaseline = 'middle';
					ctx. fillText(data.labels[i], dimensions.legendX + dimensions.legendTitleSize+10, dimensions.legendY + (2*i+0.5)*dimensions.legendTitleSize);
				}
			}
		}

		function calculateDrawingSizes() {
			var dimensions = {};

			if (config.legend) {
				dimensions.legendWidth = 200;
				dimensions.radius = Math.min(height/2, (width-dimensions.legendWidth)/2) - 5;
				dimensions.center = {
					x : (width-dimensions.legendWidth)/2,
					y : height/2
				};

				dimensions.legendTitleSize = 25;
				dimensions.legendY = height/2 - data.datasets[0].y.length*dimensions.legendTitleSize;
				dimensions.legendX = width - dimensions.legendWidth + 20;	// Add a gap between the chart and the legend
			} else {
				dimensions.radius = Math.min(height/2, width/2) - 5;
				dimensions.center = {
					x : width/2,
					y : height/2
				};
			}

			dimensions.innerRadius = dimensions.radius * (config.innerCutout/100);

			return dimensions;
		}
	};

	function link(scope, element, attr) {
		var config = angular.extend(chartDefaults, defaults),
			canvas = element[0];

		if (scope.options) {
			config = angular.extend(config, scope.options);
		}

		utils.setCanvasSize(canvas, scope.width, scope.height);

		scope.instance = new PieChart(scope.data, config, canvas);
	}

	return {
		replace: true,
		scope : {
			data: '=',
			options: '=?',
			width: '=',
			height: '=',
		},
		template : '<canvas></canvas>',
		link : link
	};
}]);
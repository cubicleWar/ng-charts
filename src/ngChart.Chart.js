angular.module('ng-charts').factory('ng-charts.Chart', ['$filter', function($filter){
	"use strict";

	function Chart(canvas, width, height) {
		this.ctx = canvas.getContext('2d');
		this.setCanvasSize(canvas, width, height);
	}

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

	Chart.prototype.getColor = function(datasetIndex, valueIndex, noDatasets) {
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

	Chart.prototype.setCanvasSize = function(canvas, width, height) {
		canvas.width = width;
		canvas.height = height;

		if (window.devicePixelRatio) {
			var devicePixelRatio = window.devicePixelRatio;

			canvas.style.width = width + "px";
			canvas.style.height = height + "px";
			canvas.height *= devicePixelRatio;
			canvas.width *= devicePixelRatio;
			this.ctx.scale(devicePixelRatio, devicePixelRatio);
		}
	};

	Chart.prototype.getValueBounds = function(datasets) {
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

	Chart.prototype.calculateScale = function(maxValue, minValue, filters, zeroAxis, scaleLimits) {
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

	Chart.prototype.populateLabels = function(filters, labels, numberOfSteps, graphMin, stepValue) {
		for (var i = 0; i < numberOfSteps + 1; i++) {
			var label = graphMin + (stepValue * i);

			if (filters) {
				label = applyFilters(label, filters);
			}

			labels.push(label);
		}
    };

	function applyFilters(value, filterSpec) {
		var filters = filterSpec.trim().split('|'),
			result = value;

		for (var i = 0; i < filters.length; i++) {
			var args = filters[i].trim().split(':'),
				filter = $filter(args.shift().trim());

			args.unshift(result);
			result = filter.apply(null, args);
		}

		return result;
	}

	function capValue(valueToCap, maxValue, minValue){
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
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	Chart.prototype.animationLoop = function(config, drawScale, drawData, canvas) {
		var animFrameAmount = (config.animation)? 1/capValue(config.animationSteps, Number.MAX_VALUE, 1) : 1,
			easingFunction = animationOptions[config.animationEasing],
			percentAnimComplete =(config.animation)? 0 : 1,
			that = this;

		if (typeof drawScale !== "function") drawScale = function(){};

		requestAnimFrame(animLoop);

		function animateFrame(){
			var easeAdjustedAnimationPercent = (config.animation) ? capValue(easingFunction(percentAnimComplete),null,0) : 1;

			that.ctx.clearRect(0, 0, canvas.width, canvas.height);
			// Draw the chart background
			that.ctx.fillStyle = config.bgColor;
			that.ctx.fillRect(0, 0, canvas.width, canvas.height);

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

	return Chart;
}]);
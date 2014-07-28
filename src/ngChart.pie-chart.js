angular.module('ng-charts').directive('pieChart', ['ng-charts.Chart', 'ng-charts.defaults', function(Chart, defaults) {
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

	function PieChart(data, config, canvas, width, height) {

		Chart.call(this, canvas, width, height);

		var that = this,
			values = data.datasets[0].y,
			dimensions = calculateDrawingSizes(),
			segmentTotal = 0;

		for (var i = 0; i < values.length; i++) {
			segmentTotal += values[i];
		}

		that.animationLoop(config, null, drawPieSegments, canvas);

		function drawPieSegments(animationDecimal) {
			var cumulativeAngle = -Math.PI/2,
				scaleAnimation = 1,
				rotateAnimation = 1,
				ctx = that.ctx;

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
				ctx.fillStyle = that.getColor(0, i, 1);
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
					ctx.fillText(data.labels[i], dimensions.legendX + dimensions.legendTitleSize+10, dimensions.legendY + (2*i+0.5)*dimensions.legendTitleSize);
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
	}

	PieChart.prototype = Object.create(Chart.prototype);
	PieChart.prototype.constructor = PieChart;


	function link(scope, element, attr) {
		var config = angular.extend(chartDefaults, defaults, scope.options),
			canvas = element[0];

		scope.instance = new PieChart(scope.data, config, canvas, scope.width, scope.height);
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
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

	var HorizontalBarChart = function(data, config, canvas, width, height){
		var widestYLabel = 1,		// Used to record the width of the longest sata series
			datasetSize = data.datasets.length,
			ctx = canvas.getContext('2d'),
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

		scope.instance = new HorizontalBarChart(scope.data, config, canvas, scope.width, scope.height);
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
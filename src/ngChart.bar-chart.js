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

				for (var j = 0; j < dataset.data.y.length; j++) {

					var barOffset = graphDimensions.orgin.x + config.barValueSpacing + graphDimensions.gridSize.x*j + graphDimensions.barWidth*i + config.barDatasetSpacing*i + config.barStrokeWidth*i,
						yPos = animPc*dataset.data.y[j]/(yScale.maxValue - yScale.minValue)*graphDimensions.axisLength.y;

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
				yAxisPosX = width - widestXLabel/2 - xAxisLength,
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
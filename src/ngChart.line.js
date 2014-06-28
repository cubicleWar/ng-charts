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
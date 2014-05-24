#ng-charts


Simple HTML5 charts for angular based on the awesome [Charts.js](http://www.charts.org).

Ng-charts is not just a wrapper around chartsjs but a re-implementation with the goals of being angular native. Ng-charts attempts to optimise charts.js through simplification of the library and improvement to code structure.

## What are the enhancements in ngCharts?

Ng-charts introduces a few new features :

- Uniform data interface to allow switching of chart types without having to reformat the data.
- Horizontal bar chart.
- New and improved algorithum for calculating scale intervals.
- Use of angular filters for formatting axis labels.
- Addition of legends on the pie and donunt charts.
- Line chart now functions as a real line chart and plots x-y numeric data.
- Passes jshint

## What are the limitations compared to Chart.js?

Ng-charts currently only supports the line, bar, horizontal bar, pie and doughnut charts. However ng-charts is a work in progress and over time additonal chart types will be supported.

## Quickstart Guide

## Installation

### Using Bower

	bower install ng-charts

### Include Required Libraries

Ng-charts requires angularJS so to get started first include the angularJS and ngCharts libraries to your page.

	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular.min.js"></script>
	<script src='ngChart.min.js'></script>

Alternatively if you only need to use a single chart type you can include the source for invidual charts e.g. for a pie chart :

	<script src='../src/ngChart.Module.js'></script>
	<script src='../src/ngChart.Utils.js'></script>
	<script src='../src/ngChart.pie-chart.js'></script>


Then make sure you add ngCharts to your Angular app requirements :

	angular.module('demo', ['ng-charts']);

## Creating a Chart

Charts may be created by using the ngCharts directives as follows :

	<canvas line-chart height='graph.height' width='graph.width' data='lineChartData' options='options'></canvas>

Examples of each of the chart types in use may be found is available in the `examples` directory.

## Chart Data

The structure of the chart data for ng-charts is somewhat different from the orginal charts.js. Rather than have different data structures for each chart, all charts have the same structure as shown below:

	$scope.chart = {
		labels : ['Series 1', 'Series 2', 'Series 3', 'Series 4'],
		datasets : [
			{
				y : [1,2,3,4],
			},
			{
				y : [4,3,2,1]
			}
		]
	}

For charts such as line graphs where data is required for both the x and y axis the data object is specififed as follows:

	{
		x : [60,70,80,90,100,110,120],
		y : [65,59,90,81,56,55,40]
	}

The examples directory is the best place to see data specification for each chart type.

## Chart Options

The chart options are largely the same as charts.js however there are some notable changes :

### Specifying the Scale

There are several options to specify how the scale is selected, the first two are whether to make the orgin of x and y axis' 0 :

	// Whether to start the X or Y axis scale at 0
	zeroXAxis : true,
	zeroYAxis : true,

_General tip : To prevent distortion of your results you should leave this as true unless it really makes sense not to such as an axis showing dates._

Additionaly you can also specify a minimum and maximum value of each scale using the `xScaleLimits` and `yScaleLimits` options. Note the max value is more a guidline than a hard limit, ng-charts will use a  maximum that sits on a chart gridline and  is greater than or equal to your specified max value.

	xScaleLimits : { min: null, max : null },
	yScaleLimits : { min: null, max : null },

### Modifying Axis Labels

Rather than using its own templating system for modifying axis scale labels ng-charts falls back on the angular `$filter` service.

	xFilters : 'number:0',
	yFilters : 'number:0',

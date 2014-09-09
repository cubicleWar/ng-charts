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
	bgColor: 'rgba(255,255,255,1)'
});

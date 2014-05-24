angular.module('demo', ['ng-charts'])
.controller('demoCtrl', ['$scope', function($scope) {

	$scope.graph = {
		height : 500,
		width : 600
	}

	$scope.doughnutOptions = {
		innerCutout : 50
	};

	$scope.barChartData = {
		labels : ['Test 1', 'Test 2', 'Test 3', 'Test 4'],
		datasets : [
			{
				data : { y : [1,2,3,4]},
			},
			{
				data : { y : [4,3,2,1]}
			}
		]
	};

	$scope.pieChartData = {
		labels : ['Test 1', 'Test 2', 'Test 3'],
		datasets : [
			{
				data : { y : [3,3,3]},
			}
		]
	};

	$scope.lineChartData = {
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,1)",
				pointColor : "rgba(220,220,220,1)",
				pointStrokeColor : "#fff",
				data : {
					x : [60,70,80,90,100,110,120],
					y : [65,59,90,81,56,55,40]
				}

			},
			{
				fillColor : "rgba(151,187,205,0.5)",
				strokeColor : "rgba(151,187,205,1)",
				pointColor : "rgba(151,187,205,1)",
				pointStrokeColor : "#fff",
				data : {
					x : [40,52,60,77,87,90,99],
					y : [28,48,40,19,96,27,99]
				}
			},
			{
				fillColor : "rgba(255,187,205,0.5)",
				strokeColor : "rgba(255,187,205,1)",
				pointColor : "rgba(255,187,205,1)",
				pointStrokeColor : "#fff",
				data : {
					x : [20,47,81,90,110,112,115],
					y : [20,8,45,19,34,44,50]
				}
			}
		]
	};
}]);
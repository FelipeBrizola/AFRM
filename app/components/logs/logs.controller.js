(function() {

    'use strict';

    angular.module('afrmApp').controller('LogsController', LogsController);

    LogsController.$inject = [ '$scope', 'logsService' ];

    function LogsController($scope, logsService) {

        (function init() {

            $scope.tableParams = {
                'limit': 5,
                'page': 1
            };

            $scope.isLoadingLogs = true;
          
            logsService.get()
                .success(function(logs) {
                    
                    logs.forEach(function(log) {
                        log.date = moment(log.date).format('DD/MM/YYYY - hh:mm');
                    });

                    $scope.logs = logs;

                    $scope.isLoadingLogs = false;
                    $scope.tableParams.total = logs.length;
                })
                .error(function(reason) {
                    $scope.isLoadingLogs = false;
                    console.log(reason); // eslint-disable-line no-console
                });

        }());
    }
}());

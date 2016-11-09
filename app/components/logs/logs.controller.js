(function() {

    'use strict';

    angular.module('afrmApp').controller('LogsController', LogsController);

    LogsController.$inject = [ '$scope', 'logsService' ];

    function LogsController($scope, logsService) {

        (function init() {
          
            logsService.get()
                .success(function(logs) {
                    $scope.logs = logs;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                });

        }());
    }
}());

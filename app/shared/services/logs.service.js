(function () {

    'use strict';

    function LogsService($http, $rootScope) {

        var module = 'logs';

        this.get = function () {
            return $http.get($rootScope.serverUrl + module);
        };

    }

    LogsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('logsService', LogsService);

}());
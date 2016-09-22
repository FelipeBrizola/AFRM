(function () {

    'use strict';

    function CompaniesService($http, $rootScope) {

        var module = 'companies';

        this.create = function (company) {
            return $http.post($rootScope.serverUrl + module, company);
        };

        this.update = function (company) {
            return $http.put($rootScope.serverUrl + module, company);
        };

        this.get = function () {
            return $http.get($rootScope.serverUrl + module);
        };
    }

    CompaniesService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('companiesService', CompaniesService);

}());
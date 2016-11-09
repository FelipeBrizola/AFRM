(function () {

    'use strict';

    function CompaniesService($http, $rootScope) {

        var module = 'companies';

        this.create = function (company) {
            return $http.post($rootScope.serverUrl + module, company);
        };

        this.update = function (company) {
            company.changer = JSON.parse(window.localStorage.getItem('CREDENTIAL'))._id;
            return $http.put($rootScope.serverUrl + module, company);
        };

        this.get = function (name) {
            var url = $rootScope.serverUrl + module;

            if (name)
                url = url + '/' + name;

            return $http.get(url);
        };
    }

    CompaniesService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('companiesService', CompaniesService);

}());
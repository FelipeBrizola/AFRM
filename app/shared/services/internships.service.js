(function () {

    'use strict';

    function InternshipsService($http, $rootScope) {

        var module = 'internships';

        this.get = function (query) {
            var url = $rootScope.serverUrl + module + '/?';

            if (query.credentialId)
                url += 'credentialId=' + query.credentialId;

            if (query.status)
                url += '&status=' + query.status;

            if (query.name)
                url += '&name=' + query.name;

            return $http.get(url);
        };

        this.update = function (internship) {
            internship.changer = JSON.parse(window.localStorage.getItem('CREDENTIAL'))._id;
            return $http.put($rootScope.serverUrl + module, internship);
        };

    }

    InternshipsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('internshipsService', InternshipsService);

}());
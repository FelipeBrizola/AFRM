(function () {

    'use strict';

    function InternshipsService($http, $rootScope) {

        var module = 'internships';

        this.get = function (studentId) {
            var url = $rootScope.serverUrl + module + '/';

            if (studentId)
                url += studentId;

            return $http.get(url);
        };
    }

    InternshipsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('internshipsService', InternshipsService);

}());
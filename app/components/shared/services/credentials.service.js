(function () {

    'use strict';

    function CredentialsService($http, $rootScope) {

        var module = 'credentials';

        this.login = function (credential) {
            var querystring = '?email=' + credential.email + '&password=' + credential.password;

            return $http.get($rootScope.serverUrl + module + querystring);
        };

        this.create =  function(usr) {
            return $http.post($rootScope.serverUrl + module, usr);
        };

        this.logout = function (token) {
            return $http.get($rootScope.serverUrl + module + '/' + token);
        };
    }

    CredentialsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('credentialsService', CredentialsService);

}());
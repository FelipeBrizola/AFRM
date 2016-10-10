(function() {

    'use strict';

    angular.module('afrmApp').controller('LoginController', LoginController);

    LoginController.$inject = [ '$scope', 'credentialsService', '$location' ];

    function LoginController($scope, credentialsService, $location) {

        $scope.login = function(email, pass) {
            var credential = {
                'email': email,
                'password': pass
            };

            credentialsService.login(credential)
                .success(function (credential) {
                    if (credential) {
                        window.localStorage.setItem('CREDENTIAL', JSON.stringify(credential));
                        $location.path('/estagios');
                    }
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                });
        };

        (function init() {

        }());
    }
}());

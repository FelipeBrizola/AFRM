(function() {

    'use strict';

    angular.module('afrmApp').controller('LoginController', LoginController);

    LoginController.$inject = [ '$scope', 'credentialsService' ];

    function LoginController($scope, credentialsService) {

        $scope.login = function(email, pass) {
            var credential = {
                'email': email,
                'password': pass
            };

            credentialsService.login(credential)
                .success(function (token) {
                    if (token)
                        window.sessionStorage.setItem('TOKEN', token);
                })
                .error(function(reason) {
                    console.log(reason);
                });
        };

        (function init() {
            console.log('logincontroller');
        }());
    }
}());

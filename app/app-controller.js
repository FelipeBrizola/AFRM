(function () {
    'use strict';

    // injecting dependencies
    MainController.$inject = [
        '$scope', '$rootScope', '$location'
    ];

    // registering on angular
    angular.module('afrmApp').controller('MainController', MainController);

    // Main Controller
    function MainController($scope, $rootScope, $location) {

        // $rootScope.serverUrl = 'http://localhost:3000/';
        $rootScope.serverUrl = 'https://dev-sistemas-server.herokuapp.com/';

        $scope.menu = function(path) {
            $location.path(path);
        };

        $scope.logout =  function () {
            window.localStorage.removeItem('CREDENTIAL');
            $location.path('/login');
        };

        $rootScope.$on('$routeChangeSuccess', function () {

            $scope.credential = JSON.parse(window.localStorage.getItem('CREDENTIAL'));

            if ($location.path() === '/empresas')
                $scope.currentMenuIndex = 0;

            else if ($location.path() === '/solicitacoes')
                $scope.currentMenuIndex = 1;

            else
                $scope.currentMenuIndex = -1;

            $rootScope.isLogin = $location.path() === '/login' ? true : false;

        });

    }
}());

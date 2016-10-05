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

        $rootScope.$on('$routeChangeSuccess', function () {

            if ($location.path() === '/empresas')
                $scope.currentMenuIndex =1;

            else if ($location.path() === '/solicitacao')
                $scope.currentMenuIndex = 0;

            else if ($location.path() === '/estagios')
                $scope.currentMenuIndex = 2;

            else
                $scope.currentMenuIndex = -1;

            $rootScope.isLogin = $location.path() === '/login' ? true : false;

        });

    }
}());

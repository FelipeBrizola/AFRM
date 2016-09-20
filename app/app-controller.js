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

        $rootScope.serverUrl = 'http://localhost:3000/';

        $scope.menu = function(path) {
            $location.path(path);
        };
    }
}());

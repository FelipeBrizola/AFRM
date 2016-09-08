(function () {
    'use strict';

    // injecting dependencies
    MainController.$inject = [
        '$scope', '$rootScope'
    ];

    // registering on angular
    angular.module('afrmApp').controller('MainController', MainController);

    // Main Controller
    function MainController($scope, $rootScope) {

        $rootScope.serverUrl = 'http://localhost:3000/';
    }
}());

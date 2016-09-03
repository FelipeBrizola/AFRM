(function () {
    'use strict';

    angular.module('afrmApp').config(['$routeProvider', '$locationProvider', ApplicationConfig]);

    function ApplicationConfig($routeProvider, $locationProvider) {
        $routeProvider

            .when('/', {
                'templateUrl' : 'app/components/home/home.html',
                'controller'  : 'HomeController'
            })

            .otherwise({
                'redirectTo': '/'
            });

        $locationProvider.html5Mode(true);
    }
}());
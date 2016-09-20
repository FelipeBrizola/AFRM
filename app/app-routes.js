(function () {
    'use strict';

    angular.module('afrmApp').config(['$routeProvider', '$locationProvider', ApplicationConfig]);

    function ApplicationConfig($routeProvider, $locationProvider) {
        $routeProvider

            .when('/', {
                'templateUrl' : 'app/components/home/home.html',
                'controller'  : 'HomeController'
            })

            .when('/login', {
                'templateUrl' : 'app/components/login/login.html',
                'controller'  : 'LoginController'
            })

            .when('/solicitacao', {
                'templateUrl' : 'app/components/solicitation/solicitation.html',
                'controller'  : 'SolicitationController'
            })

            .when('/empresas', {
                'templateUrl' : 'app/components/companies/companies.html',
                'controller'  : 'CompaniesController'
            })

            .when('/registro', {
                'templateUrl' : 'app/components/login/register.html',
                'controller'  : 'RegisterController'
            })

            .otherwise({
                'redirectTo': '/'
            });

        $locationProvider.html5Mode(true);
    }
}());
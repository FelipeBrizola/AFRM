(function () {
    'use strict';

    // Module dependencies injection
    angular.module('afrmApp', [
        'ngMaterial',
        'ngAnimate',
        'ngRoute',
        'angular.filter'
    ])

        .config(function ($mdThemingProvider, $mdDateLocaleProvider) {

            // Date format configuration
            $mdDateLocaleProvider.formatDate = function(date) {
                return moment(date).format('YYYY-MM-DD');
            };

            // Pling Color Pallete Definition
            $mdThemingProvider.definePalette('plingPallete', {
                '50': '1165ae',
                '100': 'ffcdd2',
                '200': 'ef9a9a',
                '300': 'e57373',
                '400': 'ef5350',
                '500': 'f44336',
                '600': 'e53935',
                '700': 'd32f2f',
                '800': 'c62828',
                '900': 'b71c1c',
                'A100': 'ff8a80',
                'A200': 'ff5252',
                'A400': 'ff1744',
                'A700': 'd50000',
                'contrastDefaultColor': 'light'
            });

            // Theme configuration
            $mdThemingProvider
                .theme('default')
                .primaryPalette('plingPallete', { 'default' : '50' })
                .accentPalette('blue-grey', { 'default' : '400' })
                .backgroundPalette('grey',  { 'default' : '50' });
        });

}());

(function () {
    'use strict';

    // injecting dependencies
    MainController.$inject = [
        '$scope', '$rootScope', '$timeout',
        '$location', '$window',
        '$mdToast'
    ];

    // registering on angular
    angular.module('afrmApp').controller('MainController', MainController);

    // Main Controller
    function MainController($scope, $rootScope, $timeout, $location, $window, $mdToast) {

        var last = {
            'bottom' : true,
            'top'    : false,
            'left'   : true,
            'right'  : false
        };

        // Configurações
        $rootScope.config = {

            'chat': {
                'isLoadOnStart' : false
            }

        };

        // store the url to redirect later in case the user comes from other domain
        $rootScope.isAppLoaded  = false;
        $rootScope.loadingLayer = false;
        $rootScope.isAppLoading = true;

        /* TOAST NOTIFIER */
        function sanitizePosition() {
            var current = $scope.toastPosition;

            if (current.bottom && last.top) { current.top = false; }
            if (current.top && last.bottom) { current.bottom = false; }
            if (current.right && last.left) { current.left = false; }
            if (current.left && last.right) { current.right = false; }

            last = angular.extend({}, current);
        }

        $scope.toastPosition = angular.extend({}, last);
        $scope.getToastPosition = function () {
            sanitizePosition();

            return Object.keys($scope.toastPosition)
                .filter(function (pos) { return $scope.toastPosition[pos]; })
                .join(' ');
        };

        $rootScope.toast = function (text, delay) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .position($scope.getToastPosition())
                    .hideDelay(delay || 2000)
            );
        };

        // Route change
        $rootScope.$on('$routeChangeStart', function () {
            console.log('>>>');
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            console.log('<<<');
        });

    }
}());

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
(function() {

    'use strict';

    angular.module('afrmApp').controller('HomeController', HomeController);

    HomeController.$inject = [ '$scope' ];

    function HomeController() {
        console.log('teste');
    }
}());

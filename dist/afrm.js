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

            // Theme configuration
            $mdThemingProvider
                .theme('forest')
                .primaryPalette('blue')
                .accentPalette('teal')
                .warnPalette('red')
                .backgroundPalette('grey');
        });

}());

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

            .when('/register', {
                'templateUrl' : 'app/components/login/register.html',
                'controller'  : 'RegisterController'
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

(function() {

    'use strict';

    angular.module('afrmApp').controller('RegisterController', RegisterController);

    RegisterController.$inject = [ '$scope', 'credentialsService', '$location', '$mdToast', '$timeout' ];

    function RegisterController($scope, credentialsService, $location, $mdToast, $timeout) {

        $scope.createAccount = function(usr) {
            credentialsService.create(usr)
                .success(function(result) {
                    if (result) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Usuário criado com sucesso')
                                .position('bottom')
                                .hideDelay(3000)
                        );
                        $timeout(function() {
                            $location('/login');
                        }, 3000);
                    }

                })
                .error(function(reason) {
                    console.log(reason);
                });
        };

    }
}());

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
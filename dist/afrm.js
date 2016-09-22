(function () {
    'use strict';

    // Module dependencies injection
    angular.module('afrmApp', [
        'ngMaterial',
        'ngAnimate',
        'ngRoute',
        'angular.filter',
        'md.data.table'
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
(function() {

    'use strict';

    angular.module('afrmApp').controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = [ '$scope', '$mdDialog', 'companiesService' ];

    function CompaniesController($scope, $mdDialog, companiesService) {

        // cria ou edita company
        $scope.showDialog = function(company) {

            $mdDialog.show({
                'controller': 'ManageCompanyController',
                'templateUrl': 'app/shared/templates/modals/manage-company.html',
                'parent': angular.element(document.body),
                'locals': { 'company': company || null },
                'clickOutsideToClose':true
            }).then(function(company, isNewCompany) {
                if (company) {
                    if (isNewCompany)
                        $scope.companies.push(company);
                    else {
                        $scope.companies.forEach(function(comp) {
                            if (comp._id === company._id)
                                comp =  company;
                        });
                    }

                }

            }, function() {});
        };

        (function init() {

            companiesService.get()
                .success(function(companies) {
                    $scope.companies = companies;
                })
                .error(function(reason) {
                    console.log(reason);
                });
        }());
    }
}());

(function() {

    'use strict';

    angular.module('afrmApp').controller('HomeController', HomeController);

    HomeController.$inject = [ '$scope' ];

    function HomeController($scope) {

        $scope.approveSolicitation =  function() {

        };

        $scope.insertSolicitation = function() {

        };
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

(function() {

    'use strict';

    angular.module('afrmApp').controller('SolicitationController', SolicitationController);

    SolicitationController.$inject = [ '$scope' ];

    function SolicitationController($scope) {

        $scope.approveSolicitation =  function() {

        };

        $scope.insertSolicitation = function() {

        };
    }
}());

(function () {

    'use strict';

    function CompaniesService($http, $rootScope) {

        var module = 'companies';

        this.create = function (company) {
            return $http.post($rootScope.serverUrl + module, company);
        };

        this.update = function (company) {
            return $http.put($rootScope.serverUrl + module, company);
        };

        this.get = function () {
            return $http.get($rootScope.serverUrl + module);
        };
    }

    CompaniesService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('companiesService', CompaniesService);

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
(function () {

    'use strict';

    function ManageCompanyController($scope, $mdDialog, companiesService, locals) {

        $scope.save = function(company) {
            var isNewCompany;

            $scope.isLoadingCompany = true;

            // put
            if ($scope.isEditing) {
                isNewCompany = false;
                companiesService.update(company)
                    .success(function (companyEdited) {
                        $scope.isLoadingCompany = false;
                        $mdDialog.hide(companyEdited, isNewCompany);
                    })
                    .error(function (reason) {
                        $scope.isLoadingCompany = false;
                        console.log(reason);
                    });
            }

            // post
            else {
                isNewCompany = true;
                companiesService.create(company)
                    .success(function (newCompany) {
                        $scope.isLoadingCompany = false;
                        $mdDialog.hide(newCompany, isNewCompany);
                    })
                    .error(function (reason) {
                        $scope.isLoadingCompany = false;
                        console.log(reason);
                    });
            }
        };

        (function init() {

            // edita ou cria empresa
            if (locals.company)
                $scope.isEditing = true;

            $scope.company = locals.company || {};

        })();
    }

    ManageCompanyController.$inject = [ '$scope', '$mdDialog', 'companiesService', 'locals' ];

    angular.module('afrmApp').controller('ManageCompanyController', ManageCompanyController);

}());
(function () {
    'use strict';

    // Module dependencies injection
    angular.module('afrmApp', [
        'ngMaterial',
        'ngAnimate',
        'ngRoute',
        'angular.filter',
        'md.data.table',
        'ui.mask'
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
            
            else if ($location.path() === '/logs')
                $scope.currentMenuIndex = 2;

            else
                $scope.currentMenuIndex = -1;

            $rootScope.isLogin = $location.path() === '/login' ? true : false;

        });

    }
}());

(function () {
    'use strict';

    angular.module('afrmApp').config(['$routeProvider', '$locationProvider', ApplicationConfig]);

    function ApplicationConfig($routeProvider, $locationProvider) {
        $routeProvider

            .when('/login', {
                'templateUrl' : 'app/components/login/login.html',
                'controller'  : 'LoginController'
            })

            .when('/empresas', {
                'templateUrl' : 'app/components/companies/companies.html',
                'controller'  : 'CompaniesController'
            })

            .when('/solicitacoes', {
                'templateUrl' : 'app/components/internships/internships.html',
                'controller'  : 'InternshipsController'
            })

            .when('/logs', {
                'templateUrl' : 'app/components/logs/logs.html',
                'controller'  : 'LogsController'
            })

            .when('/registro', {
                'templateUrl' : 'app/components/login/register.html',
                'controller'  : 'RegisterController'
            })

            .otherwise({
                'redirectTo': '/login'
            });

        $locationProvider.html5Mode(true);
    }
}());
(function() {

    'use strict';

    angular.module('afrmApp').controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = [ '$scope', '$mdDialog', 'companiesService' ];

    function CompaniesController($scope, $mdDialog, companiesService) {

        function getCompanies(name) {

            $scope.isLoadingCompanies = true;

            companiesService.get(name)
                .success(function(companies) {
                    $scope.companies = companies;
                    $scope.isLoadingCompanies = false;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                    $scope.isLoadingCompanies = false;
                });
        }

        $scope.showDialog = function(company) {

            if (company.status === 'Aguardando aprovação')
                $mdDialog.show({
                    'controller'          : 'ManageCompanyController',
                    'templateUrl'         : 'app/shared/templates/modals/company-dialog.html',
                    'parent'              : angular.element(document.body),
                    'locals'              : { 'company': company },
                    'clickOutsideToClose' : true
                });
        };

        $scope.search = function (name) {
            getCompanies(name);
        };

        (function init() {

            $scope.companySelected = [];
            getCompanies();
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

    angular.module('afrmApp').controller('InternshipsController', InternshipsController);

    InternshipsController.$inject = [ '$scope', '$mdDialog', 'internshipsService' ];

    function InternshipsController($scope, $mdDialog, internshipsService) {

        $scope.approveInternshipDialog = function(internship, credential, ev) {
            if (internship.status === 'Aguardando aprovação' && ($scope.credential.role === 'coordinator' || $scope.credential.role === 'student'))
                $mdDialog.show({
                    'controller'          : 'ApproveInternshipDialogController',
                    'templateUrl'         : 'app/shared/templates/modals/approve-internship-dialog.html',
                    'locals'              : { 'internship': internship || {}, 'credential': credential },
                    'parent'              : angular.element(document.body),
                    'targetEvent'         : ev,
                    'clickOutsideToClose' : true
                });
        };

        $scope.internshipDialog = function (internship, ev) {
            $mdDialog.show({
                'controller'          : 'InternshipDialogController',
                'templateUrl'         : 'app/shared/templates/modals/internship-dialog.html',
                'locals'              : { 'internship': angular.copy(internship) || {} },
                'parent'              : angular.element(document.body),
                'targetEvent'         : ev,
                'clickOutsideToClose' : true
            }).then(function(updatedInternship) {
                var i = 0;

                // atualiza tabela com alteracoes realizadas na modal
                for (i; i < $scope.internships.length; i += 1) {
                    if ($scope.internships[i]._id === updatedInternship._id) {
                        $scope.internships[i] = updatedInternship;
                        break;
                    }
                }

            });
        };

        $scope.search = function(query) {
            var q = {'credentialId': $scope.credential._id};

            if (query.name)
                q.name = query.name.trim();

            if (query.status && query.status.trim() !== 'Todos')
                q.status = query.status.trim();

            internshipsService.get(q)
                .success(function(internships) {
                    $scope.internships = internships;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                });
        };

        (function init() {
            var query = {};

            $scope.query = {};

            $scope.status = ['Todos', 'Em andamento', 'Reprovado', 'Cancelado', 'Aguardando aprovação', 'Finalizado'];

            $scope.credential = JSON.parse(window.localStorage.getItem('CREDENTIAL')) || {};

            $scope.isStudent = $scope.credential.role === 'student' ? true : false;

            query = {'credentialId': $scope.credential._id};

            $scope.isLoadingInternships = true;

            internshipsService.get(query)
                .success(function(internships) {
                    $scope.internships = internships;
                    $scope.isLoadingInternships = false;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                    $scope.isLoadingInternships = false;
                });

        }());
    }
}());

(function() {

    'use strict';

    angular.module('afrmApp').controller('LoginController', LoginController);

    LoginController.$inject = [ '$scope', 'credentialsService', '$location', '$rootScope' ];

    function LoginController($scope, credentialsService, $location, $rootScope) {

        $scope.login = function(email, pass) {
            var credential = {
                'email': email,
                'password': pass
            };

            $scope.isLoading = true;

            credentialsService.login(credential)
                .success(function (credential) {

                    $scope.isLoading = false;

                    if (credential) {
                        window.localStorage.setItem('CREDENTIAL', JSON.stringify(credential));
                        $rootScope.credential = credential;
                        $location.path('/solicitacoes');
                    }
                    else
                        $scope.isWrongLogin = true;
                })
                .error(function(reason) {
                    $scope.isLoading = false;
                    console.log(reason); // eslint-disable-line no-console
                });
        };

        (function init() {

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
                    console.log(reason); // eslint-disable-line no-console
                });
        };

    }
}());

(function() {

    'use strict';

    angular.module('afrmApp').controller('LogsController', LogsController);

    LogsController.$inject = [ '$scope', 'logsService' ];

    function LogsController($scope, logsService) {

        (function init() {

            $scope.tableParams = {
                'limit': 5,
                'page': 1
            };

            $scope.isLoadingLogs = true;
          
            logsService.get()
                .success(function(logs) {
                    $scope.logs = logs;

                    $scope.isLoadingLogs = false;
                    $scope.tableParams.total = logs.length;
                })
                .error(function(reason) {
                    $scope.isLoadingLogs = false;
                    console.log(reason); // eslint-disable-line no-console
                });

        }());
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

        (function init() {
        }());

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
            company.changer = JSON.parse(window.localStorage.getItem('CREDENTIAL'))._id;
            return $http.put($rootScope.serverUrl + module, company);
        };

        this.get = function (name) {
            var url = $rootScope.serverUrl + module;

            if (name)
                url = url + '/' + name;

            return $http.get(url);
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

            return $http.get($rootScope.serverUrl + module + '/' + querystring);
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

    function InternshipsService($http, $rootScope) {

        var module = 'internships';

        this.get = function (query) {
            var url = $rootScope.serverUrl + module + '/?';

            if (query.credentialId)
                url += 'credentialId=' + query.credentialId;

            if (query.status)
                url += '&status=' + query.status;

            if (query.name)
                url += '&name=' + query.name;

            return $http.get(url);
        };

        this.update = function (internship) {
            internship.changer = JSON.parse(window.localStorage.getItem('CREDENTIAL'))._id;
            return $http.put($rootScope.serverUrl + module, internship);
        };

    }

    InternshipsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('internshipsService', InternshipsService);

}());
(function () {

    'use strict';

    function LogsService($http, $rootScope) {

        var module = 'logs';

        this.get = function () {
            return $http.get($rootScope.serverUrl + module);
        };

    }

    LogsService.$inject = [ '$http', '$rootScope' ];

    angular.module('afrmApp').service('logsService', LogsService);

}());
(function () {

    'use strict';

    function ApproveInternshipDialogController($scope, $mdDialog, internshipsService, locals) {

        function updateInternship() {
            $scope.isSaving = true;

            internshipsService.update($scope.internship)
                .success(function() {
                    $scope.isSaving = false;
                    $mdDialog.hide($scope.internship);
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                    $scope.isSaving = false;
                    $mdDialog.hide();
                });
        }

        $scope.save = function(isApprove) {

            if (isApprove && $scope.credential.role === 'coordinator') {
                $scope.internship.status = 'Em andamento';
                $scope.internship.begin  = moment().format('DD/MM/YYYY');
                $scope.internship.end    = moment(moment()).add(6, 'months').format('DD/MM/YYYY');
            }
            else if (!isApprove && $scope.credential.role === 'coordinator')
                $scope.internship.status = 'Reprovado';

            else if (!isApprove && $scope.credential.role === 'student')
                $scope.internship.status = 'Cancelado';

            updateInternship();
        };

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        (function init() {
            $scope.internship = locals.internship || {};
            $scope.credential = locals.credential || {};
        })();
    }

    ApproveInternshipDialogController.$inject = [ '$scope', '$mdDialog', 'internshipsService', 'locals' ];

    angular.module('afrmApp').controller('ApproveInternshipDialogController', ApproveInternshipDialogController);

}());
(function () {

    'use strict';

    function ManageCompanyController($scope, $mdDialog, companiesService, locals) {

        $scope.save = function(company, status) {

            $scope.isLoadingCompany = true;

            if (status === true)
                company.status = 'Aprovado';
            else
                company.status = 'Reprovado';


            companiesService.update(company)
                .success(function () {
                    $scope.isLoadingCompany = false;
                    $mdDialog.hide(company);
                })
                .error(function (reason) {
                    $scope.isLoadingCompany = false;
                    console.log(reason); // eslint-disable-line no-console
                });

        };

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        (function init() {
            $scope.company = locals.company || {};
        })();
    }

    ManageCompanyController.$inject = [ '$scope', '$mdDialog', 'companiesService', 'locals' ];

    angular.module('afrmApp').controller('ManageCompanyController', ManageCompanyController);

}());
(function () {

    'use strict';

    function InternshipDialogController($scope, $mdDialog, internshipsService, locals) {

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        $scope.update = function (internship) {

            internship.begin = moment(internship.begin, 'DD/MM/YYYY');
            internship.begin = moment(internship.begin).format('DD/MM/YYYY');

            internshipsService.update(internship)
                .success(function(result) {

                    $mdDialog.hide(internship);
                })
                .error(function(reason) {

                });
        };  

        (function init() {

            var role = JSON.parse(window.localStorage.getItem('CREDENTIAL')).role; 

            $scope.internship = locals.internship || {};

            $scope.isEditable = role === 'student' && $scope.internship && $scope.internship.status === 'Aguardando aprovação';

        })();
    }

    InternshipDialogController.$inject = [ '$scope', '$mdDialog', 'internshipsService', 'locals' ];

    angular.module('afrmApp').controller('InternshipDialogController', InternshipDialogController);

}());
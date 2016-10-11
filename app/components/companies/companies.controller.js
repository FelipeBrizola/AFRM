(function() {

    'use strict';

    angular.module('afrmApp').controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = [ '$scope', '$mdDialog', 'companiesService' ];

    function CompaniesController($scope, $mdDialog, companiesService) {

        function getCompanies(name) {

            companiesService.get(name)
                .success(function(companies) {
                    $scope.companies = companies;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
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

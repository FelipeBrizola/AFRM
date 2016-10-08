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
                    console.log(reason); // eslint-disable-line no-console
                });
        }());
    }
}());

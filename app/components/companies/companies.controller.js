(function() {

    'use strict';

    angular.module('afrmApp').controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = [ '$scope', '$mdDialog' ];

    function CompaniesController($scope, $mdDialog) {

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

            $scope.companies = [
                {
                    'name':'HP',
                    'cnpj':'123456789',
                    'email': 'hp@contato.com',
                    'phone':'5191191919'
                },
                {
                    'name':'DELL',
                    'cnpj':'987654321',
                    'email': 'dell@contato.com',
                    'phone':'51999999999'
                },
                {
                    'name':'Tlantic',
                    'cnpj':'1121212121',
                    'email': 'tlantic@contato.com',
                    'phone':'5199999911'
                }
            ];

        }());
    }
}());

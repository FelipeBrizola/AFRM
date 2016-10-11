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
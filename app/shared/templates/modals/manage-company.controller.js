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
                        console.log(reason); // eslint-disable-line no-console
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
                        console.log(reason); // eslint-disable-line no-console
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
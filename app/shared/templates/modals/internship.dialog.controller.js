(function () {

    'use strict';

    function InternshipDialogController($scope, $mdDialog, internshipsService, locals) {

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        $scope.update = function (internship) {
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
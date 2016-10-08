(function () {

    'use strict';

    function InternshipDialogController($scope, $mdDialog, internshipsService, locals) {

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

    InternshipDialogController.$inject = [ '$scope', '$mdDialog', 'internshipsService', 'locals' ];

    angular.module('afrmApp').controller('InternshipDialogController', InternshipDialogController);

}());
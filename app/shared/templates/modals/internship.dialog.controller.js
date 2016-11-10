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
                    console.log(reason); // eslint-disable-line no-console
                    $scope.closeDialog();
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
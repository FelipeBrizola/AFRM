(function () {

    'use strict';

    function InternshipDialogController($scope, $mdDialog, internshipsService, locals) {

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        (function init() {
            $scope.internship = locals.internship || {};
        })();
    }

    InternshipDialogController.$inject = [ '$scope', '$mdDialog', 'internshipsService', 'locals' ];

    angular.module('afrmApp').controller('InternshipDialogController', InternshipDialogController);

}());
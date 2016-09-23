(function () {

    'use strict';

    function InternshipDialogController($scope, $mdDialog, locals) {

        $scope.save = function(internship) {
            return internship;
        };

        (function init() {
            $scope.internship = locals.internship || {};
        })();
    }

    InternshipDialogController.$inject = [ '$scope', '$mdDialog', 'locals' ];

    angular.module('afrmApp').controller('InternshipDialogController', InternshipDialogController);

}());
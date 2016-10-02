(function() {

    'use strict';

    angular.module('afrmApp').controller('InternshipsController', InternshipsController);

    InternshipsController.$inject = [ '$scope', '$mdDialog', 'internshipsService' ];

    function InternshipsController($scope, $mdDialog, internshipsService) {

        $scope.showDialog = function(internship) {

            $mdDialog.show({
                'controller': 'InternshipDialogController',
                'templateUrl': 'app/shared/templates/modals/internship-dialog.html',
                'parent': angular.element(document.body),
                'locals': { 'internship': internship || null },
                'clickOutsideToClose':true
            }).then(function() {
                console.log('ok');
            }, function() {});
        };

        (function init() {
            var query = {};

            $scope.status = ['Aprovado', 'Em andamento', 'Reprovado', 'Cancelado', 'Aguardando aprovação'];

            $scope.credential = JSON.parse(window.localStorage.getItem('CREDENTIAL'));

            $scope.isStudent = $scope.credential.role === 'student' ? true : false;

            query = {'credentialId': $scope.credential._id};

            internshipsService.get(query)
                .success(function(internships) {
                    $scope.internships = internships;
                })
                .error(function(reason) {
                    console.log(reason);
                });

        }());
    }
}());

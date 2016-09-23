(function() {

    'use strict';

    angular.module('afrmApp').controller('InternshipsController', InternshipsController);

    InternshipsController.$inject = [ '$scope', '$mdDialog' ];

    function InternshipsController($scope, $mdDialog) {

        $scope.showDialog = function(internship) {

            $mdDialog.show({
                'controller': 'InternshipDialogController',
                'templateUrl': 'app/shared/templates/modals/internship-dialog.html',
                'parent': angular.element(document.body),
                'locals': { 'internship': internship || null },
                'clickOutsideToClose':true
            }).then(function() {

            }, function() {});
        };

        (function init() {
            $scope.status = ['Aprovado', 'Em andamento', 'Aguardando aprovação'];
            $scope.internships = [
                {
                    'company': 'HP',
                    'student': 'Felipe',
                    'class': 'Ciencia da comp.',
                    'begin': '10/06/2016',
                    'end': '10/12/2016',
                    'status': true
                },
                {
                    'company': 'HP',
                    'student': 'Felipe',
                    'class': 'Ciencia da comp.',
                    'begin': '10/06/2016',
                    'end': '10/12/2016',
                    'status': true
                },
                {
                    'company': 'Pling',
                    'student': 'Teste',
                    'class': 'Eng da comp.',
                    'begin': '10/06/2016',
                    'end': '10/12/2016',
                    'status': false
                }
            ];
        }());
    }
}());

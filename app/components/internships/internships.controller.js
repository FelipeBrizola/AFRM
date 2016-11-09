(function() {

    'use strict';

    angular.module('afrmApp').controller('InternshipsController', InternshipsController);

    InternshipsController.$inject = [ '$scope', '$mdDialog', 'internshipsService' ];

    function InternshipsController($scope, $mdDialog, internshipsService) {

        $scope.approveInternshipDialog = function(internship, credential, ev) {
            if (internship.status === 'Aguardando aprovação' && ($scope.credential.role === 'coordinator' || $scope.credential.role === 'student'))
                $mdDialog.show({
                    'controller'          : 'ApproveInternshipDialogController',
                    'templateUrl'         : 'app/shared/templates/modals/approve-internship-dialog.html',
                    'locals'              : { 'internship': internship || {}, 'credential': credential },
                    'parent'              : angular.element(document.body),
                    'targetEvent'         : ev,
                    'clickOutsideToClose' : true
                });
        };

        $scope.internshipDialog = function (internship, ev) {
            $mdDialog.show({
                'controller'          : 'InternshipDialogController',
                'templateUrl'         : 'app/shared/templates/modals/internship-dialog.html',
                'locals'              : { 'internship': angular.copy(internship) || {} },
                'parent'              : angular.element(document.body),
                'targetEvent'         : ev,
                'clickOutsideToClose' : true
            }).then(function(updatedInternship) {
                var i = 0;

                // atualiza tabela com alteracoes realizadas na modal
                for (i; i < $scope.internships.length; i += 1) {
                    if ($scope.internships[i]._id === updatedInternship._id) {
                        $scope.internships[i] = updatedInternship;
                        break;
                    }
                }

            });
        };

        $scope.search = function(query) {
            var q = {'credentialId': $scope.credential._id};

            if (query.name)
                q.name = query.name.trim();

            if (query.status && query.status.trim() !== 'Todos')
                q.status = query.status.trim();

            internshipsService.get(q)
                .success(function(internships) {
                    $scope.internships = internships;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                });
        };

        (function init() {
            var query = {};

            $scope.query = {};

            $scope.status = ['Todos', 'Em andamento', 'Reprovado', 'Cancelado', 'Aguardando aprovação', 'Finalizado'];

            $scope.credential = JSON.parse(window.localStorage.getItem('CREDENTIAL')) || {};

            $scope.isStudent = $scope.credential.role === 'student' ? true : false;

            query = {'credentialId': $scope.credential._id};

            $scope.isLoadingInternships = true;

            internshipsService.get(query)
                .success(function(internships) {
                    $scope.internships = internships;
                    $scope.isLoadingInternships = false;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line no-console
                    $scope.isLoadingInternships = false;
                });

        }());
    }
}());

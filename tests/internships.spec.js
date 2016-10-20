describe('InternshipsController', function() {
    var $controller, internshipsService, modal,
        internship = {'status': 'Aguardando aprovação'};
        credential = {'role': 'student'};

    beforeEach(module('afrmApp'));

    beforeEach(inject(function (_$controller_, _internshipsService_) {
        var $scope = {}, controller;

        $controller        = _$controller_;
        internshipsService = _internshipsService_;

		controller         = $controller('InternshipsController', { $scope: $scope });

        internships = {
            'fnSearch'     : $scope.search,
            'fnShowDialog' : $scope.approveInternshipDialog,
        };

        spyOn(internships, 'fnSearch');
        spyOn(internships, 'fnShowDialog').and.callThrough();

        internships.fnSearch('query');
        internships.fnShowDialog(internship, credential);

    }));

    describe('search internships', function () {
        it('search internships have been called', function() {
            expect(internships.fnSearch).toHaveBeenCalled();
        });
        it('internshipsService to be defined', function() {
            expect(internshipsService.get).toBeDefined();
        });
    });

    describe('dialog internships', function () {
        it('show dialog have been called', function () {

        });
    });
});
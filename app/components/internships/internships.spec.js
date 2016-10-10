describe('InternshipsController', function() {
    var $controller, internshipsService;

    beforeEach(module('afrmApp'));

    beforeEach(inject(function (_$controller_, _internshipsService_) {
        var $scope = {}, controller;

        $controller        = _$controller_;
        internshipsService = _internshipsService_;
		controller         = $controller('InternshipsController', { $scope: $scope });

        internships = {
            'fn': $scope.search
        };

        spyOn(internships, 'fn');

        internships.fn('query');

    }));

    describe('search internships', function () {

        it('search internships have been called', function() {
            expect(internships.fn).toHaveBeenCalled();
        });

        it('internshipsService have been called', function() {
            expect(internshipsService.get).toBeDefined();
        });

    });

    describe('dialog internships', function () {

        it('show dialog', function () {

        });
    });
});
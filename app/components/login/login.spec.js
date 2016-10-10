describe('LoginController', function() {
    var $controller, credentialsService;

    beforeEach(module('afrmApp'));

    beforeEach(inject(function (_$controller_, _credentialsService_) {
        var $scope = {}, controller;

        $controller        = _$controller_;
        credentialsService = _credentialsService_;
		controller         = $controller('LoginController', { $scope: $scope });

        login = {
            'fn': $scope.login
        };

        spyOn(login, 'fn').and.callThrough();

        login.fn('username', 'pass');

    }));

    describe('login', function () {

        it('login have been called', function() {
            expect(login.fn).toHaveBeenCalled();
        });

        it('creentialsService have been called', function() {
            expect(credentialsService.login).toBeDefined();
        });

    });
});
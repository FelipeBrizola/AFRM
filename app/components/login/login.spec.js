describe('LoginController', function() {
    var $controller, credentialsService;

    beforeEach(module('afrmApp')); //<--- Hook module

    beforeEach(inject(function (_$controller_, _credentialsService_) {
        var $scope = {}, controller;

        $controller        = _$controller_;
        credentialsService = _credentialsService_;
		controller         = $controller('LoginController', { $scope: $scope });

        login = {
            'fn': $scope.login
        };

        spyOn(login, 'fn');

        login.fn('username', 'pass');

    }));

    describe('login', function () {
        it('have been called', function() {
            expect(login.fn).toHaveBeenCalled();
        });

    });
});
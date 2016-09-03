(function() {

    'use strict';

    angular.module('afrmApp').controller('HomeController', HomeController);

    HomeController.$inject = [ '$scope' ];

    function HomeController() {
        console.log('teste');
    }
}());

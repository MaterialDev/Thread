angular.module('page.button', []).config(($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
        .state('button', {
            url: '/button',
            parent: 'app',
            template: '<page-button></page-button>'
        });
});
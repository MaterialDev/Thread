angular.module('page.input', []).config(($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
        .state('input', {
            url: '/input',
            parent: 'app',
            template: '<page-input></page-input>'
        });
});
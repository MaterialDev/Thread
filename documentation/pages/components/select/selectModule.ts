angular.module('page.select', []).config(($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
        .state('select', {
            url: '/select',
            parent: 'app',
            template: '<page-select></page-select>'
        });
});
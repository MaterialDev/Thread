angular.module('page.badge', []).config(($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
        .state('badge', {
            url: '/badge',
            parent: 'app',
            template: '<page-badge></page-badge>'
        });
});
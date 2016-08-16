angular.module('page.card', []).config(($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
        .state('card', {
            url: '/card',
            parent: 'app',
            template: '<page-card></page-card>'
        });
});
///<reference path="../typings/angularjs/angular.d.ts"/>
///<reference path="../typings/angular-ui-router/angular-ui-router.d.ts"/>

interface Window {
    prettyPrint: Function;
}

angular.module('app', [
    //Libraries
    'thread',
    'ui.router',

    //Pages
    'app.templates',
    'app.component',
    'page.button',
    'page.badge',
    'page.card'
]).config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
    $stateProvider
        .state('app', {
            abstract: true,
            template: '<app></app>'
        });

    $urlRouterProvider.otherwise('/card');
})
.run(($rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService) => {

    $rootScope.$on('$viewContentLoaded', function() {
        $timeout(() => {
            window.prettyPrint();
        });
    });

    $rootScope.$on('$stateChangeError', function() {
        console.log(arguments);
    });
});
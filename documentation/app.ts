///<reference path="../typings/angularjs/angular.d.ts"/>
///<reference path="../typings/globals/angular-ui-router/index.d.ts"/>

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
    'page.card',
    'page.input'
]).config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
    $stateProvider
        .state('app', {
            abstract: true,
            template: '<app></app>'
        });

    $urlRouterProvider.otherwise('/input');
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
///<reference path="../typings/angularjs/angular.d.ts"/>
///<reference path="../typings/angular-ui-router/angular-ui-router.d.ts"/>

interface Window {
    Prism: any;
}

angular.module('app', [
    //Libraries
    'thread',
    'ui.router',

    //Pages
    'app.templates',
    'app.component',
    'page.button'
]).config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
    $stateProvider
        .state('app', {
            abstract: true,
            template: '<app></app>'
        });

    $urlRouterProvider.otherwise('/button');
})
.run(($rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService) => {
    $rootScope.$on('$stateChangeError', function() {
        console.log(arguments);
    });
});
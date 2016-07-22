angular.module('page.button', []).config(function ($stateProvider) {
    $stateProvider
        .state('button', {
        url: '/button',
        parent: 'app',
        template: '<page-button></page-button>'
    });
});
///<reference path="../typings/angularjs/angular.d.ts"/>
///<reference path="../typings/angular-ui-router/angular-ui-router.d.ts"/>
angular.module('app', [
    //Libraries
    'thread',
    'ui.router',
    //Pages
    'app.templates',
    'app.component',
    'page.button'
]).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
        abstract: true,
        template: '<app></app>'
    });
    $urlRouterProvider.otherwise('/button');
})
    .run(function ($rootScope, $timeout) {
    $rootScope.$on('$viewContentLoaded', function () {
        $timeout(function () {
            window.Prism.highlightAll();
        });
    });
    $rootScope.$on('$stateChangeError', function () {
        console.log(arguments);
    });
});
angular.module('app.component', []).component('app', {
    controllerAs: 'app',
    template: '<ui-view></ui-view>'
});
angular.module('page.button').component('pageButton', {
    templateUrl: 'pages/components/button/button.html'
});

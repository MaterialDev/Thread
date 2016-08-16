angular.module('page.badge', []).config(function ($stateProvider) {
    $stateProvider
        .state('badge', {
        url: '/badge',
        parent: 'app',
        template: '<page-badge></page-badge>'
    });
});
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
    'page.button',
    'page.badge'
]).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
        abstract: true,
        template: '<app></app>'
    });
    $urlRouterProvider.otherwise('/badge');
})
    .run(function ($rootScope, $timeout) {
    $rootScope.$on('$viewContentLoaded', function () {
        $timeout(function () {
            window.prettyPrint();
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
angular.module('page.badge').component('pageBadge', {
    templateUrl: 'pages/components/badge/badge.html'
});
angular.module('page.button').component('pageButton', {
    templateUrl: 'pages/components/button/button.html'
});
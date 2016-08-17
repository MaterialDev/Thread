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
angular.module('page.card', []).config(function ($stateProvider) {
    $stateProvider
        .state('card', {
        url: '/card',
        parent: 'app',
        template: '<page-card></page-card>'
    });
});
angular.module('page.input', []).config(function ($stateProvider) {
    $stateProvider
        .state('input', {
        url: '/input',
        parent: 'app',
        template: '<page-input></page-input>'
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
    'page.badge',
    'page.card',
    'page.input'
]).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
        abstract: true,
        template: '<app></app>'
    });
    $urlRouterProvider.otherwise('/card');
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
angular.module('page.card').component('pageCard', {
    templateUrl: 'pages/components/card/card.html'
});
angular.module('page.input').component('pageInput', {
    templateUrl: 'pages/components/input/input.html'
});

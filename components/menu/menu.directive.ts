module Thread.Components {
    export class Menu implements ng.IDirective {
        scope = {};
        transclude = true;
        restrict = 'E';
        bindToController = true;
        controllerAs = '$menu';
        template = `<div class="c-menu">
                        <div class="c-menu__backdrop"></div>
                        <ng-transclude></ng-transclude>
                    </div>`;

        menuContent : ng.IAugmentedJQuery;
        backdrop : ng.IAugmentedJQuery;

        constructor(private $timeout: ng.ITimeoutService) {}

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            ctrl.menuContent = angular.element(element[0].querySelector('.c-menu__content'));
            ctrl.backdrop = angular.element(element[0].querySelector('.c-menu__backdrop'));

            if (attrs.hasOwnProperty('moveToBody')) {
                ctrl.moveToBody();
            }

            if (attrs.hasOwnProperty('position')) {
                let splitPos = (<any>attrs).position.split(' ');
                ctrl.setPosition(splitPos[0], splitPos[1]);
            } else {
                ctrl.setPosition('top', 'left');
            }

            ctrl.backdrop.on('click', () => {
                ctrl.close();
            });

            angular.element(element[0].querySelector('.c-menu__item')).on('click', () => {
                this.$timeout(() => ctrl.close(), 100);
            });
        };

        controller($scope: ng.IScope, $element: ng.IAugmentedJQuery) {
            angular.extend(this, {
                onBody: false,
                xPos: null,
                yPos: null,
                open,
                close,
                setPosition,
                moveToBody
            });

            $scope.$on('$destroy', () => {
                this.backdrop.remove();
                this.menuContent.remove();
                this.backdrop = null;
                this.menuContent = null;
            });

            function open() {
                let menuTarget = angular.element($element[0].querySelector('.c-menu__target'));

                angular.element($element[0].querySelector('.c-menu')).addClass('c-menu--open');
                this.menuContent.addClass('c-menu__content--open');
                this.backdrop.addClass('c-menu__backdrop--open');

                if (this.onBody) {
                    let targetPos = menuTarget[0].getBoundingClientRect();
                    let left;
                    let top;

                    switch (this.xPos) {
                        case 'right':
                            left = targetPos.right - this.menuContent[0].offsetHeight;
                            break;
                        case 'left':
                            left = targetPos.left;
                            break;
                        //no default
                    }

                    switch (this.yPos) {
                        case 'top':
                            top = targetPos.top;
                            break;
                        case 'bottom':
                            top = targetPos.bottom - this.menuContent[0].offsetHeight;
                            break;
                        //no default
                    }

                    this.menuContent[0].style.left = left;
                    this.menuContent[0].style.top = top;
                    this.menuContent[0].style.right = 'initial';
                    this.menuContent[0].style.bottom = 'initial';
                }
            }

            function close() {
                angular.element($element[0].querySelector('.c-menu')).removeClass('c-menu--open');
                this.menuContent.removeClass('c-menu__content--open');
                this.backdrop.removeClass('c-menu__backdrop--open');
            }

            function setPosition(yPosition, xPosition) {
                switch (yPosition) {
                    case 'top':
                        this.menuContent.addClass('c-menu__content--top');
                        break;
                    case 'bottom':
                        this.menuContent.addClass('c-menu__content--bottom');
                        break;
                    //no default
                }

                switch (xPosition) {
                    case 'left':
                        this.menuContent.addClass('c-menu__content--left');
                        break;
                    case 'right':
                        this.menuContent.addClass('c-menu__content--right');
                        break;
                    //no default
                }

                this.xPos = xPosition;
                this.yPos = yPosition;
            }

            function moveToBody() {
                this.onBody = true;
                this.menuContent.addClass('c-menu__content--on-body');
                angular.element(document.querySelector('body')).append(this.menuContent);
                angular.element(document.querySelector('body')).append(this.backdrop);
            }
        }

        static factory() : ng.IDirectiveFactory {
            let directive = ($timeout: ng.ITimeoutService) => new Menu($timeout);
            directive.$inject = ['$timeout'];
            return directive;
        }
    }

    export class MenuTarget implements ng.IDirective {
        require = '^tdMenu';
        transclude = true;
        replace = true;
        scope = true;
        template = `<button
                    class="c-menu__target c-button"
                    ng-transclude
                    ng-click="$menu.open()"></button>`;

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            (<any>scope).$menu = ctrl;
        }

        static factory() : ng.IDirectiveFactory {
            return () => new MenuTarget();
        }
    }

    export class MenuContent implements ng.IDirective {
        require = '^tdMenu';
        transclude = true;
        replace = true;
        scope = true;
        template = '<ul class="c-menu__content" ng-transclude></ul>';

        static factory() : ng.IDirectiveFactory {
            return () => new MenuContent();
        }
    }

    export class MenuItem implements ng.IDirective {
        require = '^tdMenuContent';
        transclude = true;
        replace = true;
        scope = true;
        template = '<a class="c-button c-button--menu c-menu__item" ng-transclude></a>'

        static factory() : ng.IDirectiveFactory {
            return () => new MenuItem();
        }
    }
}

let menu = angular.module('thread.menu', []);
menu.directive('tdMenu', Thread.Components.Menu.factory());
menu.directive('tdMenuTarget', Thread.Components.MenuTarget.factory());
menu.directive('tdMenuContent', Thread.Components.MenuContent.factory());
menu.directive('tdMenuItem', Thread.Components.MenuItem.factory());
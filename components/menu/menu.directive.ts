/**
 * Menu
 * A component that shows/hides a list of items based on target click
 * @author Zach Barnes
 * @created 07/06/2016
 */
module Thread.Components {
    export class Menu implements ng.IDirective {
        scope = {};
        transclude = true;
        restrict = 'E';
        bindToController = true;
        controllerAs = '$menu';
        template = `<div class="c-menu js-menu">
                        <div class="c-menu__backdrop js-menu__backdrop"></div>
                        <ng-transclude></ng-transclude>
                    </div>`;

        menuContent : ng.IAugmentedJQuery;
        backdrop : ng.IAugmentedJQuery;

        constructor(private $timeout: ng.ITimeoutService) {}

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            ctrl.menuContent = angular.element(element[0].querySelector('.js-menu__content'));
            ctrl.backdrop = angular.element(element[0].querySelector('.js-menu__backdrop'));

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

            angular.element(ctrl.menuContent[0].querySelectorAll('.js-menu__item')).on('click', () => {
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
                let menuTarget = angular.element($element[0].querySelector('.js-menu__target'));

                angular.element($element[0].querySelector('.js-menu')).addClass('is-open');
                this.menuContent.addClass('is-open');
                this.backdrop.addClass('is-open');

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

                    this.menuContent[0].style.left = `${left}px`;
                    this.menuContent[0].style.top = `${top}px`;
                    this.menuContent[0].style.right = 'initial';
                    this.menuContent[0].style.bottom = 'initial';
                }
            }

            function close() {
                angular.element($element[0].querySelector('.js-menu')).removeClass('is-open');
                this.menuContent.removeClass('is-open');
                this.backdrop.removeClass('is-open');
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
                this.menuContent.addClass('js-menu__content--on-body');
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
                    class="c-menu__target c-button js-menu__target"
                    ng-transclude
                    ng-click="$menu.open()"></button>`;

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            (<any>scope).$menu = ctrl;
        };

        static factory() : ng.IDirectiveFactory {
            return () => new MenuTarget();
        }
    }

    export class MenuContent implements ng.IDirective {
        require = '^tdMenu';
        transclude = true;
        replace = true;
        scope = true;
        template = '<ul class="c-menu__content js-menu__content" ng-transclude></ul>';

        static factory() : ng.IDirectiveFactory {
            return () => new MenuContent();
        }
    }

    export class MenuItem implements ng.IDirective {
        require = '^tdMenuContent';
        transclude = true;
        replace = true;
        scope = true;
        template = '<a class="c-button c-button--menu c-menu__item js-menu__item" ng-transclude></a>';

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
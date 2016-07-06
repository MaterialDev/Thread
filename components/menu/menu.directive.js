angular.module('thread.menu', []).directive('thdMenu', ($timeout) => {
    return {
        templateUrl: 'components/menu/menu.html',
        transclude: true,
        restrict: 'E',
        bindToController: true,
        controllerAs: '$menu',
        scope: {},
        link(scope, element, attrs, ctrl) {
            ctrl.menuContent = angular.element(element[0].querySelector('.c-menu__content'));
            ctrl.backdrop = angular.element(element[0].querySelector('.c-menu__backdrop'));

            if (attrs.moveToBody) {
                ctrl.moveToBody();
            }

            if (attrs.position) {
                let splitPos = attrs.position.split(' ');
                ctrl.setPosition(splitPos[0], splitPos[1]);
            }

            ctrl.backdrop.on('click', () => {
                ctrl.close();
            });

            angular.element(element[0].querySelector('.c-menu__item')).on('click', () => {
                $timeout(() => ctrl.close(), 100);
            });
        },
        controller($scope, $element) {
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
                            left = targetPos.right - this.menuContent.width();
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
                            top = targetPos.bottom - this.menuContent.height();
                            break;
                        //no default
                    }

                    this.menuContent.css({
                        left: left,
                        top: top,
                        right: 'initial',
                        bottom: 'initial'
                    });
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
    };
});

angular.module('thread.menu').directive('thdMenuTarget', () => {
    return {
        require: '^thdMenu',
        transclude: true,
        replace: true,
        scope: true,
        template: `<button
                    class="c-menu__target c-button"
                    ng-transclude
                    ng-click="$menu.open()"></button>`,
        link(scope, element, attrs, ctrl) {
            scope.$menu = ctrl;
        }
    };
});

angular.module('thread.menu').directive('thdMenuContent', () => {
    return {
        require: '^thdMenu',
        transclude: true,
        replace: true,
        scope: true,
        template: '<ul class="c-menu__content" ng-transclude></ul>'
    };
});

angular.module('thread.menu').directive('thdMenuItem', () => {
    return {
        require: '^thdMenuContent',
        transclude: true,
        replace: true,
        scope: true,
        template: '<a class="c-button c-button--menu c-menu__item" ng-transclude></a>'
    };
});
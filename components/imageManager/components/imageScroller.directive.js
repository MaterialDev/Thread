angular.module('vln.imageManager').directive('imageScroller', ($window) => {
    return {
        require: '^imageManager',
        link: (scope, element, attrs, ctrl) => {
            var vm = scope.scrollCtrl;

            vm.init();
            ctrl.registerScroller(scope.scrollCtrl);

            vm.content.on('touchstart', (e) => {
                vm.dragging = true;
                vm.currentPos = getXPos(e);
                vm.lastPos = vm.currentPos;
                requestAnimationFrame(vm.touchScroll);
            });

            vm.content.on('touchmove', (e) => {
                vm.currentPos = getXPos(e);
                requestAnimationFrame(vm.touchScroll);
            });

            angular.element($window).on('touchend', dragEnd);

            scope.$on('$destroy', () => {
                angular.element($window).off('touchend', dragEnd);
            });

            function dragEnd() {
                vm.dragging = false;
                requestAnimationFrame(vm.touchScroll);
            }

            function getXPos(e) {
                return e.originalEvent.touches
                    ? e.originalEvent.touches[0].pageX
                    : e.pageX;
            }
        },

        controller: function scrollCtrl($scope) {
            let spd;
            const maxSpeed = 15;
            const friction = 0.3;

            let vm = _.assign(this, {
                leftArrow: null,
                rightArrow: null,
                content: null,
                currentPos: null,
                lastPos: null,
                dragging: false,
                registerArrow,
                registerContent,
                scrollLeft,
                scrollRight,
                touchScroll,
                resetScroll,
                init,
                moveIntoPosition
            });

            $scope.$watch(() => {
                return vm.content[0].scrollWidth;
            }, (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    var left = vm.content.css('left');
                    checkArrows(parseFloat(left));
                } else {
                    vm.init();
                }
            });

            function init() {
                if (vm.content) {
                    vm.content.css('left', 0);

                    if (vm.rightArrow) {
                        if (vm.content.parent().width() >= vm.content[0].scrollWidth) {
                            vm.rightArrow.css('display', 'none');
                        } else {
                            vm.rightArrow.css('display', '');
                        }
                    }

                    if (vm.leftArrow) {
                        vm.leftArrow.css('display', 'none');
                    } else {
                        vm.leftArrow.css('display', '');
                    }
                }
            }

            function registerContent(element) {
                vm.content = element;
            }

            function registerArrow(dir, element) {
                switch (dir) {
                    case 'left':
                        vm.leftArrow = element;
                        element.on('click', leftClicked);
                        break;
                    case 'right':
                        vm.rightArrow = element;
                        element.on('click', rightClicked);
                    //no default
                }
            }

            function leftClicked(e) {
                e.preventDefault();
                e.stopPropagation();

                var move = parseFloat(vm.content.parent().width());
                var oldLeft = vm.content.css('left');
                var newLeft = parseFloat(oldLeft) + move;

                newLeft = checkArrows(newLeft);
                vm.content.css('left', newLeft);
            }

            function rightClicked(e) {
                e.preventDefault();
                e.stopPropagation();

                var move = parseFloat(vm.content.parent().width());
                var oldLeft = vm.content.css('left');

                var newLeft = parseFloat(oldLeft) - move;

                newLeft = checkArrows(newLeft);
                vm.content.css('left', newLeft);
            }

            function resetScroll() {
                vm.content.css('left', 0);
            }

            function scrollLeft(speed) {
                var move = speed || 100;
                var oldLeft = vm.content.css('left');
                var newLeft = parseFloat(oldLeft) + move;

                newLeft = checkArrows(newLeft);

                vm.content.css('left', newLeft);
            }

            function scrollRight(speed) {
                var move = speed || 100;

                var oldLeft = vm.content.css('left');
                var newLeft = parseFloat(oldLeft) - move;

                newLeft = checkArrows(newLeft);

                vm.content.css('left', newLeft);
            }

            function checkArrows(newLeft) {
                if (vm.content.parent().width() - newLeft >= vm.content[0].scrollWidth) {
                    newLeft = -(vm.content[0].scrollWidth - vm.content.parent().width());
                    vm.rightArrow.css('display', 'none');
                } else {
                    vm.rightArrow.css('display', '');
                }

                if (newLeft >= 0) {
                    newLeft = 0;
                    vm.leftArrow.css('display', 'none');
                } else {
                    vm.leftArrow.css('display', '');
                }

                return newLeft;
            }

            function moveIntoPosition() {
                let newPos = checkArrows(parseInt(vm.content.css('left')));
                vm.content.css('left', newPos);
            }

            function touchScroll() {
                vm.content.css('transition', 'none');
                let parentWidth = vm.content.parent().width();
                let childWidth = vm.content[0].scrollWidth;
                spd = spd || 0;

                if (vm.dragging) {
                    spd = vm.currentPos - vm.lastPos;
                } else {
                    spd = spd > 0
                        ? spd - friction
                        : spd + friction;

                    if (spd > maxSpeed) {
                        spd = maxSpeed;
                    }
                }

                let oldLeft = parseFloat(vm.content.css('left'));
                let newLeft = oldLeft + spd;

                // disallow overscroll left
                if (newLeft > 0) {
                    newLeft = 0;
                }

                // disallow overscroll right
                if (parentWidth > childWidth + newLeft) {
                    newLeft = parentWidth - childWidth;
                }

                vm.content.css('left', `${newLeft}px`);
                vm.content.css('transition', '');
                vm.lastPos = vm.currentPos;
                checkArrows(newLeft);

                // momentum scroll
                if (!vm.dragging && Math.abs(spd) > friction) {
                    requestAnimationFrame(touchScroll);
                }
            }
        },

        controllerAs: 'scrollCtrl'
    };
});

angular.module('vln.imageManager').directive('imageScrollerArrow', () => {
    return {
        require: '^imageScroller',
        link: (scope, element, attrs, ctrl) => {
            if (attrs.imageScrollerArrow === 'left') {
                ctrl.registerArrow('left', element);
            } else if (attrs.imageScrollerArrow === 'right') {
                ctrl.registerArrow('right', element);
            } else {
                throw new Error('Invalid scroll direction');
            }
        }
    };
});

angular.module('vln.imageManager').directive('imageContainer', () => {
    return {
        require: '^imageScroller',
        link: (scope, element, attrs, ctrl) => {
            ctrl.registerContent(element);
        }
    };
});

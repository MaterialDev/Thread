
angular.module('vln.utilities.waveEffectButton', []).directive('cButton', waveEffect);

function waveEffect($timeout) {
    return {
        restrict: 'AC',
        link(scope, element, attrs) {
            if (attrs.noWave) {
                return;
            }

            let waveEl;
            let isFab = false;
            let removeActiveTriggered = false;
            let removeActiveTimeout = null;

            $timeout(() => {
                let el = angular.element(element);
                let width;
                let height;

                waveEl = angular.element('<span class="wave-effect"></span>');

                if (element.hasClass('c-button--fab') ||
                    element.hasClass('c-button--fab-mini') ||
                    element.hasClass('c-button--icon')) {
                    waveEl.addClass('wave-effect--fab');
                    isFab = true;
                }

                if (isFab) {
                    width = el.outerWidth();
                    height = el.outerWidth();
                } else {
                    width = Math.ceil(el.width());
                    height = Math.ceil(el.width());
                }
                waveEl.css({
                    width: width,
                    height: height
                });

                element.append(waveEl);
            });

            angular.element('body').on('mouseup', onMouseUp);

            element.on('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.which === 1) {
                    if (!isFab) {
                        let pos = { left: e.clientX, top: e.clientY };
                        let parentPos = e.target.getBoundingClientRect();

                        waveEl.css({
                            left: pos.left - parentPos.left,
                            top: pos.top - parentPos.top
                        });
                    }

                    waveEl.removeClass('wave-effect--focus');
                    waveEl.addClass('wave-effect--active');

                    removeActiveTimeout = $timeout(() => {
                        if (removeActiveTriggered) {
                            removeActiveTriggered = false;
                            waveEl.removeClass('wave-effect--active');
                        }
                        removeActiveTimeout = null;
                    }, 300);
                }
            });

            element.on('focus', () => {
                waveEl.css({
                    left: '',
                    top: ''
                });

                if (!element.hasClass('wave-effect--active')) {
                    waveEl.addClass('wave-effect--focus');
                } else {
                    element.blur();
                }
            });

            element.on('blur', () => {
                waveEl.removeClass('wave-effect--focus');
            });

            function onMouseUp() {
                if (removeActiveTimeout) {
                    removeActiveTriggered = true;
                } else {
                    waveEl.removeClass('wave-effect--active');
                }
                element.blur();
            }

            scope.$on('$destroy', () => {
                waveEl.remove();
                angular.element('body').off('mouseup', onMouseUp);
            });
        }
    };
}


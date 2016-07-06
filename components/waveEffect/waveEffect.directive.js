
angular.module('thread.waveEffect', []).directive('waveEffect', waveEffect);
angular.module('thread.waveEffect', []).directive('cButton', waveEffectButton);


function waveEffectLink($timeout) {
    return function _waveEffectLink(scope, element, attrs) {
        if (attrs.noWave) {
            return;
        }

        let waveEl;
        let isFab = false;
        let removeActiveTriggered = false;
        let removeActiveTimeout = null;

        $timeout(() => {
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
                //cirle, height must match the width
                width = element[0].offsetWidth;
                height = element[0].offsetWidth;
            } else {
                width = Math.ceil(element[0].offsetWidth);
                height = Math.ceil(element[0].offsetWidth);
            }

            waveEl[0].style.width = `${width}px`;
            waveEl[0].style.height = `${height}px`;

            element.append(waveEl);
        });

        angular.element(document.querySelector('body')).on('mouseup', onMouseUp);

        element.on('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.which === 1) {
                if (!isFab) {
                    let pos = { left: e.clientX, top: e.clientY };
                    let parentPos = e.target.getBoundingClientRect();

                    waveEl[0].style.left = `${pos.left - parentPos.left}px`;
                    waveEl[0].style.top = `${pos.top - parentPos.top}px`;
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

            waveEl[0].style.left = '';
            waveEl[0].style.top = '';

            if (!element.hasClass('wave-effect--active')) {
                waveEl.addClass('wave-effect--focus');
            } else {
                element[0].blur();
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
            element[0].blur();
        }

        scope.$on('$destroy', () => {
            waveEl.remove();
            angular.element(document.querySelector('body')).off('mouseup', onMouseUp);
        });
    }
}

function waveEffectButton($timeout) {
    return {
        restrict: 'C',
        link: waveEffectLink($timeout)
    };
}

function waveEffect($timeout) {
    return {
        restrict: 'A',
        link: waveEffectLink($timeout)
    }
}


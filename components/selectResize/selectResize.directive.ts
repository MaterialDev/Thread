/**
 * Select Resize
 * Automatically resizes select elements to fit the text exactly
 * @author Zach Barnes
 * @created 07/19/2016
 */

interface selectResizeScope extends ng.IScope {
    resizeDefault : number;
    onResize: Function;
    parent: string;
}

angular.module('thread.selectResize', []).directive('selectResizeParent', () => {
    return {
        bindToController: true,
        controller($element: ng.IAugmentedJQuery) {
            this.getElement = getElement;

            function getElement() {
                return $element;
            }
        }
    }
});

angular.module('thread.selectResize').directive('selectResize', ($timeout) => {
    return {
        require: '?^selectResizeParent',
        scope: {
            onResize: '&selectResize',
            resizeDefault: '@',
        },
        link(scope: selectResizeScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) {
            $timeout(() => {
                resizeInput();
            });
            angular.element(element).on('change', () => {
                resizeInput();
            });

            function resizeInput() {
                let el : HTMLSelectElement = <HTMLSelectElement>element[0];
                let arrowWidth = 8;
                let text = (<HTMLOptionElement>el.options[el.selectedIndex]).text;
                let width;

                if (text) {
                    let testEl = angular.element('<span>').html(text);

                    let parent = ctrl ? ctrl.getElement() : element.parent();
                    parent.append(testEl);

                    width = testEl[0].offsetWidth;
                    testEl.remove();
                    testEl = null;

                } else {
                    width = scope.resizeDefault || 150;
                }

                element[0].style.width = `${width + arrowWidth}px`;

                if (scope.onResize) {
                    scope.onResize();
                }
            }
        }
    };
});
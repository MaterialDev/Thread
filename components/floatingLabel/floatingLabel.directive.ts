/**
 * Floating label
 * A component that controls label interactions on input fields
 * @author Zach Barnes
 * @created 07/13/2016
 */
function floatingLabelLink($timeout) {
    return function _floatingLabelLink(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: ng.INgModelController) {
        if ((<any>attrs).noFloat !== undefined) {
            return;
        }

        $timeout(() => {
            let inputField:ng.IAugmentedJQuery = angular.element(element[0].querySelector('.c-input__field'));

            element.toggleClass('has-value', !!inputField.val());
            inputField.on('input', function () {
                element.toggleClass('has-value', !!this.value);
            });

            inputField.on('focus', () => {
                element.addClass('has-focus');
            });

            inputField.on('blur', () => {
                element.removeClass('has-focus');
            });

            scope.$on('$destroy', () => {
                inputField.off('focus');
                inputField.off('blur');
            });
        });
    }
}

angular.module('thread.floatingLabel', []).directive('floatingLabel', ($timeout) => {
    return {
        restrict: 'A',
        link: floatingLabelLink($timeout)
    };
});

angular.module('thread.floatingLabel').directive('cInput', ($timeout) => {
    return {
        restrict: 'C',
        link: floatingLabelLink($timeout)
    }
});
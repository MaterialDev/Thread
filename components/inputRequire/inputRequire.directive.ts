angular.module('thread.inputRequire', []).directive('cInput', ($timeout) => {
    return {
        restrict: 'C',
        link(scope: ng.IScope, element: ng.IAugmentedJQuery) {
            $timeout(() => {
                let inputField : ng.IAugmentedJQuery = angular.element(element[0].querySelector('.c-input__field'));

                if (inputField.attr('required')) {
                    element.addClass('has-required');
                }
            });
        }
    };
});
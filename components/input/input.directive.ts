module Thread.Components {
    export class FloatingLabel implements ng.IDirective {
        restrict = 'A';
        require = '?ngModel';

        constructor(private $timeout: ng.ITimeoutService) {

        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: ng.INgModelController) => {
            if((<any>attrs).noFloat !== undefined) {
                return;
            }

            this.$timeout(() => {
                let inputField : ng.IAugmentedJQuery = angular.element(element[0].querySelector('.c-input__field'));

                if(ctrl) {
                    element.toggleClass('has-value', ctrl.$viewValue);
                    ctrl.$formatters.push((value) => {
                        element.toggleClass('has-value', value);
                    });
                } else {
                    element.toggleClass('has-value', !!inputField.val());
                    inputField.on('input', function() {
                        element.toggleClass('has-value', !!this.value);
                    });
                }


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
        };

        static factory() : ng.IDirectiveFactory {
            return ($timeout: ng.ITimeoutService) => new FloatingLabel($timeout);
        }
    }

    export class FloatingLabelInput extends FloatingLabel {
        restrict = 'C';

        static factory() : ng.IDirectiveFactory {
            return ($timeout: ng.ITimeoutService) => new FloatingLabelInput($timeout);
        }
    }
}

angular.module('thread.floatingLabel', []).directive('floatingLabel', Thread.Components.FloatingLabel.factory());
angular.module('thread.floatingLabel').directive('cInput', Thread.Components.FloatingLabelInput.factory());
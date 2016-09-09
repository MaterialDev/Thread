module Thread.Components {
    export class SelectController {
        options = [];
        selected = 'test';

        constructor(private $element: ng.IAugmentedJQuery) {

        }

        addOption(name, model) {
            this.options.push({
                view: name,
                model: model
            });
        }

        openOptionList() {
            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            optionList.style.width = `${this.$element[0].offsetWidth}px`;
            angular.element(optionList).addClass('c-select__menu--open');
        }
    }

    export class OptionController {

    }
}

angular.module('thread.select', []).directive('tdSelect', () => {
    return {
        templateUrl: 'components/select/select.html',
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link(scope, element, attrs) {
            // let selectedElement = angular.element(element.querySelector('.js-select__selected'));
        }
    };
});

angular.module('thread.select').directive('tdOption', () => {
    return {
        require: '^tdSelect',
        templateUrl: 'components/select/option.html',
        controller: Thread.Components.OptionController,
        replace: true,
        transclude: true,
        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: any, ctrl: Thread.Components.SelectController) {
            ctrl.addOption(element.text(), attrs.value || element.text());
        }
    };
});
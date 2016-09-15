module Thread.Components {
    export class SelectController {
        options = [];
        selected = 'Test 1';

        constructor(private $element: ng.IAugmentedJQuery) {

        }

        addOption(name, model) {
            this.options.push({
                name: name,
                model: model
            });
        }

        openOptionList() {
            let parentPos = this.$element[0].getBoundingClientRect();
            parentPos.left += document.body.scrollLeft;
            parentPos.top += document.body.scrollTop;

            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            optionList.style.width = `${this.$element[0].offsetWidth}px`;
            optionList.style.left = `${parentPos.left - 16}px`;
            optionList.style.top = `${parentPos.top - 14}px`;
            angular.element(optionList).addClass('c-select__menu--open');
        }

        closeOptionList() {
            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            angular.element(optionList).removeClass('c-select__menu--open');
        }

        select(option) {
            this.closeOptionList();
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
        template: '<option ng-transclude></option>',
        controller: Thread.Components.OptionController,
        replace: true,
        transclude: true,
        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: any, ctrl: Thread.Components.SelectController) {
            ctrl.addOption(element.text(), attrs.value || element.text());
        }
    };
});
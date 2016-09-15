module Thread.Components {
    export class SelectController {
        options = [];
        selected = 'Test 1';

        constructor(private $element: ng.IAugmentedJQuery) {

        }

        addOption(name, value) {
            this.options.push({
                name: name,
                value: value
            });
        }

        openOptionList() {
            let parentPos = this.$element[0].getBoundingClientRect();
            parentPos.left += document.body.scrollLeft;
            parentPos.top += document.body.scrollTop;

            let backdrop: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__backdrop');
            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            optionList.style.width = `${this.$element[0].offsetWidth}px`;
            optionList.style.left = `${parentPos.left - 16}px`;
            optionList.style.top = `${parentPos.top - 14}px`;
            angular.element(optionList).addClass('is-open');
            angular.element(backdrop).addClass('is-open');
        }

        closeOptionList() {
            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            let backdrop: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__backdrop');
            angular.element(optionList).removeClass('is-open');
            angular.element(backdrop).removeClass('is-open');
        }

        select(option) {
            (<any>this).model = option.value;
            this.closeOptionList();
        }
    }

    export class OptionController {

    }
}

angular.module('thread.select', []).directive('tdSelect', () => {
    return {
        scope: {
            model: '=ngModel'
        },
        template: `<div class="c-select c-input__field" tabindex="0" ng-click="$selectCtrl.openOptionList();">
                        <div class="c-select__backdrop js-select__backdrop"></div>
                        <span aria-hidden="true" class="c-select__value">{{$selectCtrl.model || ' '}}</span>
                        <ul aria-hidden="true" class="c-select__menu js-select__menu">
                            <li class="c-select__menu-item" ng-repeat="option in $selectCtrl.options"
                                ng-click="$selectCtrl.select(option); $event.stopPropagation()">{{option.name}}
                            </li>
                        </ul>
                        <i class="mi c-select__arrow" aria-hidden="true">arrow_drop_down</i>
                        <select class="c-select__box" ng-transclude ng-model="$selectCtrl.model"></select>
                    </div>`,
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link(scope, element, attrs, ctrl) {
            let backdrop = angular.element(element[0].querySelector('.js-select__backdrop'));

            backdrop.on('click', (e) => {
                e.stopPropagation();
                ctrl.closeOptionList();
            });
        }
    };
});

angular.module('thread.select').directive('tdOption', () => {
    return {
        scope: true,
        require: '^tdSelect',
        template: '<option ng-transclude ng-value="$selectOptionCtrl.value"></option>',
        controller: Thread.Components.OptionController,
        controllerAs: '$selectOptionCtrl',
        replace: true,
        transclude: true,
        link(scope: any, element: ng.IAugmentedJQuery, attrs: any, ctrl: Thread.Components.SelectController) {
            let value = attrs.value || element.text().replace(/\s/, '');
            scope.$selectOptionCtrl.value = value;
            ctrl.addOption(element.text(), value);
        }
    };
});
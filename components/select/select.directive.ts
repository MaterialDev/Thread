import SelectController = Thread.Components.SelectController;
module Thread.Components {
    export class OptionModel {
        name: String;
        value: any;
        isHighlighted: boolean;

        constructor(name: String, value: any) {
            this.name = name;
            this.value = value;
            this.isHighlighted = false;
        }
    }

    export class SelectController {
        options = [];
        selected: OptionModel;
        model: any;
        isOpen: boolean;

        constructor(private $element: ng.IAugmentedJQuery) {

        }

        addOption(name, value) {
            this.options.push(new OptionModel(name, value));
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

            if (this.selected) {
                this.selected.isHighlighted = true;
            }

            this.isOpen = true;
        }

        closeOptionList() {
            let optionList: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__menu');
            let backdrop: HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-select__backdrop');
            angular.element(optionList).removeClass('is-open');
            angular.element(backdrop).removeClass('is-open');

            this.isOpen = false;
        }

        select(option) {
            this.selected = option;
            this.model = option.value;
            this.closeOptionList();
        }

        highlightNext() {
            let idx: number = -1;

            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].isHighlighted) {
                    idx = i;
                    this.options[i].isHighlighted = false;
                    break;
                }
            }

            if (idx >= this.options.length - 1 || idx == -1) {
                idx = 0;
            } else {
                idx += 1;
            }

            this.unHighlightAll();
            this.selected = this.options[idx];
            this.options[idx].isHighlighted = true;
        }

        highlightPrev() {
            let idx: number = -1;

            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].isHighlighted) {
                    idx = i;
                    this.options[i].isHighlighted = false;
                    break;
                }
            }

            if (idx <= 0) {
                idx = this.options.length - 1;
            } else {
                idx -= 1;
            }

            this.selected = this.options[idx];
            this.options[idx].isHighlighted = true;
        }

        getHighlighted() {
            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].isHighlighted) {
                    return this.options[i];
                }
            }
        }

        unHighlightAll() {
            for (let option of this.options) {
                option.isHighlighted = false;
            }

            this.selected = null;
        }
    }

    export class OptionController {

    }
}

angular.module('thread.select', []).directive('tdSelect', ($timeout: ng.ITimeoutService) => {
    return {
        scope: {
            model: '=ngModel'
        },
        template: `<div class="c-select c-input__field js-select" tabindex="0" ng-click="$selectCtrl.openOptionList();">
                        <div class="c-select__backdrop js-select__backdrop"></div>
                        <span aria-hidden="true" class="c-select__value">{{$selectCtrl.model || ' '}}</span>
                        <ul aria-hidden="true" class="c-select__menu js-select__menu">
                            <li class="c-select__menu-item js-select__menu-item" ng-repeat="option in $selectCtrl.options" ng-class="{'has-focus': option.isHighlighted}"
                                ng-click="$selectCtrl.select(option); $event.stopPropagation()">{{option.name}}
                            </li>
                        </ul>
                        <i class="mi c-select__arrow" aria-hidden="true">arrow_drop_down</i>
                        <select class="c-select__box" ng-transclude ng-model="$selectCtrl.model" tabindex="-1"></select>
                    </div>`,
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: any, ctrl: SelectController) {
            let backdrop = angular.element(element[0].querySelector('.js-select__backdrop'));

            $timeout(() => {
                let option = angular.element(element[0].querySelectorAll('.js-select__menu-item'));

                option.on('mouseenter mouseleave', () => {
                    ctrl.unHighlightAll();
                    scope.$apply();
                });
            });

            backdrop.on('click', (e) => {
                e.stopPropagation();
                ctrl.closeOptionList();
            });

            element.on('blur', (e) => {
                ctrl.closeOptionList();
                scope.$apply();
            });

            element.on('keyup', (e) => {
                switch (e.which) {
                    case 38:    //arrow up
                    case 37:    //arrow left
                        if (!ctrl.isOpen) ctrl.openOptionList();
                        ctrl.highlightPrev();
                        scope.$apply();
                        break;
                    case 39:    //arrow right
                    case 40:    //arrow down
                        if (!ctrl.isOpen) ctrl.openOptionList();
                        ctrl.highlightNext();
                        scope.$apply();
                        break;
                    case 32:    //space
                        ctrl.isOpen ? ctrl.closeOptionList() : ctrl.openOptionList();
                        scope.$apply();
                        break;
                    case 13:    //enter
                        if (ctrl.isOpen && ctrl.selected) {
                            ctrl.select(ctrl.selected);
                            scope.$apply();
                        }
                        break;
                }
            })
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
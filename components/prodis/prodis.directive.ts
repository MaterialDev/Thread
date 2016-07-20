/**
 * Progressive Disclosure
 * A natural language component that shows one
 * section at a time centered in the middle of the screen
 * @author Zach Barnes
 * @created 06/15/2016
 */

module Thread.Components {
    export class ProdisController {
        currentSection: number;
        sections: any[];

        constructor(private $element: ng.IAugmentedJQuery, private $timeout: ng.ITimeoutService) {
            this.currentSection = 0;
            this.sections = [];
        }

        next() {
            if (++this.currentSection >= this.sections.length) {
                this.currentSection = this.sections.length - 1;
                this.updateSections();
            }
        }

        goTo(sectionName) {
            for (let i = this.currentSection; i < this.sections.length; i++) {
                if (this.sections[i].name === sectionName) {
                    this.currentSection = i;
                    this.updateSections();
                    return;
                }
            }
        }

        getCurrent() {
            return this.currentSection;
        }

        updateSections() {
            let height: number = 0;
            let prodisEl : HTMLElement;

            for(let i = 0; i <= this.currentSection; i++) {
                height += this.getSectionHeight(this.sections[i].element);
            }

            prodisEl = <HTMLElement>this.$element[0].querySelector('.js-prodis');
            prodisEl.style.height = `${height}px`;
        }

        registerSection(element, name) {
            this.sections.push({
                element,
                name
            });

            this.$timeout(() => {
                this.updateSections();
            });
            return this.sections.length - 1;
        }

        getSectionHeight(section) {
            let height: number = section.offsetHeight;
            let style : CSSStyleDeclaration = getComputedStyle(section);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        }
    }
}

angular.module('thread.prodis', []).directive('prodis', () => {
    return {
        template: `<div class="c-natural-language">
                        <div class="c-prodis js-prodis" ng-transclude></div>
                   </div>`,
        bindToController: true,
        transclude: true,
        replace: true,
        controllerAs: '$prodis',
        controller: Thread.Components.ProdisController
    };
});

angular.module('thread.prodis').directive('prodisSection', () => {
    return {
        template: `<div class="c-natural-language__section c-prodis__section js-prodis__section"
                        ng-class="{
                            'c-prodis__section--complete': $prodisSection.isComplete,
                            'c-prodis__section--visible': $prodisSection.id <= $prodis.currentSection
                        }" ng-transclude></div>`,
        require: '^prodis',
        transclude: true,
        controllerAs: '$prodisSection',
        bindToController: true,
        //replace: true,
        scope: true,
        controller($scope, $element, $attrs) {
            let $parent = $scope.$prodis;
            this.id = $parent.registerSection($element[0].querySelector('.js-prodis__section'), $attrs.name);
            this.isComplete = !!$attrs.isComplete;
        }
    };
});
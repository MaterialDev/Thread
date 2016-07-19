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

        constructor() {
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

        updateSections() {}

        registerSection(element, name) {
            this.sections.push({
                element,
                name
            });

            return this.sections.length - 1;
        }
    }
}

angular.module('thread.prodis', []).directive('prodis', () => {
    return {
        template: `<div class="c-natural-language">
                        <div class="c-prodis" ng-transclude></div>
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
        template: '<div class="c-natural-language__section c-prodis__section" ng-if="$prodis.currentSection >= $prodisSection.id" ng-transclude></div>',
        require: '^prodis',
        transclude: true,
        controllerAs: '$prodisSection',
        bindToController: true,
        //replace: true,
        scope: true,
        controller($scope, $element, $attrs) {
            let $parent = $scope.$prodis;
            this.id = $parent.registerSection($element, $attrs.name);
        }
    };
});
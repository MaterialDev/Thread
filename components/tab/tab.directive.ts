/**
 * Tab component
 * A component that allows switching between
 * sets of content separated into groups by tabs
 * @author Zach Barnes
 * @created 07/08/2016
 */
module Thread.Components {
    export class Tabs implements ng.IDirective {
        scope = {
            currentTab: '='
        };
        restrict = 'E';
        template = `<div class="c-tab">
                        <div class="c-tab__header-wrapper">
                            <div class="c-tab__header js-tab__header"></div>
                        </div>
                        <div class="c-tab__content-wrapper">
                            <div class="c-tab__content js-tab__content" ng-transclude></div>
                        </div>
                    </div>`;
        replace = true;
        transclude = true;
        bindToController = true;
        controllerAs = '$tabs';

        constructor() {

        }

        link = (scope : ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

        };

        controller($scope: ng.IScope, $timeout, $element: ng.IAugmentedJQuery) {
            angular.extend(this, {
                activeTab: 1,
                tabs: [],
                addTab,
                changeTab,
                updateTabs,
                resizeTabs,
                clearTab
            });

            $scope.$watch(() => (<any>this).currentTab, (newValue, oldValue) => {
                if(newValue && newValue === oldValue) {
                    (<any>this).activeTab = newValue;
                    (<any>this).updateTabs();
                } else if(newValue) {
                    (<any>this).changeTab(null, newValue);
                }
            });

            function resizeTabs() {
                let width: Number = 0;
                for(let i = 0; i < this.tabs.length; i++) {
                    width += this.tabs[i].header[0].offsetWidth;
                }

                let tabHeader = <HTMLElement>$element[0].querySelector('.js-tab__header');
                tabHeader.style.width = `${width}px`;
            }

            function addTab(header : ng.IAugmentedJQuery, body : ng.IAugmentedJQuery) {
                let idx : number = this.tabs.push({
                    header: header,
                    body: body
                });

                angular.element($element[0].querySelector('.js-tab__header')).append(header);

                header.attr('td-tab-index', idx);
                body.attr('td-tab-index', idx);

                body[0].style.transition = 'none';

                this.updateTabs();
                this.resizeTabs();

                body[0].style.transition = '';
            }

            function changeTab(event: JQueryEventObject, index: number) {
                if(index == null) {
                    index = parseInt(event.target.getAttribute('td-tab-index'));
                }

                if(index && index !== this.activeTab) {
                    this.lastTab = this.activeTab;
                    this.activeTab = index;
                    this.updateTabs();
                }
            }

            function updateTabs() {
                if(this.lastTab) {
                    let height : Number = this.tabs[this.activeTab - 1].body[0].offsetHeight;
                    let content : HTMLElement = <HTMLElement>$element[0].querySelector('.js-tab__content');
                    content.style.height = `${height}px`;
                    content.style.transition = 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                }

                for(let i = 0; i < this.tabs.length; i++) {
                    let idx = i + 1;

                    this.clearTab(i);

                    if(idx === this.activeTab) {
                        this.tabs[i].header.addClass('is-active');
                        this.tabs[i].body.addClass('is-active');
                    } else if (idx < this.activeTab) {
                        this.tabs[i].header.addClass('is-left');
                        this.tabs[i].body.addClass('is-left');
                    } else {
                        this.tabs[i].header.addClass('is-right');
                        this.tabs[i].body.addClass('is-right');
                    }

                }
            }

            function clearTab(idx: number) {
                this.tabs[idx].header.removeClass('is-active is-right is-left');
                this.tabs[idx].body.removeClass('is-active is-right is-left');
            }
        }

        static factory() : ng.IDirectiveFactory {
            return () => new Tabs();
        }
    }

    export class Tab implements ng.IDirective {
        restrict = 'E';
        require = '^tdTabs';
        scope = true;

        constructor(private $timeout: ng.ITimeoutService) {

        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            let header = angular.element(element[0].querySelector('.js-tab__title'));
            let body = angular.element(element[0].querySelector('.js-tab__body'));

            this.$timeout(() => {
                ctrl.addTab(header, body);
            });
        };

        controller() {

        }

        static factory() : ng.IDirectiveFactory {
            let directive = ($timeout: ng.ITimeoutService) => new Tab($timeout);
            directive.$inject = ['$timeout'];
            return directive;
        }
    }

    export class TabTitle implements ng.IDirective {
        replace = true;
        require = '^tdTabs';
        transclude = true;
        template = `<button class="c-tab__header-item c-button c-button--tab js-tab__title"
                            ng-click="$tabs.changeTab($event)"
                            ng-transclude></button>`;

        constructor() {

        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            (<any>scope).$tabs = ctrl;
        };

        static factory() : ng.IDirectiveFactory {
            return () => new TabTitle();
        }
    }

    export class TabBody implements ng.IDirective {
        replace = true;
        require = '^tdTab';
        transclude = true;
        template = '<div class="c-tab__body js-tab__body" ng-transclude></div>';

        constructor() {

        }

        static factory() : ng.IDirectiveFactory {
            return () => new TabBody();
        }
    }
}

let tab = angular.module('thread.tab', []);
tab.directive('tdTabs', Thread.Components.Tabs.factory());
tab.directive('tdTab', Thread.Components.Tab.factory());
tab.directive('tdTabTitle', Thread.Components.TabTitle.factory());
tab.directive('tdTabBody', Thread.Components.TabBody.factory());
/**
 * Tab component
 * A component that allows switching between
 * sets of content separated into groups by tabs
 * @author Zach Barnes
 * @created 07/08/2016
 */
module Thread.Components {

    interface Tabs {
        lastTab: number;
        activeTab: number;
        tabs: Array<Object>;
    }

    export interface TabTitleScope extends ng.IScope {
        $tabs: TabsController;
    }

    export class TabsController implements Tabs{
        activeTab = 1;
        tabs = [];
        lastTab = -1;

        constructor(private $scope: ng.IScope, private $element: ng.IAugmentedJQuery) {

        }

        $onInit() {
            this.$scope.$watch(() => (<any>this).currentTab, (newValue, oldValue) => {
                if(newValue && newValue === oldValue) {
                    (<any>this).activeTab = newValue;
                    (<any>this).updateTabs();
                } else if(newValue) {
                    (<any>this).changeTab(null, newValue);
                }
            });
        }

        resizeTabs() {
            let width: Number = 16;

            for(let i = 0; i < this.tabs.length; i++) {
                width += this.tabs[i].header[0].offsetWidth;
            }

            let tabHeader = <HTMLElement>this.$element[0].querySelector('.js-tab__header');
            tabHeader.style.width = `${width}px`;
        }

        addTab(header : ng.IAugmentedJQuery, body : ng.IAugmentedJQuery) {
            let idx : number = this.tabs.push({
                header: header,
                body: body
            });

            angular.element(this.$element[0].querySelector('.js-tab__header')).append(header);

            header.attr('td-tab-index', idx);
            body.attr('td-tab-index', idx);

            body[0].style.transition = 'none';

            this.updateTabs();
            this.resizeTabs();

            body[0].style.transition = '';
        }

        changeTab(event: JQueryEventObject, index: number) {
            if(index == null) {
                index = parseInt(event.target.getAttribute('td-tab-index'));
            }

            if(index && index !== this.activeTab) {
                this.lastTab = this.activeTab;
                this.activeTab = index;
                this.updateTabs();
            }
        }

        updateTabs() {
            if(this.lastTab > -1) {
                let height : Number = this.tabs[this.activeTab - 1].body[0].offsetHeight;
                let content : HTMLElement = <HTMLElement>this.$element[0].querySelector('.js-tab__content');
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

        clearTab(idx: number) {
            this.tabs[idx].header.removeClass('is-active is-right is-left');
            this.tabs[idx].body.removeClass('is-active is-right is-left');
        }
    }
}

angular.module('thread.tab', []).directive('tdTabs', ($interval: ng.IIntervalService) => {
    return {
        scope: {
            currentTab: '='
        },
        restrict: 'E',
        template: `<div class="c-tab">
                        <div class="c-tab__header-wrapper">
                            <div class="c-tab__header js-tab__header"></div>
                        </div>
                        <div class="c-tab__content-wrapper">
                            <div class="c-tab__content js-tab__content" ng-transclude></div>
                        </div>
                    </div>`,
        replace: true,
        transclude: true,
        bindToController: true,
        controllerAs: '$tabs',
        controller: Thread.Components.TabsController,
        link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            /*
             Resize the background once shift from fonts loaded has occured
             Use interval as a fix for IE and Safari
             */
            if('fonts' in document) {
                (<any>document).fonts.ready.then(function() {
                    ctrl.resizeTabs();
                });
            } else {
                let readyCheckInterval = $interval(() => {
                    if(document.readyState === "complete") {
                        ctrl.resizeTabs();
                        $interval.cancel(readyCheckInterval);
                    }
                }, 10);
            }
        }
    };
});

angular.module('thread.tab').directive('tdTab', ($timeout: ng.ITimeoutService) => {
    return {
        restrict: 'E',
        require: '^tdTabs',
        scope: true,
        link(scope:ng.IScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes, ctrl:any) {
            let header = angular.element(element[0].querySelector('.js-tab__title'));
            let body = angular.element(element[0].querySelector('.js-tab__body'));

            $timeout(() => {
                ctrl.addTab(header, body);
            });
        }
    };
});

angular.module('thread.tab').directive('tdTabTitle', () => {
    return {
        replace: true,
        require: '^tdTabs',
        transclude: true,
        template: `<button class="c-tab__header-item c-button c-button--tab js-tab__title"
                           ng-click="$tabs.changeTab($event)"
                           ng-transclude></button>`,
        link(scope: Thread.Components.TabTitleScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) {
            scope.$tabs = ctrl;
        }
    };
});

angular.module('thread.tab').directive('tdTabBody', () => {
    return {
        replace: true,
        require: '^tdTab',
        transclude: true,
        template: '<div class="c-tab__body js-tab__body" ng-transclude></div>'
    };
});
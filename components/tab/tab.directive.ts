
module Thread.Components {
    import IAugmentedJQuery = angular.IAugmentedJQuery;
    export class Tabs implements ng.IDirective {
        restrict = 'E';
        template = `<div class="c-tab">
                        <div class="c-tab__header"></div>
                        <div class="c-tab__content-wrapper">
                            <div class="c-tab__content" ng-transclude></div>
                        </div>
                    </div>`;
        replace = true;
        transclude = true;
        bindToController = true;
        controllerAs = '$tabs';

        constructor() {

        }

        link(scope : ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {

        }

        controller($element: ng.IAugmentedJQuery) {
            angular.extend(this, {
                activeTab: 1,
                tabs: [],
                addTab,
                changeTab,
                updateTabs,
                clearTab
            });

            function addTab(header : IAugmentedJQuery, body : IAugmentedJQuery) {
                let idx = this.tabs.push({
                    header: header,
                    body: body
                });

                angular.element($element[0].querySelector('.c-tab__header')).append(header);

                header.attr('td-tab-index', idx);
                body.attr('td-tab-index', idx);

                this.updateTabs();
            }

            function changeTab(event: JQueryEventObject) {
                let index = <string>event.target.getAttribute('td-tab-index');

                if(index && parseInt(index) !== this.activeTab) {
                    this.activeTab = parseInt(index);
                    this.updateTabs();
                }
            }

            function updateTabs() {
                for(let i = 0; i < this.tabs.length; i++) {
                    let idx = i + 1;

                    this.clearTab(i);

                    if(idx === this.activeTab) {
                        this.tabs[i].header.addClass('active');
                        this.tabs[i].body.addClass('active');
                    } else if (idx < this.activeTab) {
                        this.tabs[i].header.addClass('left');
                        this.tabs[i].body.addClass('left');
                    } else {
                        this.tabs[i].header.addClass('right');
                        this.tabs[i].body.addClass('right');
                    }

                }
            }

            function clearTab(idx: number) {
                this.tabs[idx].header.removeClass('active right left');
                this.tabs[idx].body.removeClass('active right left');
            }
        }

        static factory() : ng.IDirectiveFactory {
            return () => new Tabs();
        }
    }

    export class Tab implements ng.IDirective {
        restrict = 'E';
        require = '^tdTabs';

        constructor() {

        }

        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) {
            let header = angular.element(element[0].querySelector('.js-tab__title'));
            let body = angular.element(element[0].querySelector('.js-tab__body'));

            ctrl.addTab(header, body);
        }

        controller() {

        }

        static factory() : ng.IDirectiveFactory {
            return () => new Tab();
        }
    }

    export class TabTitle implements ng.IDirective {
        replace = true;
        require = '^tdTab';
        transclude = true;
        template = `<button class="c-tab__header-item c-button c-button--tab js-tab__title"
                            ng-click="$tabs.changeTab($event)"
                            ng-transclude></button>`;

        constructor() {

        }

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
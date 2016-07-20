module Thread.Components {
    export class ScrollCollapse implements ng.IDirective {
        restrict = 'A';

        constructor(private $window: ng.IWindowService) {
        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            let lastScroll = 0;

            angular.element(this.$window).on('scroll', () => {
                let scroll = document.querySelector('body').scrollTop;

                //Scrolling down
                if (scroll > lastScroll + 10) {
                    element.addClass('collapsed');
                    lastScroll = scroll;
                    //Scrolling up
                } else if (scroll < lastScroll - 10) {
                    element.removeClass('collapsed');
                    lastScroll = scroll;
                }
            });
        }

        static factory(): ng.IDirectiveFactory {
            const directive = ($window: ng.IWindowService) => new ScrollCollapse($window);
            directive.$inject = ['$window'];
            return directive;
        }
    }
}

angular.module('thread.scrollCollapse', []).directive('scrollCollapse', Thread.Components.ScrollCollapse.factory());
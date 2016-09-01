module Thread.Components {
    export class ScrollCollapse implements ng.IDirective {
        restrict = 'A';
        static $inject = ['$window'];

        constructor(private $window: ng.IWindowService) {
        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            let lastScroll = 0;

            angular.element(this.$window).on('scroll', () => {
                let scroll = document.querySelector('body').scrollTop;

                //Scrolling down
                if (scroll > lastScroll + 10) {
                    element.addClass('is-collapsed');
                    lastScroll = scroll;
                    //Scrolling up
                } else if (scroll < lastScroll - 10) {
                    element.removeClass('is-collapsed');
                    lastScroll = scroll;
                }
            });
        };

        static factory(): ng.IDirectiveFactory {
            const directive = ($window: ng.IWindowService) => new ScrollCollapse($window);
            return directive;
        }
    }
}

angular.module('thread.scrollCollapse', []).directive('scrollCollapse', ['$window', Thread.Components.ScrollCollapse.factory()]);
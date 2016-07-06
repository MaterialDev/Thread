angular.module('thread.scrollCollapse', []).directive('scrollCollapse', ($window) => {
    return {
        link(scope, element, attrs) {
            let lastScroll = 0;

            angular.element($window).on('scroll', () => {
                let scroll = angular.element(document.querySelector('body')).scrollTop();

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
    };
});
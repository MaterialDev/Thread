angular.module('thread.dynamicBackground', []).directive('dynamicBackground', ($window: ng.IWindowService, $interval: ng.IIntervalService) => {
    return {
        link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: any) {
            let backgroundEl : ng.IAugmentedJQuery = angular.element('<div class="js-page__background l-page__background"></div>');
            backgroundEl[0].style.height = `${calculateHeight(element, parseInt(attrs.dynamicBackground))}px`;
            element.prepend(backgroundEl);

            /*
                Resize the background once shift from fonts loaded has occured
                Use interval as a fix for IE and Safari
             */
            if('fonts' in document) {
                (<any>document).fonts.ready.then(function() {
                    backgroundEl[0].style.height = `${calculateHeight(element, parseInt(attrs.dynamicBackground))}px`;
                });
            } else {
                let readyCheckInterval = $interval(() => {
                    if(document.readyState === "complete") {
                        backgroundEl[0].style.height = `${calculateHeight(element, parseInt(attrs.dynamicBackground))}px`;
                        $interval.cancel(readyCheckInterval);
                    }
                }, 10);
            }

            angular.element($window).on('resize', () => {
                backgroundEl[0].style.height = `${calculateHeight(element, parseInt(attrs.dynamicBackground))}px`;
            });

            function calculateHeight(element: ng.IAugmentedJQuery, optionalHeight: number) : number {
                let cutoff = element[0].querySelector('[dynamic-background-end]');

                if(!cutoff) {
                    throw new Error('No dynamic background end! Please add the attribute "dynamic-background-end" to a child element');
                }

                let cutoffRect = cutoff.getBoundingClientRect();

                if(optionalHeight) {
                    return cutoffRect.top + document.body.scrollTop + optionalHeight;
                } else {
                    return cutoffRect.top + document.body.scrollTop + 64;
                }
            }
        },
        bindToController: true,
        controllerAs: '$pageBackground'
    };
});
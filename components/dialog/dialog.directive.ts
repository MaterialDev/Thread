
module Thread.Components {
    export interface DialogScope extends ng.IScope {
        open: Function;
        close: Function;
    }

    export class DialogController {
        deferCallback: ng.IDeferred<any>;
        cancelled: boolean;

        constructor(private $element : ng.IAugmentedJQuery) {}

        $onInit() {}

        close(response? : any) {
            this.$element.removeClass('.is-active');
            if(this.cancelled) {
                this.deferCallback.reject(response);
            } else {
                this.deferCallback.resolve(response);
            }
        }

        cancel() {
            this.cancelled = true;
            this.close();
        }

        open(deferred) {
            this.$element.addClass('.is-active');
            document.body.style.overflow = 'hidden';

            if(deferred) {
                this.deferCallback = deferred;
            }
        }

        $onDestroy() {
            this.$element.remove();
            document.body.style.overflow = '';
        }
    }
}

angular.module('thread.dialog').directive('tdDialog', () => {
   return {
       scope: true,
       controller: ['$element', Thread.Components.DialogController],
       controllerAs: '$dialog'
   };
});
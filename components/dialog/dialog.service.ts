module Thread.Services {
    export class DialogService {
        constructor(
            private $q: ng.IQService,
            private $rootScope: ng.IRootScopeService,
            private $compile: ng.ICompileService
        ) {}

        open(options) : ng.IPromise {
            let deferred : ng.IDeferred;
            let dialogElement : ng.IAugmentedJQuery;
            let dialogScope : Thread.Components.DialogScope;

            deferred = this.$q.defer();

            dialogElement = angular.element(`
                <td-dialog
                    target="${options.target}"
                    template="${options.template}"
                ></td-dialog>
            `);

            angular.element(document.body).append(dialogElement);
            this.$compile(dialogElement)(options.scope || this.$rootScope);
            dialogScope = <Thread.Components.DialogScope>dialogElement.isolateScope();

            dialogScope.open(deferred);

            return deferred.promise;
        }
    }
}

angular.module('thread.dialog').service('$dialog', Thread.Services.DialogService);
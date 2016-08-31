var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
angular.module('thread.dialog', []);
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var DialogController = (function () {
            function DialogController($element) {
                this.$element = $element;
            }
            DialogController.prototype.$onInit = function () { };
            DialogController.prototype.close = function (response) {
                this.$element.removeClass('.is-active');
                if (this.cancelled) {
                    this.deferCallback.reject(response);
                }
                else {
                    this.deferCallback.resolve(response);
                }
            };
            DialogController.prototype.cancel = function () {
                this.cancelled = true;
                this.close();
            };
            DialogController.prototype.open = function (deferred) {
                this.$element.addClass('.is-active');
                document.body.style.overflow = 'hidden';
                if (deferred) {
                    this.deferCallback = deferred;
                }
            };
            DialogController.prototype.$onDestroy = function () {
                this.$element.remove();
                document.body.style.overflow = '';
            };
            return DialogController;
        }());
        Components.DialogController = DialogController;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.dialog').directive('tdDialog', function () {
    return {
        scope: true,
        controller: Thread.Components.DialogController,
        controllerAs: '$dialog'
    };
});
var Thread;
(function (Thread) {
    var Services;
    (function (Services) {
        var DialogService = (function () {
            function DialogService($q, $rootScope, $compile) {
                this.$q = $q;
                this.$rootScope = $rootScope;
                this.$compile = $compile;
            }
            DialogService.prototype.open = function (options) {
                var deferred;
                var dialogElement;
                var dialogScope;
                deferred = this.$q.defer();
                dialogElement = angular.element("\n                <td-dialog\n                    target=\"" + options.target + "\"\n                    template=\"" + options.template + "\"\n                ></td-dialog>\n            ");
                angular.element(document.body).append(dialogElement);
                this.$compile(dialogElement)(options.scope || this.$rootScope);
                dialogScope = dialogElement.isolateScope();
                dialogScope.open(deferred);
                return deferred.promise;
            };
            return DialogService;
        }());
        Services.DialogService = DialogService;
    })(Services = Thread.Services || (Thread.Services = {}));
})(Thread || (Thread = {}));
angular.module('thread.dialog').service('$dialog', Thread.Services.DialogService);
angular.module('thread.dynamicBackground', []).directive('dynamicBackground', ["$window", "$interval", function ($window, $interval) {
    return {
        link: function (scope, element, attrs) {
            var backgroundEl = angular.element('<div class="js-page__background l-page__background"></div>');
            backgroundEl[0].style.height = calculateHeight(element, parseInt(attrs.dynamicBackground)) + "px";
            element.prepend(backgroundEl);
            /*
                Resize the background once shift from fonts loaded has occured
                Use interval as a fix for IE and Safari
             */
            if ('fonts' in document) {
                document.fonts.ready.then(function () {
                    backgroundEl[0].style.height = calculateHeight(element, parseInt(attrs.dynamicBackground)) + "px";
                });
            }
            else {
                var readyCheckInterval_1 = $interval(function () {
                    if (document.readyState === "complete") {
                        backgroundEl[0].style.height = calculateHeight(element, parseInt(attrs.dynamicBackground)) + "px";
                        $interval.cancel(readyCheckInterval_1);
                    }
                }, 10);
            }
            angular.element($window).on('resize', function () {
                backgroundEl[0].style.height = calculateHeight(element, parseInt(attrs.dynamicBackground)) + "px";
            });
            function calculateHeight(element, optionalHeight) {
                var cutoff = element[0].querySelector('[dynamic-background-end]');
                if (!cutoff) {
                    throw new Error('No dynamic background end! Please add the attribute "dynamic-background-end" to a child element');
                }
                var cutoffRect = cutoff.getBoundingClientRect();
                if (optionalHeight) {
                    return cutoffRect.top + document.body.scrollTop + optionalHeight;
                }
                else {
                    return cutoffRect.top + document.body.scrollTop + 64;
                }
            }
        },
        bindToController: true,
        controllerAs: '$pageBackground'
    };
}]);
/**
 * Floating label
 * A component that controls label interactions on input fields
 * @author Zach Barnes
 * @created 07/13/2016
 */
function floatingLabelLink($timeout) {
    return function _floatingLabelLink(scope, element, attrs, ctrl) {
        if (attrs.noFloat !== undefined) {
            return;
        }
        $timeout(function () {
            var inputField = angular.element(element[0].querySelector('.c-input__field'));
            var ngModelCtrl = inputField.controller('ngModel');
            element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
            inputField.on('input', function () {
                element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
            });
            inputField.on('focus', function () {
                element.addClass('has-focus');
            });
            inputField.on('blur', function () {
                element.removeClass('has-focus');
            });
            if (ngModelCtrl) {
                ngModelCtrl.$formatters.push(function (value) {
                    element.toggleClass('has-value', !!value || !!inputField.attr('placeholder'));
                    return value;
                });
            }
            scope.$on('$destroy', function () {
                inputField.off('focus');
                inputField.off('blur');
            });
        });
    };
}
angular.module('thread.floatingLabel', []).directive('floatingLabel', ["$timeout", function ($timeout) {
    return {
        restrict: 'A',
        link: floatingLabelLink($timeout)
    };
}]);
angular.module('thread.floatingLabel').directive('cInput', ["$timeout", function ($timeout) {
    return {
        restrict: 'C',
        link: floatingLabelLink($timeout)
    };
}]);
angular.module('thread.inputRequire', []).directive('cInput', ["$timeout", function ($timeout) {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            $timeout(function () {
                var inputField = angular.element(element[0].querySelector('.c-input__field'));
                if (!inputField.attr('required') || attrs.hideRequire != null) {
                    return;
                }
                element.addClass('has-required');
                element.toggleClass('has-required-invalid', !inputField.val());
                inputField.on('input', function () {
                    element.toggleClass('has-required-invalid', !this.value);
                });
            });
        }
    };
}]);
/**
 * Menu
 * A component that shows/hides a list of items based on target click
 * @author Zach Barnes
 * @created 07/06/2016
 */
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var Menu = (function () {
            function Menu($timeout) {
                var _this = this;
                this.$timeout = $timeout;
                this.scope = {};
                this.transclude = true;
                this.restrict = 'E';
                this.bindToController = true;
                this.controllerAs = '$menu';
                this.template = "<div class=\"c-menu js-menu\">\n                        <div class=\"c-menu__backdrop js-menu__backdrop\"></div>\n                        <ng-transclude></ng-transclude>\n                    </div>";
                this.link = function (scope, element, attrs, ctrl) {
                    ctrl.menuContent = angular.element(element[0].querySelector('.js-menu__content'));
                    ctrl.backdrop = angular.element(element[0].querySelector('.js-menu__backdrop'));
                    if (attrs.hasOwnProperty('width')) {
                        ctrl.menuContent.addClass("c-menu__content--width-" + attrs.width);
                    }
                    if (attrs.hasOwnProperty('moveToBody')) {
                        ctrl.moveToBody();
                    }
                    if (attrs.hasOwnProperty('position')) {
                        var splitPos = attrs.position.split(' ');
                        ctrl.setPosition(splitPos[0], splitPos[1]);
                    }
                    else {
                        ctrl.setPosition('top', 'left');
                    }
                    ctrl.backdrop.on('click', function () {
                        ctrl.close();
                    });
                    angular.element(ctrl.menuContent[0].querySelectorAll('.js-menu__item')).on('click', function () {
                        _this.$timeout(function () { return ctrl.close(); }, 100);
                    });
                };
            }
            Menu.prototype.controller = function ($scope, $element) {
                var _this = this;
                angular.extend(this, {
                    onBody: false,
                    xPos: null,
                    yPos: null,
                    open: open,
                    close: close,
                    setPosition: setPosition,
                    moveToBody: moveToBody
                });
                $scope.$on('$destroy', function () {
                    _this.backdrop.remove();
                    _this.menuContent.remove();
                    _this.backdrop = null;
                    _this.menuContent = null;
                });
                function open() {
                    var menuTarget = angular.element($element[0].querySelector('.js-menu__target'));
                    angular.element($element[0].querySelector('.js-menu')).addClass('is-open');
                    this.menuContent.addClass('is-open');
                    this.backdrop.addClass('is-open');
                    if (this.onBody) {
                        var targetPos = menuTarget[0].getBoundingClientRect();
                        var left = void 0;
                        var top_1;
                        switch (this.xPos) {
                            case 'right':
                                left = targetPos.right - this.menuContent[0].offsetHeight;
                                break;
                            case 'left':
                                left = targetPos.left;
                                break;
                        }
                        switch (this.yPos) {
                            case 'top':
                                top_1 = targetPos.top;
                                break;
                            case 'bottom':
                                top_1 = targetPos.bottom - this.menuContent[0].offsetHeight;
                                break;
                        }
                        this.menuContent[0].style.left = (left + document.body.scrollLeft) + "px";
                        this.menuContent[0].style.top = (top_1 + document.body.scrollTop) + "px";
                        this.menuContent[0].style.right = 'initial';
                        this.menuContent[0].style.bottom = 'initial';
                    }
                }
                function close() {
                    angular.element($element[0].querySelector('.js-menu')).removeClass('is-open');
                    this.menuContent.removeClass('is-open');
                    this.backdrop.removeClass('is-open');
                }
                function setPosition(yPosition, xPosition) {
                    switch (yPosition) {
                        case 'top':
                            this.menuContent.addClass('c-menu__content--top');
                            break;
                        case 'bottom':
                            this.menuContent.addClass('c-menu__content--bottom');
                            break;
                    }
                    switch (xPosition) {
                        case 'left':
                            this.menuContent.addClass('c-menu__content--left');
                            break;
                        case 'right':
                            this.menuContent.addClass('c-menu__content--right');
                            break;
                    }
                    this.xPos = xPosition;
                    this.yPos = yPosition;
                }
                function moveToBody() {
                    this.onBody = true;
                    this.menuContent.addClass('js-menu__content--on-body');
                    angular.element(document.querySelector('body')).append(this.menuContent);
                    angular.element(document.querySelector('body')).append(this.backdrop);
                }
            };
            Menu.factory = function () {
                var directive = function ($timeout) { return new Menu($timeout); };
                directive.$inject = ['$timeout'];
                return directive;
            };
            return Menu;
        }());
        Components.Menu = Menu;
        var MenuTarget = (function () {
            function MenuTarget() {
                this.require = '^tdMenu';
                this.transclude = true;
                this.replace = true;
                this.scope = true;
                this.template = "<button\n                    class=\"c-menu__target c-button js-menu__target\"\n                    ng-transclude\n                    ng-click=\"$menu.open()\"></button>";
                this.link = function (scope, element, attrs, ctrl) {
                    scope.$menu = ctrl;
                };
            }
            MenuTarget.factory = function () {
                return function () { return new MenuTarget(); };
            };
            return MenuTarget;
        }());
        Components.MenuTarget = MenuTarget;
        var MenuContent = (function () {
            function MenuContent() {
                this.require = '^tdMenu';
                this.transclude = true;
                this.replace = true;
                this.scope = true;
                this.template = '<ul class="c-menu__content js-menu__content" ng-transclude></ul>';
            }
            MenuContent.factory = function () {
                return function () { return new MenuContent(); };
            };
            return MenuContent;
        }());
        Components.MenuContent = MenuContent;
        var MenuItem = (function () {
            function MenuItem() {
                this.require = '^tdMenuContent';
                this.transclude = true;
                this.replace = true;
                this.scope = true;
                this.template = '<a class="c-button c-button--menu c-menu__item js-menu__item" ng-transclude></a>';
            }
            MenuItem.factory = function () {
                return function () { return new MenuItem(); };
            };
            return MenuItem;
        }());
        Components.MenuItem = MenuItem;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
var menu = angular.module('thread.menu', []);
menu.directive('tdMenu', Thread.Components.Menu.factory());
menu.directive('tdMenuTarget', Thread.Components.MenuTarget.factory());
menu.directive('tdMenuContent', Thread.Components.MenuContent.factory());
menu.directive('tdMenuItem', Thread.Components.MenuItem.factory());
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var ScrollCollapse = (function () {
            function ScrollCollapse($window) {
                var _this = this;
                this.$window = $window;
                this.restrict = 'A';
                this.link = function (scope, element, attrs) {
                    var lastScroll = 0;
                    angular.element(_this.$window).on('scroll', function () {
                        var scroll = document.querySelector('body').scrollTop;
                        //Scrolling down
                        if (scroll > lastScroll + 10) {
                            element.addClass('is-collapsed');
                            lastScroll = scroll;
                        }
                        else if (scroll < lastScroll - 10) {
                            element.removeClass('is-collapsed');
                            lastScroll = scroll;
                        }
                    });
                };
            }
            ScrollCollapse.factory = function () {
                var directive = function ($window) { return new ScrollCollapse($window); };
                directive.$inject = ['$window'];
                return directive;
            };
            return ScrollCollapse;
        }());
        Components.ScrollCollapse = ScrollCollapse;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.scrollCollapse', []).directive('scrollCollapse', Thread.Components.ScrollCollapse.factory());
/**
 * Progressive Disclosure
 * A natural language component that shows one
 * section at a time centered in the middle of the screen
 * @author Zach Barnes
 * @created 06/15/2016
 */
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var ProdisController = (function () {
            function ProdisController($element, $timeout) {
                this.$element = $element;
                this.$timeout = $timeout;
                this.currentSection = 0;
                this.sections = [];
            }
            ProdisController.prototype.next = function () {
                if (++this.currentSection >= this.sections.length) {
                    this.currentSection = this.sections.length - 1;
                    this.updateSections();
                }
            };
            ProdisController.prototype.goTo = function (sectionName) {
                for (var i = this.currentSection; i < this.sections.length; i++) {
                    if (this.sections[i].name === sectionName) {
                        this.currentSection = i;
                        this.updateSections();
                        return;
                    }
                }
            };
            ProdisController.prototype.getCurrent = function () {
                return this.currentSection;
            };
            ProdisController.prototype.updateSections = function () {
                var height = 0;
                var prodisEl;
                for (var i = 0; i <= this.currentSection; i++) {
                    height += this.getSectionHeight(this.sections[i].element);
                }
                prodisEl = this.$element[0].querySelector('.js-prodis');
                prodisEl.style.height = height + "px";
            };
            ProdisController.prototype.registerSection = function (element, name) {
                var _this = this;
                this.sections.push({
                    element: element,
                    name: name
                });
                this.$timeout(function () {
                    _this.updateSections();
                });
                return this.sections.length - 1;
            };
            ProdisController.prototype.getSectionHeight = function (section) {
                var height = section.offsetHeight;
                var style = getComputedStyle(section);
                height += parseInt(style.marginTop) + parseInt(style.marginBottom);
                return height;
            };
            return ProdisController;
        }());
        Components.ProdisController = ProdisController;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.prodis', []).directive('prodis', function () {
    return {
        template: "<div class=\"c-natural-language\">\n                        <div class=\"c-prodis js-prodis\" ng-transclude></div>\n                   </div>",
        bindToController: true,
        transclude: true,
        replace: true,
        controllerAs: '$prodis',
        controller: Thread.Components.ProdisController
    };
});
angular.module('thread.prodis').directive('prodisSection', function () {
    return {
        template: "<div class=\"c-natural-language__section c-prodis__section js-prodis__section\"\n                        ng-class=\"{\n                            'c-prodis__section--complete': $prodisSection.isComplete,\n                            'c-prodis__section--visible': $prodisSection.id <= $prodis.currentSection\n                        }\" ng-transclude></div>",
        require: '^prodis',
        transclude: true,
        controllerAs: '$prodisSection',
        bindToController: true,
        //replace: true,
        scope: true,
        controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
            var $parent = $scope.$prodis;
            this.id = $parent.registerSection($element[0].querySelector('.js-prodis__section'), $attrs.name);
            this.isComplete = !!$attrs.isComplete;
        }]
    };
});
/**
 * Tab component
 * A component that allows switching between
 * sets of content separated into groups by tabs
 * @author Zach Barnes
 * @created 07/08/2016
 */
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var TabsController = (function () {
            function TabsController($scope, $element, $timeout) {
                this.$scope = $scope;
                this.$element = $element;
                this.$timeout = $timeout;
                this.activeTab = 1;
                this.tabs = [];
                this.lastTab = -1;
            }
            TabsController.prototype.$onInit = function () {
                var _this = this;
                this.$scope.$watch(function () { return _this.currentTab; }, function (newValue, oldValue) {
                    if (newValue && newValue === oldValue) {
                        _this.activeTab = newValue;
                        _this.updateTabs();
                    }
                    else if (newValue) {
                        _this.changeTab(null, newValue);
                    }
                });
            };
            TabsController.prototype.resizeTabs = function () {
                var width = 16;
                for (var i = 0; i < this.tabs.length; i++) {
                    width += this.tabs[i].header[0].offsetWidth;
                }
                var tabHeader = this.$element[0].querySelector('.js-tab__header');
                tabHeader.style.width = width + "px";
            };
            TabsController.prototype.addTab = function (header, body) {
                var idx = this.tabs.push({
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
            };
            TabsController.prototype.changeTab = function (event, index) {
                if (index == null) {
                    index = parseInt(event.target.getAttribute('td-tab-index'));
                }
                if (index && index !== this.activeTab) {
                    this.lastTab = this.activeTab;
                    this.activeTab = index;
                    this.updateTabs();
                }
            };
            TabsController.prototype.updateTabs = function () {
                var height;
                var content;
                if (this.lastTab > -1) {
                    height = this.tabs[this.activeTab - 1].body[0].offsetHeight;
                    content = this.$element[0].querySelector('.js-tab__content');
                    content.style.height = height + "px";
                    content.style.transition = 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)';
                }
                for (var i = 0; i < this.tabs.length; i++) {
                    var idx = i + 1;
                    this.clearTab(i);
                    if (idx === this.activeTab) {
                        this.tabs[i].header.addClass('is-active');
                        this.tabs[i].body.addClass('is-active');
                    }
                    else if (idx < this.activeTab) {
                        this.tabs[i].header.addClass('is-left');
                        this.tabs[i].body.addClass('is-left');
                    }
                    else {
                        this.tabs[i].header.addClass('is-right');
                        this.tabs[i].body.addClass('is-right');
                    }
                }
                if (this.lastTab > -1) {
                    this.$timeout(function () {
                        content.style.height = '';
                    }, 500);
                }
            };
            TabsController.prototype.clearTab = function (idx) {
                document.activeElement.blur();
                this.tabs[idx].header.removeClass('is-active is-right is-left');
                this.tabs[idx].body.removeClass('is-active is-right is-left');
            };
            return TabsController;
        }());
        Components.TabsController = TabsController;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.tab', []).directive('tdTabs', ["$interval", function ($interval) {
    return {
        scope: {
            currentTab: '='
        },
        restrict: 'E',
        template: "<div class=\"c-tab\">\n                        <div class=\"c-tab__header-wrapper\">\n                            <div class=\"c-tab__header js-tab__header\"></div>\n                        </div>\n                        <div class=\"c-tab__content-wrapper\">\n                            <div class=\"c-tab__content js-tab__content\" ng-transclude></div>\n                        </div>\n                    </div>",
        replace: true,
        transclude: true,
        bindToController: true,
        controllerAs: '$tabs',
        controller: Thread.Components.TabsController,
        link: function (scope, element, attrs, ctrl) {
            /*
             Resize the background once shift from fonts loaded has occured
             Use interval as a fix for IE and Safari
             */
            if ('fonts' in document) {
                document.fonts.ready.then(function () {
                    ctrl.resizeTabs();
                });
            }
            else {
                var readyCheckInterval_2 = $interval(function () {
                    if (document.readyState === "complete") {
                        ctrl.resizeTabs();
                        $interval.cancel(readyCheckInterval_2);
                    }
                }, 10);
            }
        }
    };
}]);
angular.module('thread.tab').directive('tdTab', ["$timeout", function ($timeout) {
    return {
        restrict: 'E',
        require: '^tdTabs',
        scope: true,
        link: function (scope, element, attrs, ctrl) {
            var header = angular.element(element[0].querySelector('.js-tab__title'));
            var body = angular.element(element[0].querySelector('.js-tab__body'));
            $timeout(function () {
                ctrl.addTab(header, body);
            });
        }
    };
}]);
angular.module('thread.tab').directive('tdTabTitle', function () {
    return {
        replace: true,
        require: '^tdTabs',
        transclude: true,
        template: "<button class=\"c-tab__header-item c-button c-button--tab js-tab__title\"\n                           ng-click=\"$tabs.changeTab($event)\"\n                           ng-transclude></button>",
        link: function (scope, element, attrs, ctrl) {
            scope.$tabs = ctrl;
        }
    };
});
angular.module('thread.tab').directive('tdTabBody', function () {
    return {
        replace: true,
        require: '^tdTab',
        transclude: true,
        template: '<div class="c-tab__body js-tab__body" ng-transclude></div>'
    };
});
/**
 * Wave effect
 * A directive that shows a growing circle in the background
 * of components it's attached to
 * @author Zach Barnes
 * @created 07/11/2016
 */
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var waveEffect = (function () {
            function waveEffect($timeout) {
                var _this = this;
                this.$timeout = $timeout;
                this.restrict = 'A';
                this.link = function (scope, element, attrs, ctrl) {
                    if (attrs.hasOwnProperty('noWave')) {
                        return;
                    }
                    var waveEl;
                    var rawElement = element[0];
                    var isFab = false;
                    var removeActiveTriggered = false;
                    var removeActiveTimeout = null;
                    _this.$timeout(function () {
                        var width;
                        var height;
                        waveEl = angular.element('<span class="wave-effect"></span>');
                        if (element.hasClass('c-button--fab') ||
                            element.hasClass('c-button--fab-mini') ||
                            element.hasClass('c-button--icon')) {
                            waveEl.addClass('wave-effect--fab');
                            isFab = true;
                        }
                        if (isFab) {
                            //circle, height must match the width
                            width = rawElement.offsetWidth;
                            height = rawElement.offsetWidth;
                        }
                        else {
                            width = Math.ceil(rawElement.offsetWidth);
                            height = Math.ceil(rawElement.offsetWidth);
                        }
                        waveEl[0].style.width = width + "px";
                        waveEl[0].style.height = height + "px";
                        element.append(waveEl);
                    });
                    angular.element(document.querySelector('body')).on('mouseup', onMouseUp);
                    element.on('mousedown', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.which === 1) {
                            if (!isFab) {
                                var pos = { left: e.clientX, top: e.clientY };
                                var parentPos = e.target.getBoundingClientRect();
                                waveEl[0].style.left = (pos.left - parentPos.left) + "px";
                                waveEl[0].style.top = (pos.top - parentPos.top) + "px";
                            }
                            waveEl.removeClass('has-focus');
                            waveEl.addClass('is-active');
                            removeActiveTimeout = _this.$timeout(function () {
                                if (removeActiveTriggered) {
                                    removeActiveTriggered = false;
                                    waveEl.removeClass('is-active');
                                }
                                removeActiveTimeout = null;
                            }, 300);
                        }
                    });
                    element.on('focus', function () {
                        waveEl[0].style.left = '';
                        waveEl[0].style.top = '';
                        if (!element.hasClass('is-active')) {
                            waveEl.addClass('has-focus');
                        }
                        else {
                            rawElement.blur();
                        }
                    });
                    element.on('blur', function () {
                        waveEl.removeClass('has-focus');
                    });
                    function onMouseUp() {
                        if (removeActiveTimeout) {
                            removeActiveTriggered = true;
                        }
                        else {
                            waveEl.removeClass('is-active');
                        }
                        rawElement.blur();
                    }
                    scope.$on('$destroy', function () {
                        if (waveEl) {
                            waveEl.remove();
                        }
                        angular.element(document.querySelector('body')).off('mouseup', onMouseUp);
                    });
                };
            }
            waveEffect.factory = function () {
                var directive = function ($timeout) { return new Thread.Components.waveEffect($timeout); };
                directive.$inject = ['$timeout'];
                return directive;
            };
            return waveEffect;
        }());
        Components.waveEffect = waveEffect;
        var waveEffectButton = (function (_super) {
            __extends(waveEffectButton, _super);
            function waveEffectButton() {
                _super.apply(this, arguments);
                this.restrict = 'C';
            }
            waveEffectButton.factory = function () {
                var directive = function ($timeout) { return new Thread.Components.waveEffectButton($timeout); };
                directive.$inject = ['$timeout'];
                return directive;
            };
            return waveEffectButton;
        }(waveEffect));
        Components.waveEffectButton = waveEffectButton;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.waveEffect', []).directive('waveEffect', Thread.Components.waveEffect.factory());
angular.module('thread.waveEffect').directive('cButton', Thread.Components.waveEffectButton.factory());
/**
 * Select Resize
 * Automatically resizes select elements to fit the text exactly
 * @author Zach Barnes
 * @created 07/19/2016
 */
angular.module('thread.selectResize', []).directive('selectResizeParent', function () {
    return {
        bindToController: true,
        controller: ["$element", function ($element) {
            this.getElement = getElement;
            function getElement() {
                return $element;
            }
        }]
    };
});
angular.module('thread.selectResize').directive('selectResize', ["$timeout", function ($timeout) {
    return {
        require: '?^selectResizeParent',
        scope: {
            onResize: '&selectResize',
            resizeDefault: '@'
        },
        link: function (scope, element, attrs, ctrl) {
            $timeout(function () {
                resizeInput();
            });
            angular.element(element).on('change', function () {
                resizeInput();
            });
            function resizeInput() {
                var el = element[0];
                var arrowWidth = 24;
                var text = el.options[el.selectedIndex].text;
                var width;
                if (text) {
                    var testEl = angular.element('<span>').html(text);
                    var parent_1 = ctrl ? ctrl.getElement() : element.parent();
                    parent_1.append(testEl);
                    width = testEl[0].offsetWidth;
                    testEl.remove();
                    testEl = null;
                }
                else {
                    width = scope.resizeDefault || 150;
                }
                element[0].style.width = (width + arrowWidth) + "px";
                if (scope.onResize) {
                    scope.onResize();
                }
            }
        }
    };
}]);
/// <reference path="typings/angularjs/angular.d.ts" />
var thread;
(function (thread) {
    "use strict";
    angular.module('thread', [
        'thread.scrollCollapse',
        'thread.waveEffect',
        'thread.menu',
        'thread.tab',
        'thread.floatingLabel',
        'thread.inputRequire',
        'thread.prodis',
        'thread.selectResize',
        'thread.dynamicBackground',
        'thread.dialog'
    ]);
})(thread || (thread = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Njcm9sbENvbGxhcHNlL3Njcm9sbENvbGxhcHNlLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvcHJvZGlzL3Byb2Rpcy5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3RhYi90YWIuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy93YXZlRWZmZWN0L3dhdmVFZmZlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFlBQVksQ0FBQyxRQUFRLEtBQUssY0FBYyxVQUFVLEdBQUcsR0FBRztJQUN4RCxLQUFLLElBQUksS0FBSyxHQUFHLElBQUksRUFBRSxlQUFlLElBQUksRUFBRSxLQUFLLEVBQUU7SUFDbkQsU0FBUyxLQUFLLEVBQUUsS0FBSyxjQUFjO0lBQ25DLEVBQUUsWUFBWSxNQUFNLE9BQU8sT0FBTyxPQUFPLE1BQU0sR0FBRyxZQUFZLEVBQUUsV0FBVyxJQUFJOztBQ0huRixRQUFRLE9BQU8saUJBQWlCO0FDQ2hDLElBQU87QUFBUCxDQUFBLFVBQU8sUUFBTTtJQUFDLElBQUE7SUFBQSxDQUFB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QUFJLEtBQTRDLFFBQVE7Z0JBQ3hELElBQUksYUFBYTtnQkFDakIsSUFBSSxPQUEyQixHQUFHLFFBQVEsR0FBRyxlQUFnQjtnQkFDN0QsSUFBSTtnQkFFSixJQUFJLE1BQU07b0JBQ04sSUFBSSxTQUFTLFFBQVEsUUFBUSxVQUFVLEtBQUs7b0JBRTVDLElBQUksV0FBUyxPQUFPLEtBQUssZUFBZSxRQUFRO29CQUNoRCxTQUFPLE9BQU87b0JBRWQsUUFBUSxPQUFPLEdBQUc7b0JBQ2xCLE9BQU87b0JBQ1AsU0FBUzs7cUJBRU47b0JBQ0gsUUFBUSxNQUFNLGlCQUFpQjs7Z0JBR25DLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBRyxRQUFRLGNBQVU7Z0JBRTlDLElBQUksTUFBTSxVQUFVO29CQUNoQixNQUFNOzs7Ozs7O0FDOUQxQixJQUFPO0FBQVAsQ0FBQSxVQUFPLFFBQU87SUFDVjtJQUVBLFFBQVEsT0FBTyxVQUFVO1FBQ3JCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztHQWJELFdBQUEsU0FBTTtBYnEyQmIiLCJmaWxlIjoidGhyZWFkLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbn07XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgRGlhbG9nQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBEaWFsb2dDb250cm9sbGVyKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS4kb25EZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIgPSBEaWFsb2dDb250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xuICAgIH07XG59KTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBTZXJ2aWNlcztcbiAgICAoZnVuY3Rpb24gKFNlcnZpY2VzKSB7XG4gICAgICAgIHZhciBEaWFsb2dTZXJ2aWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIERpYWxvZ1NlcnZpY2UoJHEsICRyb290U2NvcGUsICRjb21waWxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kcSA9ICRxO1xuICAgICAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nU2VydmljZS5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dFbGVtZW50O1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dTY29wZTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KFwiXFxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cXFwiXCIgKyBvcHRpb25zLnRhcmdldCArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU9XFxcIlwiICsgb3B0aW9ucy50ZW1wbGF0ZSArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICA+PC90ZC1kaWFsb2c+XFxuICAgICAgICAgICAgXCIpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XG4gICAgICAgICAgICAgICAgZGlhbG9nU2NvcGUgPSBkaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dTZXJ2aWNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBTZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlID0gRGlhbG9nU2VydmljZTtcbiAgICB9KShTZXJ2aWNlcyA9IFRocmVhZC5TZXJ2aWNlcyB8fCAoVGhyZWFkLlNlcnZpY2VzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsIGZ1bmN0aW9uICgkd2luZG93LCAkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgYmFja2dyb3VuZEVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwianMtcGFnZV9fYmFja2dyb3VuZCBsLXBhZ2VfX2JhY2tncm91bmRcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzEgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXRvZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25hbEhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyA2NDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcbiAgICB9O1xufSk7XG4vKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICBpZiAoYXR0cnMubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICB2YXIgbmdNb2RlbEN0cmwgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcbiAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBNZW51ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnUoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0UnO1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcImMtbWVudSBqcy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKFwiYy1tZW51X19jb250ZW50LS13aWR0aC1cIiArIGF0dHJzLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbihzcGxpdFBvc1swXSwgc3BsaXRQb3NbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGN0cmwuY2xvc2UoKTsgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnUucHJvdG90eXBlLmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgICAgICBvbkJvZHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBvcGVuOiBvcGVuLFxuICAgICAgICAgICAgICAgICAgICBjbG9zZTogY2xvc2UsXG4gICAgICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbW92ZVRvQm9keTogbW92ZVRvQm9keVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWVudUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZWZ0ID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnhQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcF8xID0gdGFyZ2V0UG9zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wXzEgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5sZWZ0ID0gKGxlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSAodG9wXzEgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5iYWNrZHJvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE1lbnUuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR0aW1lb3V0KSB7IHJldHVybiBuZXcgTWVudSgkdGltZW91dCk7IH07XG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51ID0gTWVudTtcbiAgICAgICAgdmFyIE1lbnVUYXJnZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudVRhcmdldCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcXFwiXFxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJG1lbnUub3BlbigpXFxcIj48L2J1dHRvbj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRtZW51ID0gY3RybDtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudVRhcmdldC5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudVRhcmdldCgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51VGFyZ2V0O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVUYXJnZXQgPSBNZW51VGFyZ2V0O1xuICAgICAgICB2YXIgTWVudUNvbnRlbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudUNvbnRlbnQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51Q29udGVudC5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudUNvbnRlbnQoKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudUNvbnRlbnQ7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudUNvbnRlbnQgPSBNZW51Q29udGVudDtcbiAgICAgICAgdmFyIE1lbnVJdGVtID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVJdGVtKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51Q29udGVudCc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51SXRlbS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudUl0ZW0oKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudUl0ZW07XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudUl0ZW0gPSBNZW51SXRlbTtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbnZhciBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51Q29udGVudCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVDb250ZW50LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFNjcm9sbENvbGxhcHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdBJztcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0U2Nyb2xsID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KF90aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Nyb2xsIDwgbGFzdFNjcm9sbCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNjcm9sbENvbGxhcHNlLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkd2luZG93KSB7IHJldHVybiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7IH07XG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBTY3JvbGxDb2xsYXBzZTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZSA9IFNjcm9sbENvbGxhcHNlO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpKTtcbi8qKlxuICogUHJvZ3Jlc3NpdmUgRGlzY2xvc3VyZVxuICogQSBuYXR1cmFsIGxhbmd1YWdlIGNvbXBvbmVudCB0aGF0IHNob3dzIG9uZVxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNi8xNS8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgUHJvZGlzQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBQcm9kaXNDb250cm9sbGVyKCRlbGVtZW50LCAkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUuZ29UbyA9IGZ1bmN0aW9uIChzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpIDwgdGhpcy5zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0Q3VycmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2VjdGlvbjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTZWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcHJvZGlzRWw7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCArPSB0aGlzLmdldFNlY3Rpb25IZWlnaHQodGhpcy5zZWN0aW9uc1tpXS5lbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvZGlzRWwgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcbiAgICAgICAgICAgICAgICBwcm9kaXNFbC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUucmVnaXN0ZXJTZWN0aW9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFNlY3Rpb25IZWlnaHQgPSBmdW5jdGlvbiAoc2VjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBzZWN0aW9uLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBQcm9kaXNDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXIgPSBQcm9kaXNDb250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnLCBbXSkuZGlyZWN0aXZlKCdwcm9kaXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiYy1uYXR1cmFsLWxhbmd1YWdlXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXByb2RpcyBqcy1wcm9kaXNcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgIDwvZGl2PlwiLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlclxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcIntcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cXG4gICAgICAgICAgICAgICAgICAgICAgICB9XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlwiLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcbiAgICAgICAgICAgIHRoaXMuaWQgPSAkcGFyZW50LnJlZ2lzdGVyU2VjdGlvbigkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzX19zZWN0aW9uJyksICRhdHRycy5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIFRhYiBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHN3aXRjaGluZyBiZXR3ZWVuXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA4LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBUYWJzQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBUYWJzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSAxO1xuICAgICAgICAgICAgICAgIHRoaXMudGFicyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuY3VycmVudFRhYjsgfSwgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hY3RpdmVUYWIgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5yZXNpemVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IDE2O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0YWJIZWFkZXIgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xuICAgICAgICAgICAgICAgIHRhYkhlYWRlci5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUYWIgPSBmdW5jdGlvbiAoaGVhZGVyLCBib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IHRoaXMudGFicy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XG4gICAgICAgICAgICAgICAgaGVhZGVyLmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XG4gICAgICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJztcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2hhbmdlVGFiID0gZnVuY3Rpb24gKGV2ZW50LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggJiYgaW5kZXggIT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVRhYnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodDtcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUudHJhbnNpdGlvbiA9ICdoZWlnaHQgNTAwbXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZHggPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkeCA9PT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlkeCA8IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5jbGVhclRhYiA9IGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uYm9keS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gVGFic0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuVGFic0NvbnRyb2xsZXIgPSBUYWJzQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJywgW10pLmRpcmVjdGl2ZSgndGRUYWJzJywgZnVuY3Rpb24gKCRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiYy10YWJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19oZWFkZXItd3JhcHBlclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19oZWFkZXIganMtdGFiX19oZWFkZXJcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19jb250ZW50LXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcixcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZWFkeUNoZWNrSW50ZXJ2YWxfMiA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWxfMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWInLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2JvZHknKSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogXCI8YnV0dG9uIGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlPjwvYnV0dG9uPlwiLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjLXRhYl9fYm9keSBqcy10YWJfX2JvZHlcIiBuZy10cmFuc2NsdWRlPjwvZGl2PidcbiAgICB9O1xufSk7XG4vKipcbiAqIFdhdmUgZWZmZWN0XG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGEgZ3Jvd2luZyBjaXJjbGUgaW4gdGhlIGJhY2tncm91bmRcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTEvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIHdhdmVFZmZlY3QgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdCgkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQSc7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHdhdmVFbDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNGYWIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuIGNsYXNzPVwid2F2ZS1lZmZlY3RcIj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCd3YXZlLWVmZmVjdC0tZmFiJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gd2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9uKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50UG9zID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gKHBvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gKHBvcy50b3AgLSBwYXJlbnRQb3MudG9wKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2F2ZUVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub2ZmKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhdmVFZmZlY3QuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR0aW1lb3V0KSB7IHJldHVybiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7IH07XG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gd2F2ZUVmZmVjdDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0ID0gd2F2ZUVmZmVjdDtcbiAgICAgICAgdmFyIHdhdmVFZmZlY3RCdXR0b24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKHdhdmVFZmZlY3RCdXR0b24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiB3YXZlRWZmZWN0QnV0dG9uKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3RCdXR0b247XG4gICAgICAgIH0od2F2ZUVmZmVjdCkpO1xuICAgICAgICBDb21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24gPSB3YXZlRWZmZWN0QnV0dG9uO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcpLmRpcmVjdGl2ZSgnY0J1dHRvbicsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24uZmFjdG9yeSgpKTtcbi8qKlxuICogU2VsZWN0IFJlc2l6ZVxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxuICovXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgb25SZXNpemU6ICcmc2VsZWN0UmVzaXplJyxcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVzaXplSW5wdXQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICB2YXIgYXJyb3dXaWR0aCA9IDI0O1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XS50ZXh0O1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aDtcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRfMS5hcHBlbmQodGVzdEVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gc2NvcGUucmVzaXplRGVmYXVsdCB8fCAxNTA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSAod2lkdGggKyBhcnJvd1dpZHRoKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25SZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cbnZhciB0aHJlYWQ7XG4oZnVuY3Rpb24gKHRocmVhZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxuICAgICAgICAndGhyZWFkLm1lbnUnLFxuICAgICAgICAndGhyZWFkLnRhYicsXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxuICAgICAgICAndGhyZWFkLmRpYWxvZydcbiAgICBdKTtcbn0pKHRocmVhZCB8fCAodGhyZWFkID0ge30pKTtcbiIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pOyIsIlxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Njb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICAgICAgb3BlbjogRnVuY3Rpb247XG4gICAgICAgIGNsb3NlOiBGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nQ29udHJvbGxlciB7XG4gICAgICAgIGRlZmVyQ2FsbGJhY2sgOiBuZy5JRGVmZXJyZWQ7XG4gICAgICAgIGNhbmNlbGxlZDogYm9vbGVhbjtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge31cblxuICAgICAgICAkb25Jbml0KCkge31cblxuICAgICAgICBjbG9zZShyZXNwb25zZT8gOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGlmKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW4oZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuICAgICAgICAgICAgaWYoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRvbkRlc3Ryb3koKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCAoKSA9PiB7XG4gICByZXR1cm4ge1xuICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIsXG4gICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcbiAgIH07XG59KTsiLCJtb2R1bGUgVGhyZWFkLlNlcnZpY2VzIHtcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nU2VydmljZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICAgICAgcHJpdmF0ZSAkcTogbmcuSVFTZXJ2aWNlLFxuICAgICAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBuZy5JUm9vdFNjb3BlU2VydmljZSxcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IG5nLklDb21waWxlU2VydmljZVxuICAgICAgICApIHt9XG5cbiAgICAgICAgb3BlbihvcHRpb25zKSA6IG5nLklQcm9taXNlIHtcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA6IG5nLklEZWZlcnJlZDtcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG5cbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55KSB7XG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG5cbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZHluYW1pYyBiYWNrZ3JvdW5kIGVuZCEgUGxlYXNlIGFkZCB0aGUgYXR0cmlidXRlIFwiZHluYW1pYy1iYWNrZ3JvdW5kLWVuZFwiIHRvIGEgY2hpbGQgZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBvcHRpb25hbEhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTsiLCIvKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICBsZXQgbmdNb2RlbEN0cmwgOiBuZy5JTmdNb2RlbENvbnRyb2xsZXIgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcblxuICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZihuZ01vZGVsQ3RybCkge1xuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignZm9jdXMnKTtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJykuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcbiAgICB9XG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XG4gICAgICAgIGhpZGVSZXF1aXJlOiBhbnlcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuaW5wdXRSZXF1aXJlJywgW10pLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogVGhyZWFkLkNvbXBvbmVudHMuSW5wdXRSZXF1aXJlQXR0cmlidXRlcykge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgY2xhc3MgTWVudSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICBzY29wZSA9IHt9O1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVzdHJpY3QgPSAnRSc7XG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xuICAgICAgICBjb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICB0ZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYy1tZW51IGpzLW1lbnVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbiAgICAgICAgbWVudUNvbnRlbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xuICAgICAgICBiYWNrZHJvcCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7fVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnRyb2xsZXIoJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgb25Cb2R5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXG4gICAgICAgICAgICAgICAgb3BlbixcbiAgICAgICAgICAgICAgICBjbG9zZSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldFBvcyA9IG1lbnVUYXJnZXRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5yaWdodCAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUubGVmdCA9IGAke2xlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnR9cHhgO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5yaWdodCA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoeVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnlQb3MgPSB5UG9zaXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVUb0JvZHkoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5tZW51Q29udGVudCk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIGxldCBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IE1lbnUoJHRpbWVvdXQpO1xuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVUYXJnZXQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gYDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcIlxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJG1lbnUub3BlbigpXCI+PC9idXR0b24+YDtcblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICAoPGFueT5zY29wZSkuJG1lbnUgPSBjdHJsO1xuICAgICAgICB9O1xuXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVUYXJnZXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51Q29udGVudCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcbiAgICAgICAgdGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51Q29udGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVJdGVtIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcbiAgICAgICAgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUl0ZW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubGV0IG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudS5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVJdGVtJywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUl0ZW0uZmFjdG9yeSgpKTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXN0cmljdCA9ICdBJztcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcykgPT4ge1xuICAgICAgICAgICAgbGV0IGxhc3RTY3JvbGwgPSAwO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuXG4gICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgZG93blxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIHVwXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKTogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gKCR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSA9PiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdyddO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpKTsiLCIvKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG5cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFByb2Rpc0NvbnRyb2xsZXIge1xuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xuICAgICAgICBzZWN0aW9uczogYW55W107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlU2VjdGlvbnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcbiAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlclNlY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTZWN0aW9uSGVpZ2h0KHNlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXJcbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+YCxcbiAgICAgICAgcmVxdWlyZTogJ15wcm9kaXMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xuICAgICAgICAgICAgdGhpcy5pZCA9ICRwYXJlbnQucmVnaXN0ZXJTZWN0aW9uKCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXNfX3NlY3Rpb24nKSwgJGF0dHJzLm5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pc0NvbXBsZXRlID0gISEkYXR0cnMuaXNDb21wbGV0ZTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIvKipcbiAqIFRhYiBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHN3aXRjaGluZyBiZXR3ZWVuXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA4LzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBpbnRlcmZhY2UgVGFicyB7XG4gICAgICAgIGxhc3RUYWI6IG51bWJlcjtcbiAgICAgICAgYWN0aXZlVGFiOiBudW1iZXI7XG4gICAgICAgIHRhYnM6IEFycmF5PE9iamVjdD47XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBUYWJUaXRsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICAgICAgJHRhYnM6IFRhYnNDb250cm9sbGVyO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBUYWJzQ29udHJvbGxlciBpbXBsZW1lbnRzIFRhYnN7XG4gICAgICAgIGFjdGl2ZVRhYiA9IDE7XG4gICAgICAgIHRhYnMgPSBbXTtcbiAgICAgICAgbGFzdFRhYiA9IC0xO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsIHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICAkb25Jbml0KCkge1xuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+ICg8YW55PnRoaXMpLmN1cnJlbnRUYWIsIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZihuZXdWYWx1ZSAmJiBuZXdWYWx1ZSA9PT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc2l6ZVRhYnMoKSB7XG4gICAgICAgICAgICBsZXQgd2lkdGg6IE51bWJlciA9IDE2O1xuXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHRhYkhlYWRlciA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xuICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkVGFiKGhlYWRlciA6IG5nLklBdWdtZW50ZWRKUXVlcnksIGJvZHkgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICAgICAgICBsZXQgaWR4IDogbnVtYmVyID0gdGhpcy50YWJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XG5cbiAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG5cbiAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhbmdlVGFiKGV2ZW50OiBKUXVlcnlFdmVudE9iamVjdCwgaW5kZXg6IG51bWJlcikge1xuICAgICAgICAgICAgaWYoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlVGFicygpIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQgOiBOdW1iZXI7XG4gICAgICAgICAgICBsZXQgY29udGVudCA6IEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IGkgKyAxO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcblxuICAgICAgICAgICAgICAgIGlmKGlkeCA9PT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkeCA8IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGFiKGlkeDogbnVtYmVyKSB7XG4gICAgICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmhlYWRlci5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJywgW10pLmRpcmVjdGl2ZSgndGRUYWJzJywgKCRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy10YWJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlciBqcy10YWJfX2hlYWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXIsXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBsaW5rKHNjb3BlOm5nLklTY29wZSwgZWxlbWVudDpuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczpuZy5JQXR0cmlidXRlcywgY3RybDphbnkpIHtcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcbiAgICAgICAgICAgIGxldCBib2R5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fYm9keScpKTtcblxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5gLFxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjLXRhYl9fYm9keSBqcy10YWJfX2JvZHlcIiBuZy10cmFuc2NsdWRlPjwvZGl2PidcbiAgICB9O1xufSk7IiwiLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXN0cmljdCA9ICdBJztcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcbiAgICAgICAgICAgIGxldCByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgIGxldCBpc0ZhYiA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XG4gICAgICAgICAgICAgICAgbGV0IGhlaWdodDtcblxuICAgICAgICAgICAgICAgIHdhdmVFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4gY2xhc3M9XCJ3YXZlLWVmZmVjdFwiPjwvc3Bhbj4nKTtcblxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcbiAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAvL2NpcmNsZSwgaGVpZ2h0IG11c3QgbWF0Y2ggdGhlIHdpZHRoXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub24oJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSBgJHtwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZih3YXZlRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpO1xuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xuICAgICAgICByZXN0cmljdCA9ICdDJztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKSk7XG5cbiIsIi8qKlxuICogU2VsZWN0IFJlc2l6ZVxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxuICovXG5cbmludGVyZmFjZSBzZWxlY3RSZXNpemVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcbiAgICBvblJlc2l6ZTogRnVuY3Rpb247XG4gICAgcGFyZW50OiBzdHJpbmc7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgb25SZXNpemU6ICcmc2VsZWN0UmVzaXplJyxcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJyxcbiAgICAgICAgfSxcbiAgICAgICAgbGluayhzY29wZTogc2VsZWN0UmVzaXplU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWwgOiBIVE1MU2VsZWN0RWxlbWVudCA9IDxIVE1MU2VsZWN0RWxlbWVudD5lbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgIGxldCBhcnJvd1dpZHRoID0gMjQ7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XG4gICAgICAgICAgICAgICAgbGV0IHdpZHRoO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlc3RFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+JykuaHRtbCh0ZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmFwcGVuZCh0ZXN0RWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aCArIGFycm93V2lkdGh9cHhgO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLm9uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxuXG5tb2R1bGUgdGhyZWFkIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxuICAgICAgICAndGhyZWFkLm1lbnUnLFxuICAgICAgICAndGhyZWFkLnRhYicsXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxuICAgICAgICAndGhyZWFkLmRpYWxvZydcbiAgICBdKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

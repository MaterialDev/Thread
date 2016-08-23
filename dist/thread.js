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
angular.module('thread.dynamicBackground', []).directive('dynamicBackground', function ($window, $interval) {
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
});
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
angular.module('thread.floatingLabel', []).directive('floatingLabel', function ($timeout) {
    return {
        restrict: 'A',
        link: floatingLabelLink($timeout)
    };
});
angular.module('thread.floatingLabel').directive('cInput', function ($timeout) {
    return {
        restrict: 'C',
        link: floatingLabelLink($timeout)
    };
});
angular.module('thread.inputRequire', []).directive('cInput', function ($timeout) {
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
});
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
                        this.menuContent[0].style.left = left + "px";
                        this.menuContent[0].style.top = top_1 + "px";
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
        controller: function ($scope, $element, $attrs) {
            var $parent = $scope.$prodis;
            this.id = $parent.registerSection($element[0].querySelector('.js-prodis__section'), $attrs.name);
            this.isComplete = !!$attrs.isComplete;
        }
    };
});
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
 * Select Resize
 * Automatically resizes select elements to fit the text exactly
 * @author Zach Barnes
 * @created 07/19/2016
 */
angular.module('thread.selectResize', []).directive('selectResizeParent', function () {
    return {
        bindToController: true,
        controller: function ($element) {
            this.getElement = getElement;
            function getElement() {
                return $element;
            }
        }
    };
});
angular.module('thread.selectResize').directive('selectResize', function ($timeout) {
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
                var arrowWidth = 32;
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
angular.module('thread.tab', []).directive('tdTabs', function ($interval) {
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
});
angular.module('thread.tab').directive('tdTab', function ($timeout) {
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
});
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
                        waveEl.remove();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdFJlc2l6ZS9zZWxlY3RSZXNpemUuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy90YWIvdGFiLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvd2F2ZUVmZmVjdC93YXZlRWZmZWN0LmRpcmVjdGl2ZS50cyIsImFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FDQ3BDLElBQU8sTUFBTSxDQTBDWjtBQTFDRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0EwQ3ZCO0lBMUNhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFNdEI7WUFJSSwwQkFBb0IsUUFBOEI7Z0JBQTlCLGFBQVEsR0FBUixRQUFRLENBQXNCO1lBQUcsQ0FBQztZQUV0RCxrQ0FBTyxHQUFQLGNBQVcsQ0FBQztZQUVaLGdDQUFLLEdBQUwsVUFBTSxRQUFlO2dCQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEMsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO1lBQ0wsQ0FBQztZQUVELGlDQUFNLEdBQU47Z0JBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixDQUFDO1lBRUQsK0JBQUksR0FBSixVQUFLLFFBQVE7Z0JBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7Z0JBRXhDLEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ1YsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7Z0JBQ2xDLENBQUM7WUFDTCxDQUFDO1lBRUQscUNBQVUsR0FBVjtnQkFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLENBQUM7WUFDTCx1QkFBQztRQUFELENBbkNBLEFBbUNDLElBQUE7UUFuQ1ksMkJBQWdCLG1CQW1DNUIsQ0FBQTtJQUNMLENBQUMsRUExQ2EsVUFBVSxHQUFWLGlCQUFVLEtBQVYsaUJBQVUsUUEwQ3ZCO0FBQUQsQ0FBQyxFQTFDTSxNQUFNLEtBQU4sTUFBTSxRQTBDWjtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRTtJQUNuRCxNQUFNLENBQUM7UUFDSCxLQUFLLEVBQUUsSUFBSTtRQUNYLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQjtRQUM5QyxZQUFZLEVBQUUsU0FBUztLQUMxQixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUNuREgsSUFBTyxNQUFNLENBK0JaO0FBL0JELFdBQU8sTUFBTTtJQUFDLElBQUEsUUFBUSxDQStCckI7SUEvQmEsV0FBQSxRQUFRLEVBQUMsQ0FBQztRQUNwQjtZQUNJLHVCQUNZLEVBQWdCLEVBQ2hCLFVBQWdDLEVBQ2hDLFFBQTRCO2dCQUY1QixPQUFFLEdBQUYsRUFBRSxDQUFjO2dCQUNoQixlQUFVLEdBQVYsVUFBVSxDQUFzQjtnQkFDaEMsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFDckMsQ0FBQztZQUVKLDRCQUFJLEdBQUosVUFBSyxPQUFPO2dCQUNSLElBQUksUUFBdUIsQ0FBQztnQkFDNUIsSUFBSSxhQUFtQyxDQUFDO2dCQUN4QyxJQUFJLFdBQTJDLENBQUM7Z0JBRWhELFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUUzQixhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnRUFFZCxPQUFPLENBQUMsTUFBTSwyQ0FDWixPQUFPLENBQUMsUUFBUSxvREFFbkMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0QsV0FBVyxHQUFrQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRTFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNCLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzVCLENBQUM7WUFDTCxvQkFBQztRQUFELENBN0JBLEFBNkJDLElBQUE7UUE3Qlksc0JBQWEsZ0JBNkJ6QixDQUFBO0lBQ0wsQ0FBQyxFQS9CYSxRQUFRLEdBQVIsZUFBUSxLQUFSLGVBQVEsUUErQnJCO0FBQUQsQ0FBQyxFQS9CTSxNQUFNLEtBQU4sTUFBTSxRQStCWjtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FDakNsRixPQUFPLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLE9BQTBCLEVBQUUsU0FBOEI7SUFDckksTUFBTSxDQUFDO1FBQ0gsSUFBSSxZQUFDLEtBQWdCLEVBQUUsT0FBNEIsRUFBRSxLQUFVO1lBQzNELElBQUksWUFBWSxHQUF5QixPQUFPLENBQUMsT0FBTyxDQUFDLDREQUE0RCxDQUFDLENBQUM7WUFDdkgsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQU0sZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBSSxDQUFDO1lBQ2xHLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFOUI7OztlQUdHO1lBQ0gsRUFBRSxDQUFBLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsUUFBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUM3QixZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFJLENBQUM7Z0JBQ3RHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksb0JBQWtCLEdBQUcsU0FBUyxDQUFDO29CQUMvQixFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ3BDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQUksQ0FBQzt3QkFDbEcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBa0IsQ0FBQyxDQUFDO29CQUN6QyxDQUFDO2dCQUNMLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNYLENBQUM7WUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQUksQ0FBQztZQUN0RyxDQUFDLENBQUMsQ0FBQztZQUVILHlCQUF5QixPQUE0QixFQUFFLGNBQXNCO2dCQUN6RSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUM7Z0JBRWxFLEVBQUUsQ0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLGlHQUFpRyxDQUFDLENBQUM7Z0JBQ3ZILENBQUM7Z0JBRUQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRWhELEVBQUUsQ0FBQSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztnQkFDckUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7Z0JBQ3pELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELGdCQUFnQixFQUFFLElBQUk7UUFDdEIsWUFBWSxFQUFFLGlCQUFpQjtLQUNsQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUMvQ0g7Ozs7O0dBS0c7QUFDSCwyQkFBMkIsUUFBUTtJQUMvQixNQUFNLENBQUMsNEJBQTRCLEtBQWdCLEVBQUUsT0FBNEIsRUFBRSxLQUFxQixFQUFFLElBQTJCO1FBQ2pJLEVBQUUsQ0FBQyxDQUFPLEtBQU0sQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsUUFBUSxDQUFDO1lBQ0wsSUFBSSxVQUFVLEdBQXlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxXQUFXLEdBQTJCLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0UsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO2dCQUNuQixPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDN0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtnQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztZQUVILFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO2dCQUNsQixPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFBLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDYixXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUs7b0JBQ3ZDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDOUUsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQTtBQUNMLENBQUM7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsVUFBQyxRQUFRO0lBQzNFLE1BQU0sQ0FBQztRQUNILFFBQVEsRUFBRSxHQUFHO1FBQ2IsSUFBSSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztLQUNwQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFDLFFBQVE7SUFDaEUsTUFBTSxDQUFDO1FBQ0gsUUFBUSxFQUFFLEdBQUc7UUFDYixJQUFJLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0tBQ3BDLENBQUE7QUFDTCxDQUFDLENBQUMsQ0FBQztBQ2xESCxPQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsVUFBQyxRQUFRO0lBQ25FLE1BQU0sQ0FBQztRQUNILFFBQVEsRUFBRSxHQUFHO1FBQ2IsSUFBSSxZQUFDLEtBQWdCLEVBQUUsT0FBNEIsRUFBRSxLQUErQztZQUNoRyxRQUFRLENBQUM7Z0JBQ0wsSUFBSSxVQUFVLEdBQXlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzVELE1BQU0sQ0FBQztnQkFDWCxDQUFDO2dCQUdELE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFFL0QsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7b0JBQ25CLE9BQU8sQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FDMUJIOzs7OztHQUtHO0FBQ0gsSUFBTyxNQUFNLENBOExaO0FBOUxELFdBQU8sTUFBTTtJQUFDLElBQUEsVUFBVSxDQThMdkI7SUE5TGEsV0FBQSxVQUFVLEVBQUMsQ0FBQztRQUN0QjtZQWNJLGNBQW9CLFFBQTRCO2dCQWRwRCxpQkFpSkM7Z0JBbkl1QixhQUFRLEdBQVIsUUFBUSxDQUFvQjtnQkFiaEQsVUFBSyxHQUFHLEVBQUUsQ0FBQztnQkFDWCxlQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixhQUFRLEdBQUcsR0FBRyxDQUFDO2dCQUNmLHFCQUFnQixHQUFHLElBQUksQ0FBQztnQkFDeEIsaUJBQVksR0FBRyxPQUFPLENBQUM7Z0JBQ3ZCLGFBQVEsR0FBRyx1TUFHUSxDQUFDO2dCQU9wQixTQUFJLEdBQUcsVUFBQyxLQUFnQixFQUFFLE9BQTRCLEVBQUUsS0FBVSxFQUFFLElBQVM7b0JBQ3pFLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztvQkFDbEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO29CQUVoRixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsNEJBQTBCLEtBQUssQ0FBQyxLQUFPLENBQUMsQ0FBQTtvQkFDckUsQ0FBQztvQkFFRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUN0QixDQUFDO29CQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9DLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3BDLENBQUM7b0JBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO3dCQUN0QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2pCLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTt3QkFDaEYsS0FBSSxDQUFDLFFBQVEsQ0FBQyxjQUFNLE9BQUEsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFaLENBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDM0MsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO1lBNUJpRCxDQUFDO1lBOEJwRCx5QkFBVSxHQUFWLFVBQVcsTUFBaUIsRUFBRSxRQUE2QjtnQkFBM0QsaUJBOEZDO2dCQTdGRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtvQkFDakIsTUFBTSxFQUFFLEtBQUs7b0JBQ2IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsTUFBQSxJQUFJO29CQUNKLE9BQUEsS0FBSztvQkFDTCxhQUFBLFdBQVc7b0JBQ1gsWUFBQSxVQUFVO2lCQUNiLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRTtvQkFDbkIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDdkIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDMUIsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ3JCLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixDQUFDLENBQUMsQ0FBQztnQkFFSDtvQkFDSSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO29CQUVoRixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzNFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2QsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBQ3RELElBQUksSUFBSSxTQUFBLENBQUM7d0JBQ1QsSUFBSSxLQUFHLENBQUM7d0JBRVIsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2hCLEtBQUssT0FBTztnQ0FDUixJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQ0FDMUQsS0FBSyxDQUFDOzRCQUNWLEtBQUssTUFBTTtnQ0FDUCxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztnQ0FDdEIsS0FBSyxDQUFDO3dCQUVkLENBQUM7d0JBRUQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2hCLEtBQUssS0FBSztnQ0FDTixLQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQ0FDcEIsS0FBSyxDQUFDOzRCQUNWLEtBQUssUUFBUTtnQ0FDVCxLQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQ0FDMUQsS0FBSyxDQUFDO3dCQUVkLENBQUM7d0JBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFNLElBQUksT0FBSSxDQUFDO3dCQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQU0sS0FBRyxPQUFJLENBQUM7d0JBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7d0JBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7b0JBQ2pELENBQUM7Z0JBQ0wsQ0FBQztnQkFFRDtvQkFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlFLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekMsQ0FBQztnQkFFRCxxQkFBcUIsU0FBUyxFQUFFLFNBQVM7b0JBQ3JDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLEtBQUssS0FBSzs0QkFDTixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUNsRCxLQUFLLENBQUM7d0JBQ1YsS0FBSyxRQUFROzRCQUNULElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7NEJBQ3JELEtBQUssQ0FBQztvQkFFZCxDQUFDO29CQUVELE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLEtBQUssTUFBTTs0QkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOzRCQUNuRCxLQUFLLENBQUM7d0JBQ1YsS0FBSyxPQUFPOzRCQUNSLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUM7NEJBQ3BELEtBQUssQ0FBQztvQkFFZCxDQUFDO29CQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO29CQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRDtvQkFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztvQkFDdkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDekUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztZQUNMLENBQUM7WUFFTSxZQUFPLEdBQWQ7Z0JBQ0ksSUFBSSxTQUFTLEdBQUcsVUFBQyxRQUE0QixJQUFLLE9BQUEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQWxCLENBQWtCLENBQUM7Z0JBQ3JFLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNyQixDQUFDO1lBQ0wsV0FBQztRQUFELENBakpBLEFBaUpDLElBQUE7UUFqSlksZUFBSSxPQWlKaEIsQ0FBQTtRQUVEO1lBQUE7Z0JBQ0ksWUFBTyxHQUFHLFNBQVMsQ0FBQztnQkFDcEIsZUFBVSxHQUFHLElBQUksQ0FBQztnQkFDbEIsWUFBTyxHQUFHLElBQUksQ0FBQztnQkFDZixVQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLGFBQVEsR0FBRyw0S0FHbUMsQ0FBQztnQkFFL0MsU0FBSSxHQUFHLFVBQUMsS0FBZ0IsRUFBRSxPQUE0QixFQUFFLEtBQXFCLEVBQUUsSUFBUztvQkFDOUUsS0FBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQzlCLENBQUMsQ0FBQztZQUtOLENBQUM7WUFIVSxrQkFBTyxHQUFkO2dCQUNJLE1BQU0sQ0FBQyxjQUFNLE9BQUEsSUFBSSxVQUFVLEVBQUUsRUFBaEIsQ0FBZ0IsQ0FBQztZQUNsQyxDQUFDO1lBQ0wsaUJBQUM7UUFBRCxDQWpCQSxBQWlCQyxJQUFBO1FBakJZLHFCQUFVLGFBaUJ0QixDQUFBO1FBRUQ7WUFBQTtnQkFDSSxZQUFPLEdBQUcsU0FBUyxDQUFDO2dCQUNwQixlQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixZQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUNmLFVBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2IsYUFBUSxHQUFHLGtFQUFrRSxDQUFDO1lBS2xGLENBQUM7WUFIVSxtQkFBTyxHQUFkO2dCQUNJLE1BQU0sQ0FBQyxjQUFNLE9BQUEsSUFBSSxXQUFXLEVBQUUsRUFBakIsQ0FBaUIsQ0FBQztZQUNuQyxDQUFDO1lBQ0wsa0JBQUM7UUFBRCxDQVZBLEFBVUMsSUFBQTtRQVZZLHNCQUFXLGNBVXZCLENBQUE7UUFFRDtZQUFBO2dCQUNJLFlBQU8sR0FBRyxnQkFBZ0IsQ0FBQztnQkFDM0IsZUFBVSxHQUFHLElBQUksQ0FBQztnQkFDbEIsWUFBTyxHQUFHLElBQUksQ0FBQztnQkFDZixVQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLGFBQVEsR0FBRyxrRkFBa0YsQ0FBQztZQUtsRyxDQUFDO1lBSFUsZ0JBQU8sR0FBZDtnQkFDSSxNQUFNLENBQUMsY0FBTSxPQUFBLElBQUksUUFBUSxFQUFFLEVBQWQsQ0FBYyxDQUFDO1lBQ2hDLENBQUM7WUFDTCxlQUFDO1FBQUQsQ0FWQSxBQVVDLElBQUE7UUFWWSxtQkFBUSxXQVVwQixDQUFBO0lBQ0wsQ0FBQyxFQTlMYSxVQUFVLEdBQVYsaUJBQVUsS0FBVixpQkFBVSxRQThMdkI7QUFBRCxDQUFDLEVBOUxNLE1BQU0sS0FBTixNQUFNLFFBOExaO0FBRUQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMzRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQzFNbkU7Ozs7OztHQU1HO0FBRUgsSUFBTyxNQUFNLENBK0RaO0FBL0RELFdBQU8sTUFBTTtJQUFDLElBQUEsVUFBVSxDQStEdkI7SUEvRGEsV0FBQSxVQUFVLEVBQUMsQ0FBQztRQUN0QjtZQUlJLDBCQUFvQixRQUE2QixFQUFVLFFBQTRCO2dCQUFuRSxhQUFRLEdBQVIsUUFBUSxDQUFxQjtnQkFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtnQkFDbkYsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCwrQkFBSSxHQUFKO2dCQUNJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ2hELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7WUFDTCxDQUFDO1lBRUQsK0JBQUksR0FBSixVQUFLLFdBQVc7Z0JBQ1osR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDOUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSxDQUFDO29CQUNYLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFFRCxxQ0FBVSxHQUFWO2dCQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQy9CLENBQUM7WUFFRCx5Q0FBYyxHQUFkO2dCQUNJLElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxRQUFzQixDQUFDO2dCQUUzQixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDM0MsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO2dCQUVELFFBQVEsR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3JFLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFNLE1BQU0sT0FBSSxDQUFDO1lBQzFDLENBQUM7WUFFRCwwQ0FBZSxHQUFmLFVBQWdCLE9BQU8sRUFBRSxJQUFJO2dCQUE3QixpQkFVQztnQkFURyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDZixTQUFBLE9BQU87b0JBQ1AsTUFBQSxJQUFJO2lCQUNQLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNWLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBRUQsMkNBQWdCLEdBQWhCLFVBQWlCLE9BQU87Z0JBQ3BCLElBQUksTUFBTSxHQUFXLE9BQU8sQ0FBQyxZQUFZLENBQUM7Z0JBQzFDLElBQUksS0FBSyxHQUF5QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFNUQsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNsQixDQUFDO1lBQ0wsdUJBQUM7UUFBRCxDQTdEQSxBQTZEQyxJQUFBO1FBN0RZLDJCQUFnQixtQkE2RDVCLENBQUE7SUFDTCxDQUFDLEVBL0RhLFVBQVUsR0FBVixpQkFBVSxLQUFWLGlCQUFVLFFBK0R2QjtBQUFELENBQUMsRUEvRE0sTUFBTSxLQUFOLE1BQU0sUUErRFo7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO0lBQ3BELE1BQU0sQ0FBQztRQUNILFFBQVEsRUFBRSwrSUFFUTtRQUNsQixnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsWUFBWSxFQUFFLFNBQVM7UUFDdkIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO0tBQ2pELENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtJQUN2RCxNQUFNLENBQUM7UUFDSCxRQUFRLEVBQUUsdVdBSThCO1FBQ3hDLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFlBQVksRUFBRSxnQkFBZ0I7UUFDOUIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixnQkFBZ0I7UUFDaEIsS0FBSyxFQUFFLElBQUk7UUFDWCxVQUFVLFlBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNO1lBQy9CLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDN0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUMxQyxDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FDekdILElBQU8sTUFBTSxDQStCWjtBQS9CRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0ErQnZCO0lBL0JhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFDdEI7WUFHSSx3QkFBb0IsT0FBMEI7Z0JBSGxELGlCQTZCQztnQkExQnVCLFlBQU8sR0FBUCxPQUFPLENBQW1CO2dCQUY5QyxhQUFRLEdBQUcsR0FBRyxDQUFDO2dCQUtmLFNBQUksR0FBRyxVQUFDLEtBQWdCLEVBQUUsT0FBNEIsRUFBRSxLQUFxQjtvQkFDekUsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO29CQUVuQixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQzt3QkFFdEQsZ0JBQWdCO3dCQUNoQixFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBQ2pDLFVBQVUsR0FBRyxNQUFNLENBQUM7d0JBRXhCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs0QkFDcEMsVUFBVSxHQUFHLE1BQU0sQ0FBQzt3QkFDeEIsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7WUFsQkYsQ0FBQztZQW9CTSxzQkFBTyxHQUFkO2dCQUNJLElBQU0sU0FBUyxHQUFHLFVBQUMsT0FBMEIsSUFBSyxPQUFBLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUEzQixDQUEyQixDQUFDO2dCQUM5RSxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDckIsQ0FBQztZQUNMLHFCQUFDO1FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtRQTdCWSx5QkFBYyxpQkE2QjFCLENBQUE7SUFDTCxDQUFDLEVBL0JhLFVBQVUsR0FBVixpQkFBVSxLQUFWLGlCQUFVLFFBK0J2QjtBQUFELENBQUMsRUEvQk0sTUFBTSxLQUFOLE1BQU0sUUErQlo7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FDakNwSDs7Ozs7R0FLRztBQVFILE9BQU8sQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFO0lBQ3RFLE1BQU0sQ0FBQztRQUNILGdCQUFnQixFQUFFLElBQUk7UUFDdEIsVUFBVSxZQUFDLFFBQTZCO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRTdCO2dCQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7S0FDSixDQUFBO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxVQUFDLFFBQVE7SUFDckUsTUFBTSxDQUFDO1FBQ0gsT0FBTyxFQUFFLHNCQUFzQjtRQUMvQixLQUFLLEVBQUU7WUFDSCxRQUFRLEVBQUUsZUFBZTtZQUN6QixhQUFhLEVBQUUsR0FBRztTQUNyQjtRQUNELElBQUksWUFBQyxLQUF3QixFQUFFLE9BQTRCLEVBQUUsS0FBcUIsRUFBRSxJQUFTO1lBQ3pGLFFBQVEsQ0FBQztnQkFDTCxXQUFXLEVBQUUsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsV0FBVyxFQUFFLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7WUFFSDtnQkFDSSxJQUFJLEVBQUUsR0FBMEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksSUFBSSxHQUF1QixFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xFLElBQUksS0FBSyxDQUFDO2dCQUVWLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1AsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRWxELElBQUksUUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN6RCxRQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUV0QixLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDOUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNoQixNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUVsQixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUcsQ0FBQztnQkFDdkMsQ0FBQztnQkFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFHLEtBQUssR0FBRyxVQUFVLFFBQUksQ0FBQztnQkFFbkQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDckIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FDckVIOzs7Ozs7R0FNRztBQUNILElBQU8sTUFBTSxDQWlIWjtBQWpIRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0FpSHZCO0lBakhhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFXdEI7WUFLSSx3QkFBb0IsTUFBaUIsRUFBVSxRQUE2QixFQUFVLFFBQTRCO2dCQUE5RixXQUFNLEdBQU4sTUFBTSxDQUFXO2dCQUFVLGFBQVEsR0FBUixRQUFRLENBQXFCO2dCQUFVLGFBQVEsR0FBUixRQUFRLENBQW9CO2dCQUpsSCxjQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLFNBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1YsWUFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBSWIsQ0FBQztZQUVELGdDQUFPLEdBQVA7Z0JBQUEsaUJBU0M7Z0JBUkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBTSxPQUFNLEtBQUssQ0FBQyxVQUFVLEVBQXRCLENBQXNCLEVBQUUsVUFBQyxRQUFRLEVBQUUsUUFBUTtvQkFDaEUsRUFBRSxDQUFBLENBQUMsUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUM3QixLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQzt3QkFDM0IsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUM3QixDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNYLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUMxQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUVELG1DQUFVLEdBQVY7Z0JBQ0ksSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFDO2dCQUV2QixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3ZDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBQ2hELENBQUM7Z0JBRUQsSUFBSSxTQUFTLEdBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQy9FLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFNLEtBQUssT0FBSSxDQUFDO1lBQ3pDLENBQUM7WUFFRCwrQkFBTSxHQUFOLFVBQU8sTUFBNEIsRUFBRSxJQUEwQjtnQkFDM0QsSUFBSSxHQUFHLEdBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQzlCLE1BQU0sRUFBRSxNQUFNO29CQUNkLElBQUksRUFBRSxJQUFJO2lCQUNiLENBQUMsQ0FBQztnQkFFSCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxGLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFL0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO2dCQUVsQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFFbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLENBQUM7WUFFRCxrQ0FBUyxHQUFULFVBQVUsS0FBd0IsRUFBRSxLQUFhO2dCQUM3QyxFQUFFLENBQUEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDZixLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7Z0JBRUQsRUFBRSxDQUFBLENBQUMsS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDdkIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixDQUFDO1lBQ0wsQ0FBQztZQUVELG1DQUFVLEdBQVY7Z0JBQ0ksSUFBSSxNQUFlLENBQUM7Z0JBQ3BCLElBQUksT0FBcUIsQ0FBQztnQkFDMUIsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztvQkFDNUQsT0FBTyxHQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUMxRSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxNQUFNLE9BQUksQ0FBQztvQkFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsMkNBQTJDLENBQUM7Z0JBQzNFLENBQUM7Z0JBRUQsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUVoQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVqQixFQUFFLENBQUEsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUM1QyxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMxQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUMzQyxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUM5QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ1osQ0FBQztZQUNMLENBQUM7WUFFRCxpQ0FBUSxHQUFSLFVBQVMsR0FBVztnQkFDRixRQUFRLENBQUMsYUFBYyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDbEUsQ0FBQztZQUNMLHFCQUFDO1FBQUQsQ0FyR0EsQUFxR0MsSUFBQTtRQXJHWSx5QkFBYyxpQkFxRzFCLENBQUE7SUFDTCxDQUFDLEVBakhhLFVBQVUsR0FBVixpQkFBVSxLQUFWLGlCQUFVLFFBaUh2QjtBQUFELENBQUMsRUFqSE0sTUFBTSxLQUFOLE1BQU0sUUFpSFo7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQUMsU0FBOEI7SUFDaEYsTUFBTSxDQUFDO1FBQ0gsS0FBSyxFQUFFO1lBQ0gsVUFBVSxFQUFFLEdBQUc7U0FDbEI7UUFDRCxRQUFRLEVBQUUsR0FBRztRQUNiLFFBQVEsRUFBRSxrYUFPUztRQUNuQixPQUFPLEVBQUUsSUFBSTtRQUNiLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsWUFBWSxFQUFFLE9BQU87UUFDckIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYztRQUM1QyxJQUFJLEVBQUUsVUFBQyxLQUFnQixFQUFFLE9BQTRCLEVBQUUsS0FBcUIsRUFBRSxJQUFTO1lBQ25GOzs7ZUFHRztZQUNILEVBQUUsQ0FBQSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNmLFFBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDN0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLG9CQUFrQixHQUFHLFNBQVMsQ0FBQztvQkFDL0IsRUFBRSxDQUFBLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNwQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ2xCLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQWtCLENBQUMsQ0FBQztvQkFDekMsQ0FBQztnQkFDTCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDWCxDQUFDO1FBQ0wsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFDLFFBQTRCO0lBQ3pFLE1BQU0sQ0FBQztRQUNILFFBQVEsRUFBRSxHQUFHO1FBQ2IsT0FBTyxFQUFFLFNBQVM7UUFDbEIsS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLFlBQUMsS0FBZSxFQUFFLE9BQTJCLEVBQUUsS0FBb0IsRUFBRSxJQUFRO1lBQzdFLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdEUsUUFBUSxDQUFDO2dCQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRTtJQUNqRCxNQUFNLENBQUM7UUFDSCxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxnTUFFaUM7UUFDM0MsSUFBSSxZQUFDLEtBQXNDLEVBQUUsT0FBNEIsRUFBRSxLQUFxQixFQUFFLElBQVM7WUFDdkcsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdkIsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtJQUNoRCxNQUFNLENBQUM7UUFDSCxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSw0REFBNEQ7S0FDekUsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FDdk1IOzs7Ozs7R0FNRztBQUNILElBQU8sTUFBTSxDQTBIWjtBQTFIRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0EwSHZCO0lBMUhhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFDdEI7WUFHSSxvQkFBb0IsUUFBNEI7Z0JBSHBELGlCQThHQztnQkEzR3VCLGFBQVEsR0FBUixRQUFRLENBQW9CO2dCQUZoRCxhQUFRLEdBQUcsR0FBRyxDQUFDO2dCQU1mLFNBQUksR0FBRyxVQUFDLEtBQWdCLEVBQUUsT0FBNEIsRUFBRSxLQUFxQixFQUFFLElBQVM7b0JBQ3BGLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxNQUFNLENBQUM7b0JBQ1gsQ0FBQztvQkFFRCxJQUFJLE1BQU0sQ0FBQztvQkFDWCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDbEIsSUFBSSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7b0JBQ2xDLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO29CQUUvQixLQUFJLENBQUMsUUFBUSxDQUFDO3dCQUNWLElBQUksS0FBSyxDQUFDO3dCQUNWLElBQUksTUFBTSxDQUFDO3dCQUVYLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7d0JBRTlELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDOzRCQUNqQyxPQUFPLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDOzRCQUN0QyxPQUFPLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBQ3BDLEtBQUssR0FBRyxJQUFJLENBQUM7d0JBQ2pCLENBQUM7d0JBRUQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDUixxQ0FBcUM7NEJBQ3JDLEtBQUssR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDOzRCQUMvQixNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQzt3QkFDcEMsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDL0MsQ0FBQzt3QkFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBTSxLQUFLLE9BQUksQ0FBQzt3QkFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQU0sTUFBTSxPQUFJLENBQUM7d0JBRXZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBRXpFLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQzt3QkFDdEIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDaEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dDQUNULElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQ0FDOUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dDQUVqRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksUUFBSSxDQUFDO2dDQUN4RCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsUUFBSSxDQUFDOzRCQUN6RCxDQUFDOzRCQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBRTdCLG1CQUFtQixHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUM7Z0NBQ2hDLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztvQ0FDeEIscUJBQXFCLEdBQUcsS0FBSyxDQUFDO29DQUM5QixNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dDQUNwQyxDQUFDO2dDQUNELG1CQUFtQixHQUFHLElBQUksQ0FBQzs0QkFDL0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUNaLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7d0JBRWhCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO3dCQUV6QixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNqQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDdEIsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRTt3QkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQztvQkFFSDt3QkFDSSxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7NEJBQ3RCLHFCQUFxQixHQUFHLElBQUksQ0FBQzt3QkFDakMsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNwQyxDQUFDO3dCQUNELFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQztvQkFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRTt3QkFDbEIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNoQixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUM5RSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7WUFqR0YsQ0FBQztZQW1HTSxrQkFBTyxHQUFkO2dCQUNJLElBQUksU0FBUyxHQUFHLFVBQUMsUUFBNEIsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQTFDLENBQTBDLENBQUM7Z0JBQzdGLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNyQixDQUFDO1lBRUwsaUJBQUM7UUFBRCxDQTlHQSxBQThHQyxJQUFBO1FBOUdZLHFCQUFVLGFBOEd0QixDQUFBO1FBRUQ7WUFBc0Msb0NBQVU7WUFBaEQ7Z0JBQXNDLDhCQUFVO2dCQUM1QyxhQUFRLEdBQUcsR0FBRyxDQUFDO1lBT25CLENBQUM7WUFMVSx3QkFBTyxHQUFkO2dCQUNJLElBQUksU0FBUyxHQUFHLFVBQUMsUUFBNEIsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBaEQsQ0FBZ0QsQ0FBQztnQkFDbkcsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFDTCx1QkFBQztRQUFELENBUkEsQUFRQyxDQVJxQyxVQUFVLEdBUS9DO1FBUlksMkJBQWdCLG1CQVE1QixDQUFBO0lBQ0wsQ0FBQyxFQTFIYSxVQUFVLEdBQVYsaUJBQVUsS0FBVixpQkFBVSxRQTBIdkI7QUFBRCxDQUFDLEVBMUhNLE1BQU0sS0FBTixNQUFNLFFBMEhaO0FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDeEcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FDcEl2Ryx1REFBdUQ7QUFFdkQsSUFBTyxNQUFNLENBZVo7QUFmRCxXQUFPLE1BQU0sRUFBQyxDQUFDO0lBQ1gsWUFBWSxDQUFDO0lBRWIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDckIsdUJBQXVCO1FBQ3ZCLG1CQUFtQjtRQUNuQixhQUFhO1FBQ2IsWUFBWTtRQUNaLHNCQUFzQjtRQUN0QixxQkFBcUI7UUFDckIsZUFBZTtRQUNmLHFCQUFxQjtRQUNyQiwwQkFBMEI7UUFDMUIsZUFBZTtLQUNsQixDQUFDLENBQUM7QUFDUCxDQUFDLEVBZk0sTUFBTSxLQUFOLE1BQU0sUUFlWiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xuICAgICAgICBjbG9zZTogRnVuY3Rpb247XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRyb2xsZXIge1xuICAgICAgICBkZWZlckNhbGxiYWNrIDogbmcuSURlZmVycmVkO1xuICAgICAgICBjYW5jZWxsZWQ6IGJvb2xlYW47XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHt9XG5cbiAgICAgICAgJG9uSW5pdCgpIHt9XG5cbiAgICAgICAgY2xvc2UocmVzcG9uc2U/IDogYW55KSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICBpZih0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYW5jZWwoKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBvcGVuKGRlZmVycmVkKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbiAgICAgICAgICAgIGlmKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrID0gZGVmZXJyZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkb25EZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgKCkgPT4ge1xuICAgcmV0dXJuIHtcbiAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyLFxuICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXG4gICB9O1xufSk7IiwibW9kdWxlIFRocmVhZC5TZXJ2aWNlcyB7XG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHByaXZhdGUgJHE6IG5nLklRU2VydmljZSxcbiAgICAgICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcbiAgICAgICAgKSB7fVxuXG4gICAgICAgIG9wZW4ob3B0aW9ucykgOiBuZy5JUHJvbWlzZSB7XG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQgOiBuZy5JRGVmZXJyZWQ7XG4gICAgICAgICAgICBsZXQgZGlhbG9nRWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XG4gICAgICAgICAgICBsZXQgZGlhbG9nU2NvcGUgOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQgPSB0aGlzLiRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoYFxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiJHtvcHRpb25zLnRhcmdldH1cIlxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cIiR7b3B0aW9ucy50ZW1wbGF0ZX1cIlxuICAgICAgICAgICAgICAgID48L3RkLWRpYWxvZz5cbiAgICAgICAgICAgIGApO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpYWxvZ0VsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XG4gICAgICAgICAgICBkaWFsb2dTY29wZSA9IDxUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZT5kaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xuXG4gICAgICAgICAgICBkaWFsb2dTY29wZS5vcGVuKGRlZmVycmVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSkge1xuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xuICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlYWR5Q2hlY2tJbnRlcnZhbCA9ICRpbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgb3B0aW9uYWxIZWlnaHQ6IG51bWJlcikgOiBudW1iZXIge1xuICAgICAgICAgICAgICAgIGxldCBjdXRvZmYgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1tkeW5hbWljLWJhY2tncm91bmQtZW5kXScpO1xuXG4gICAgICAgICAgICAgICAgaWYoIWN1dG9mZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmUmVjdCA9IGN1dG9mZi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgIGlmKG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyA2NDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcbiAgICB9O1xufSk7IiwiLyoqXG4gKiBGbG9hdGluZyBsYWJlbFxuICogQSBjb21wb25lbnQgdGhhdCBjb250cm9scyBsYWJlbCBpbnRlcmFjdGlvbnMgb24gaW5wdXQgZmllbGRzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XG4gKi9cbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IG5nLklOZ01vZGVsQ29udHJvbGxlcikge1xuICAgICAgICBpZiAoKDxhbnk+YXR0cnMpLm5vRmxvYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgbGV0IG5nTW9kZWxDdHJsIDogbmcuSU5nTW9kZWxDb250cm9sbGVyID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYobmdNb2RlbEN0cmwpIHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhdmFsdWUgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsIFtdKS5kaXJlY3RpdmUoJ2Zsb2F0aW5nTGFiZWwnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfVxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIElucHV0UmVxdWlyZUF0dHJpYnV0ZXMge1xuICAgICAgICBoaWRlUmVxdWlyZTogYW55XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IFRocmVhZC5Db21wb25lbnRzLklucHV0UmVxdWlyZUF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtcmVxdWlyZWQnKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcblxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIi8qKlxuICogTWVudVxuICogQSBjb21wb25lbnQgdGhhdCBzaG93cy9oaWRlcyBhIGxpc3Qgb2YgaXRlbXMgYmFzZWQgb24gdGFyZ2V0IGNsaWNrXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wNi8yMDE2XG4gKi9cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIE1lbnUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgc2NvcGUgPSB7fTtcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlc3RyaWN0ID0gJ0UnO1xuICAgICAgICBiaW5kVG9Db250cm9sbGVyID0gdHJ1ZTtcbiAgICAgICAgY29udHJvbGxlckFzID0gJyRtZW51JztcbiAgICAgICAgdGVtcGxhdGUgPSBgPGRpdiBjbGFzcz1cImMtbWVudSBqcy1tZW51XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1tZW51X19iYWNrZHJvcCBqcy1tZW51X19iYWNrZHJvcFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG4gICAgICAgIG1lbnVDb250ZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgYmFja2Ryb3AgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge31cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xuICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcblxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XG4gICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKGBjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLSR7YXR0cnMud2lkdGh9YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdtb3ZlVG9Cb2R5JykpIHtcbiAgICAgICAgICAgICAgICBjdHJsLm1vdmVUb0JvZHkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNwbGl0UG9zID0gYXR0cnMucG9zaXRpb24uc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oJ3RvcCcsICdsZWZ0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY3RybC5tZW51Q29udGVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbWVudV9faXRlbScpKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiBjdHJsLmNsb3NlKCksIDEwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb250cm9sbGVyKCRzY29wZTogbmcuSVNjb3BlLCAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgIG9wZW4sXG4gICAgICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgICAgIGxldCBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcDtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmJvdHRvbSA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHlQb3NpdGlvbiwgeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tdG9wJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tYm90dG9tJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3dpdGNoICh4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy54UG9zID0geFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5iYWNrZHJvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgTWVudSgkdGltZW91dCk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgTWVudVRhcmdldCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcbiAgICAgICAgdGVtcGxhdGUgPSBgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFwiXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkbWVudS5vcGVuKClcIj48L2J1dHRvbj5gO1xuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICg8YW55PnNjb3BlKS4kbWVudSA9IGN0cmw7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudVRhcmdldCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVDb250ZW50IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xuICAgICAgICB0ZW1wbGF0ZSA9ICc8dWwgY2xhc3M9XCJjLW1lbnVfX2NvbnRlbnQganMtbWVudV9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC91bD4nO1xuXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVDb250ZW50KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgTWVudUl0ZW0gaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51Q29udGVudCc7XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xuICAgICAgICB0ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51SXRlbSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5sZXQgbWVudSA9IGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQubWVudScsIFtdKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnUnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51VGFyZ2V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudVRhcmdldC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpOyIsIi8qKlxuICogUHJvZ3Jlc3NpdmUgRGlzY2xvc3VyZVxuICogQSBuYXR1cmFsIGxhbmd1YWdlIGNvbXBvbmVudCB0aGF0IHNob3dzIG9uZVxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNi8xNS8yMDE2XG4gKi9cblxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgY2xhc3MgUHJvZGlzQ29udHJvbGxlciB7XG4gICAgICAgIGN1cnJlbnRTZWN0aW9uOiBudW1iZXI7XG4gICAgICAgIHNlY3Rpb25zOiBhbnlbXTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgIGlmICgrK3RoaXMuY3VycmVudFNlY3Rpb24gPj0gdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGdvVG8oc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpIDwgdGhpcy5zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnZXRDdXJyZW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVTZWN0aW9ucygpIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgcHJvZGlzRWwgOiBIVE1MRWxlbWVudDtcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb2Rpc0VsID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xuICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZ2lzdGVyU2VjdGlvbihlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFNlY3Rpb25IZWlnaHQoc2VjdGlvbikge1xuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gc2VjdGlvbi5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBsZXQgc3R5bGUgOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcblxuICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnLCBbXSkuZGlyZWN0aXZlKCdwcm9kaXMnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1wcm9kaXMganMtcHJvZGlzXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlclxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlX19zZWN0aW9uIGMtcHJvZGlzX19zZWN0aW9uIGpzLXByb2Rpc19fc2VjdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLWNvbXBsZXRlJzogJHByb2Rpc1NlY3Rpb24uaXNDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIGxldCAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFNjcm9sbENvbGxhcHNlIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFzdFNjcm9sbCA9IDA7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG5cbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgdXBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpID0+IG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckd2luZG93J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCkpOyIsIi8qKlxuICogU2VsZWN0IFJlc2l6ZVxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxuICovXG5cbmludGVyZmFjZSBzZWxlY3RSZXNpemVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcbiAgICBvblJlc2l6ZTogRnVuY3Rpb247XG4gICAgcGFyZW50OiBzdHJpbmc7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgb25SZXNpemU6ICcmc2VsZWN0UmVzaXplJyxcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJyxcbiAgICAgICAgfSxcbiAgICAgICAgbGluayhzY29wZTogc2VsZWN0UmVzaXplU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWwgOiBIVE1MU2VsZWN0RWxlbWVudCA9IDxIVE1MU2VsZWN0RWxlbWVudD5lbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgIGxldCBhcnJvd1dpZHRoID0gMzI7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XG4gICAgICAgICAgICAgICAgbGV0IHdpZHRoO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlc3RFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+JykuaHRtbCh0ZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmFwcGVuZCh0ZXN0RWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aCArIGFycm93V2lkdGh9cHhgO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLm9uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIi8qKlxuICogVGFiIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3Mgc3dpdGNoaW5nIGJldHdlZW5cbiAqIHNldHMgb2YgY29udGVudCBzZXBhcmF0ZWQgaW50byBncm91cHMgYnkgdGFic1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDgvMjAxNlxuICovXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGludGVyZmFjZSBUYWJzIHtcbiAgICAgICAgbGFzdFRhYjogbnVtYmVyO1xuICAgICAgICBhY3RpdmVUYWI6IG51bWJlcjtcbiAgICAgICAgdGFiczogQXJyYXk8T2JqZWN0PjtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRhYlRpdGxlU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xuICAgICAgICAkdGFiczogVGFic0NvbnRyb2xsZXI7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFRhYnNDb250cm9sbGVyIGltcGxlbWVudHMgVGFic3tcbiAgICAgICAgYWN0aXZlVGFiID0gMTtcbiAgICAgICAgdGFicyA9IFtdO1xuICAgICAgICBsYXN0VGFiID0gLTE7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSwgcHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XG5cbiAgICAgICAgfVxuXG4gICAgICAgICRvbkluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gKDxhbnk+dGhpcykuY3VycmVudFRhYiwgKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS5hY3RpdmVUYWIgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS5jaGFuZ2VUYWIobnVsbCwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzaXplVGFicygpIHtcbiAgICAgICAgICAgIGxldCB3aWR0aDogTnVtYmVyID0gMTY7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdGFiSGVhZGVyID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJyk7XG4gICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRUYWIoaGVhZGVyIDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYm9keSA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAgICAgICAgIGxldCBpZHggOiBudW1iZXIgPSB0aGlzLnRhYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpKS5hcHBlbmQoaGVhZGVyKTtcblxuICAgICAgICAgICAgaGVhZGVyLmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XG4gICAgICAgICAgICBib2R5LmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XG5cbiAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJztcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRhYnMoKTtcblxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFuZ2VUYWIoZXZlbnQ6IEpRdWVyeUV2ZW50T2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgICAgICBpZihpbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCd0ZC10YWItaW5kZXgnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVUYWJzKCkge1xuICAgICAgICAgICAgbGV0IGhlaWdodCA6IE51bWJlcjtcbiAgICAgICAgICAgIGxldCBjb250ZW50IDogSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUudHJhbnNpdGlvbiA9ICdoZWlnaHQgNTAwbXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gaSArIDE7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGFiKGkpO1xuXG4gICAgICAgICAgICAgICAgaWYoaWR4ID09PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaWR4IDwgdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUYWIoaWR4OiBudW1iZXIpIHtcbiAgICAgICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuYmx1cigpO1xuICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uYm9keS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInLCBbXSkuZGlyZWN0aXZlKCd0ZFRhYnMnLCAoJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWI6ICc9J1xuICAgICAgICB9LFxuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLXRhYlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19oZWFkZXItd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudC13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcixcbiAgICAgICAgbGluazogKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWInLCAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGxpbmsoc2NvcGU6bmcuSVNjb3BlLCBlbGVtZW50Om5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOm5nLklBdHRyaWJ1dGVzLCBjdHJsOmFueSkge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xuXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjbGFzcz1cImMtdGFiX19oZWFkZXItaXRlbSBjLWJ1dHRvbiBjLWJ1dHRvbi0tdGFiIGpzLXRhYl9fdGl0bGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlPjwvYnV0dG9uPmAsXG4gICAgICAgIGxpbmsoc2NvcGU6IFRocmVhZC5Db21wb25lbnRzLlRhYlRpdGxlU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSB7XG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYkJvZHknLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYicsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImMtdGFiX19ib2R5IGpzLXRhYl9fYm9keVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+J1xuICAgIH07XG59KTsiLCIvKipcbiAqIFdhdmUgZWZmZWN0XG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGEgZ3Jvd2luZyBjaXJjbGUgaW4gdGhlIGJhY2tncm91bmRcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTEvMjAxNlxuICovXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBjbGFzcyB3YXZlRWZmZWN0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgd2F2ZUVsO1xuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgbGV0IGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IGAke3Bvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnR9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IGAke3Bvcy50b3AgLSBwYXJlbnRQb3MudG9wfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcblxuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpO1xuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xuICAgICAgICByZXN0cmljdCA9ICdDJztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKSk7XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxuXG5tb2R1bGUgdGhyZWFkIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxuICAgICAgICAndGhyZWFkLm1lbnUnLFxuICAgICAgICAndGhyZWFkLnRhYicsXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxuICAgICAgICAndGhyZWFkLmRpYWxvZydcbiAgICBdKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

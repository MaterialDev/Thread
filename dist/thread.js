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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdFJlc2l6ZS9zZWxlY3RSZXNpemUuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy90YWIvdGFiLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvd2F2ZUVmZmVjdC93YXZlRWZmZWN0LmRpcmVjdGl2ZS50cyIsImFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FDQ3BDLElBQU8sTUFBTSxDQTBDWjtBQTFDRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0EwQ3ZCO0lBMUNhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFNdEI7WUFJSSwwQkFBb0IsUUFBOEI7Z0JBQTlCLGFBQVEsR0FBUixRQUFRLENBQXNCO1lBQUcsQ0FBQztZQUV0RCxrQ0FBTyxHQUFQLGNBQVcsQ0FBQztZQUVaLGdDQUFLLEdBQUwsVUFBTSxRQUFlO2dCQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZ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QUM7SUFDWCxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNyQix1QkFBdUI7UUFDdkIsbUJBQW1CO1FBQ25CLGFBQWE7UUFDYixZQUFZO1FBQ1osc0JBQXNCO1FBQ3RCLHFCQUFxQjtRQUNyQixlQUFlO1FBQ2YscUJBQXFCO1FBQ3JCLDBCQUEwQjtRQUMxQixlQUFlO0tBQ2xCLENBQUMsQ0FBQztBQUNQLENBQUMsRUFmTSxNQUFNLEtBQU4sTUFBTSxRQWVaIiwiZmlsZSI6InRocmVhZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pOyIsIlxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Njb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICAgICAgb3BlbjogRnVuY3Rpb247XG4gICAgICAgIGNsb3NlOiBGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nQ29udHJvbGxlciB7XG4gICAgICAgIGRlZmVyQ2FsbGJhY2sgOiBuZy5JRGVmZXJyZWQ7XG4gICAgICAgIGNhbmNlbGxlZDogYm9vbGVhbjtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge31cblxuICAgICAgICAkb25Jbml0KCkge31cblxuICAgICAgICBjbG9zZShyZXNwb25zZT8gOiBhbnkpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGlmKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW4oZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuICAgICAgICAgICAgaWYoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRvbkRlc3Ryb3koKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCAoKSA9PiB7XG4gICByZXR1cm4ge1xuICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIsXG4gICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcbiAgIH07XG59KTsiLCJtb2R1bGUgVGhyZWFkLlNlcnZpY2VzIHtcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nU2VydmljZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICAgICAgcHJpdmF0ZSAkcTogbmcuSVFTZXJ2aWNlLFxuICAgICAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBuZy5JUm9vdFNjb3BlU2VydmljZSxcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IG5nLklDb21waWxlU2VydmljZVxuICAgICAgICApIHt9XG5cbiAgICAgICAgb3BlbihvcHRpb25zKSA6IG5nLklQcm9taXNlIHtcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA6IG5nLklEZWZlcnJlZDtcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG5cbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55KSB7XG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG5cbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZHluYW1pYyBiYWNrZ3JvdW5kIGVuZCEgUGxlYXNlIGFkZCB0aGUgYXR0cmlidXRlIFwiZHluYW1pYy1iYWNrZ3JvdW5kLWVuZFwiIHRvIGEgY2hpbGQgZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBvcHRpb25hbEhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTsiLCIvKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICBsZXQgbmdNb2RlbEN0cmwgOiBuZy5JTmdNb2RlbENvbnRyb2xsZXIgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcblxuICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZihuZ01vZGVsQ3RybCkge1xuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignZm9jdXMnKTtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJykuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcbiAgICB9XG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XG4gICAgICAgIGhpZGVSZXF1aXJlOiBhbnlcbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuaW5wdXRSZXF1aXJlJywgW10pLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogVGhyZWFkLkNvbXBvbmVudHMuSW5wdXRSZXF1aXJlQXR0cmlidXRlcykge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgY2xhc3MgTWVudSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICBzY29wZSA9IHt9O1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVzdHJpY3QgPSAnRSc7XG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xuICAgICAgICBjb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICB0ZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYy1tZW51IGpzLW1lbnVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbiAgICAgICAgbWVudUNvbnRlbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xuICAgICAgICBiYWNrZHJvcCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7fVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnRyb2xsZXIoJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgb25Cb2R5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXG4gICAgICAgICAgICAgICAgb3BlbixcbiAgICAgICAgICAgICAgICBjbG9zZSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldFBvcyA9IG1lbnVUYXJnZXRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5yaWdodCAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUubGVmdCA9IGAke2xlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnR9cHhgO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5yaWdodCA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoeVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnlQb3MgPSB5UG9zaXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVUb0JvZHkoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5tZW51Q29udGVudCk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIGxldCBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IE1lbnUoJHRpbWVvdXQpO1xuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVUYXJnZXQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gYDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcIlxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJG1lbnUub3BlbigpXCI+PC9idXR0b24+YDtcblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICAoPGFueT5zY29wZSkuJG1lbnUgPSBjdHJsO1xuICAgICAgICB9O1xuXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVUYXJnZXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51Q29udGVudCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcbiAgICAgICAgdGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51Q29udGVudCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVJdGVtIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcbiAgICAgICAgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUl0ZW0oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubGV0IG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudS5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVJdGVtJywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUl0ZW0uZmFjdG9yeSgpKTsiLCIvKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG5cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFByb2Rpc0NvbnRyb2xsZXIge1xuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xuICAgICAgICBzZWN0aW9uczogYW55W107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlU2VjdGlvbnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcbiAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlclNlY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTZWN0aW9uSGVpZ2h0KHNlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXJcbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+YCxcbiAgICAgICAgcmVxdWlyZTogJ15wcm9kaXMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xuICAgICAgICAgICAgdGhpcy5pZCA9ICRwYXJlbnQucmVnaXN0ZXJTZWN0aW9uKCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXNfX3NlY3Rpb24nKSwgJGF0dHJzLm5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pc0NvbXBsZXRlID0gISEkYXR0cnMuaXNDb21wbGV0ZTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXN0cmljdCA9ICdBJztcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcykgPT4ge1xuICAgICAgICAgICAgbGV0IGxhc3RTY3JvbGwgPSAwO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuXG4gICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgZG93blxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIHVwXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKTogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gKCR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSA9PiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHdpbmRvdyddO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpKTsiLCIvKipcbiAqIFNlbGVjdCBSZXNpemVcbiAqIEF1dG9tYXRpY2FsbHkgcmVzaXplcyBzZWxlY3QgZWxlbWVudHMgdG8gZml0IHRoZSB0ZXh0IGV4YWN0bHlcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcbiAqL1xuXG5pbnRlcmZhY2Ugc2VsZWN0UmVzaXplU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xuICAgIHJlc2l6ZURlZmF1bHQgOiBudW1iZXI7XG4gICAgb25SZXNpemU6IEZ1bmN0aW9uO1xuICAgIHBhcmVudDogc3RyaW5nO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyKCRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdldEVsZW1lbnQgPSBnZXRFbGVtZW50O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScpLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplJywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCcsXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmsoc2NvcGU6IHNlbGVjdFJlc2l6ZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gcmVzaXplSW5wdXQoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVsIDogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+ZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICBsZXQgYXJyb3dXaWR0aCA9IDI0O1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gKDxIVE1MT3B0aW9uRWxlbWVudD5lbC5vcHRpb25zW2VsLnNlbGVjdGVkSW5kZXhdKS50ZXh0O1xuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXN0RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuPicpLmh0bWwodGV4dCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudCA9IGN0cmwgPyBjdHJsLmdldEVsZW1lbnQoKSA6IGVsZW1lbnQucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmQodGVzdEVsKTtcblxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRlc3RFbFswXS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKyBhcnJvd1dpZHRofXB4YDtcblxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5vblJlc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIvKipcbiAqIFRhYiBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHN3aXRjaGluZyBiZXR3ZWVuXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA4LzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBpbnRlcmZhY2UgVGFicyB7XG4gICAgICAgIGxhc3RUYWI6IG51bWJlcjtcbiAgICAgICAgYWN0aXZlVGFiOiBudW1iZXI7XG4gICAgICAgIHRhYnM6IEFycmF5PE9iamVjdD47XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBUYWJUaXRsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICAgICAgJHRhYnM6IFRhYnNDb250cm9sbGVyO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBUYWJzQ29udHJvbGxlciBpbXBsZW1lbnRzIFRhYnN7XG4gICAgICAgIGFjdGl2ZVRhYiA9IDE7XG4gICAgICAgIHRhYnMgPSBbXTtcbiAgICAgICAgbGFzdFRhYiA9IC0xO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsIHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICAkb25Jbml0KCkge1xuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+ICg8YW55PnRoaXMpLmN1cnJlbnRUYWIsIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZihuZXdWYWx1ZSAmJiBuZXdWYWx1ZSA9PT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc2l6ZVRhYnMoKSB7XG4gICAgICAgICAgICBsZXQgd2lkdGg6IE51bWJlciA9IDE2O1xuXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHRhYkhlYWRlciA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xuICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkVGFiKGhlYWRlciA6IG5nLklBdWdtZW50ZWRKUXVlcnksIGJvZHkgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICAgICAgICBsZXQgaWR4IDogbnVtYmVyID0gdGhpcy50YWJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XG5cbiAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG5cbiAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhbmdlVGFiKGV2ZW50OiBKUXVlcnlFdmVudE9iamVjdCwgaW5kZXg6IG51bWJlcikge1xuICAgICAgICAgICAgaWYoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlVGFicygpIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQgOiBOdW1iZXI7XG4gICAgICAgICAgICBsZXQgY29udGVudCA6IEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IGkgKyAxO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcblxuICAgICAgICAgICAgICAgIGlmKGlkeCA9PT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkeCA8IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGFiKGlkeDogbnVtYmVyKSB7XG4gICAgICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmJsdXIoKTtcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmhlYWRlci5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJywgW10pLmRpcmVjdGl2ZSgndGRUYWJzJywgKCRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy10YWJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlciBqcy10YWJfX2hlYWRlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXIsXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBsaW5rKHNjb3BlOm5nLklTY29wZSwgZWxlbWVudDpuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczpuZy5JQXR0cmlidXRlcywgY3RybDphbnkpIHtcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcbiAgICAgICAgICAgIGxldCBib2R5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fYm9keScpKTtcblxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5gLFxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjLXRhYl9fYm9keSBqcy10YWJfX2JvZHlcIiBuZy10cmFuc2NsdWRlPjwvZGl2PidcbiAgICB9O1xufSk7IiwiLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXN0cmljdCA9ICdBJztcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcbiAgICAgICAgICAgIGxldCByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgIGxldCBpc0ZhYiA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XG4gICAgICAgICAgICAgICAgbGV0IGhlaWdodDtcblxuICAgICAgICAgICAgICAgIHdhdmVFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4gY2xhc3M9XCJ3YXZlLWVmZmVjdFwiPjwvc3Bhbj4nKTtcblxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcbiAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAvL2NpcmNsZSwgaGVpZ2h0IG11c3QgbWF0Y2ggdGhlIHdpZHRoXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub24oJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSBgJHtwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZih3YXZlRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpO1xuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xuICAgICAgICByZXN0cmljdCA9ICdDJztcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7XG4gICAgICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKSk7XG5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxuXG5tb2R1bGUgdGhyZWFkIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxuICAgICAgICAndGhyZWFkLm1lbnUnLFxuICAgICAgICAndGhyZWFkLnRhYicsXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxuICAgICAgICAndGhyZWFkLmRpYWxvZydcbiAgICBdKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

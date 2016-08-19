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
            element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
            inputField.on('input', function () {
                element.toggleClass('has-value', !!this.value || !!this.getAttribute('placeholder'));
            });
            inputField.on('focus', function () {
                element.addClass('has-focus');
            });
            inputField.on('blur', function () {
                element.removeClass('has-focus');
            });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdFJlc2l6ZS9zZWxlY3RSZXNpemUuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy90YWIvdGFiLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvd2F2ZUVmZmVjdC93YXZlRWZmZWN0LmRpcmVjdGl2ZS50cyIsImFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FDQ3BDLElBQU8sTUFBTSxDQTBDWjtBQTFDRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0EwQ3ZCO0lBMUNhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFNdEI7WUFJSSwwQkFBb0IsUUFBOEI7Z0JBQTlCLGFBQVEsR0FBUixRQUFRLENBQXNCO1lBQUcsQ0FBQztZQUV0RCxrQ0FBTyxHQUFQLGNBQVcsQ0FBQztZQUVaLGdDQUFLLEdBQUwsVUFBTSxRQUFlO2dCQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZ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LENBUnFDLFVBQVUsR0FRL0M7UUFSWSwyQkFBZ0IsbUJBUTVCLENBQUE7SUFDTCxDQUFDLEVBMUhhLFVBQVUsR0FBVixpQkFBVSxLQUFWLGlCQUFVLFFBMEh2QjtBQUFELENBQUMsRUExSE0sTUFBTSxLQUFOLE1BQU0sUUEwSFo7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN4RyxPQUFPLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUNwSXZHLHVEQUF1RDtBQUV2RCxJQUFPLE1BQU0sQ0FlWjtBQWZELFdBQU8sTUFBTSxFQUFDLENBQUM7SUFDWCxZQUFZLENBQUM7SUFFYixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNyQix1QkFBdUI7UUFDdkIsbUJBQW1CO1FBQ25CLGFBQWE7UUFDYixZQUFZO1FBQ1osc0JBQXNCO1FBQ3RCLHFCQUFxQjtRQUNyQixlQUFlO1FBQ2YscUJBQXFCO1FBQ3JCLDBCQUEwQjtRQUMxQixlQUFlO0tBQ2xCLENBQUMsQ0FBQztBQUNQLENBQUMsRUFmTSxNQUFNLEtBQU4sTUFBTSxRQWVaIiwiZmlsZSI6InRocmVhZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pOyIsIlxyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgb3BlbjogRnVuY3Rpb247XHJcbiAgICAgICAgY2xvc2U6IEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dDb250cm9sbGVyIHtcclxuICAgICAgICBkZWZlckNhbGxiYWNrIDogbmcuSURlZmVycmVkO1xyXG4gICAgICAgIGNhbmNlbGxlZDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHt9XHJcblxyXG4gICAgICAgICRvbkluaXQoKSB7fVxyXG5cclxuICAgICAgICBjbG9zZShyZXNwb25zZT8gOiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbmNlbCgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG5cclxuICAgICAgICAgICAgaWYoZGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25EZXN0cm95KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCAoKSA9PiB7XHJcbiAgIHJldHVybiB7XHJcbiAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIsXHJcbiAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xyXG4gICB9O1xyXG59KTsiLCJtb2R1bGUgVGhyZWFkLlNlcnZpY2VzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dTZXJ2aWNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkcTogbmcuSVFTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcclxuICAgICAgICApIHt9XHJcblxyXG4gICAgICAgIG9wZW4ob3B0aW9ucykgOiBuZy5JUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA6IG5nLklEZWZlcnJlZDtcclxuICAgICAgICAgICAgbGV0IGRpYWxvZ0VsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgICAgICBsZXQgZGlhbG9nU2NvcGUgOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZTtcclxuXHJcbiAgICAgICAgICAgIGRlZmVycmVkID0gdGhpcy4kcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXHJcbiAgICAgICAgICAgICAgICA8dGQtZGlhbG9nXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiJHtvcHRpb25zLnRhcmdldH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXHJcbiAgICAgICAgICAgICAgICA+PC90ZC1kaWFsb2c+XHJcbiAgICAgICAgICAgIGApO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaWFsb2dFbGVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XHJcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XHJcblxyXG4gICAgICAgICAgICBkaWFsb2dTY29wZS5vcGVuKGRlZmVycmVkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSkge1xyXG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXHJcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgMTApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIG9wdGlvbmFsSGVpZ2h0OiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmYgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1tkeW5hbWljLWJhY2tncm91bmQtZW5kXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCFjdXRvZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmUmVjdCA9IGN1dG9mZi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihvcHRpb25hbEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgNjQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIEZsb2F0aW5nIGxhYmVsXHJcbiAqIEEgY29tcG9uZW50IHRoYXQgY29udHJvbHMgbGFiZWwgaW50ZXJhY3Rpb25zIG9uIGlucHV0IGZpZWxkc1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcclxuICovXHJcbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XHJcbiAgICAgICAgaWYgKCg8YW55PmF0dHJzKS5ub0Zsb2F0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhdGhpcy52YWx1ZSB8fCAhIXRoaXMuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2JsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfVxyXG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnB1dFJlcXVpcmVBdHRyaWJ1dGVzIHtcclxuICAgICAgICBoaWRlUmVxdWlyZTogYW55XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuaW5wdXRSZXF1aXJlJywgW10pLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQycsXHJcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogVGhyZWFkLkNvbXBvbmVudHMuSW5wdXRSZXF1aXJlQXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtcmVxdWlyZWQnKTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBNZW51XHJcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgTWVudSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHNjb3BlID0ge307XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlciA9IHRydWU7XHJcbiAgICAgICAgY29udHJvbGxlckFzID0gJyRtZW51JztcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYy1tZW51IGpzLW1lbnVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcblxyXG4gICAgICAgIG1lbnVDb250ZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICBiYWNrZHJvcCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge31cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55LCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XHJcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgncG9zaXRpb24nKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwbGl0UG9zID0gYXR0cnMucG9zaXRpb24uc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oJ3RvcCcsICdsZWZ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4gY3RybC5jbG9zZSgpLCAxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZTogbmcuSVNjb3BlLCAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XHJcbiAgICAgICAgICAgICAgICBvbkJvZHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeFBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBvcGVuLFxyXG4gICAgICAgICAgICAgICAgY2xvc2UsXHJcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbixcclxuICAgICAgICAgICAgICAgIG1vdmVUb0JvZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkJvZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLnJpZ2h0IC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHlQb3NpdGlvbiwgeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tdG9wJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy54UG9zID0geFBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBNZW51KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51VGFyZ2V0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSBgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XCJcclxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXHJcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkbWVudS5vcGVuKClcIj48L2J1dHRvbj5gO1xyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICg8YW55PnNjb3BlKS4kbWVudSA9IGN0cmw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51VGFyZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51Q29udGVudCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUNvbnRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVJdGVtIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51Q29udGVudCc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVJdGVtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgbWVudSA9IGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQubWVudScsIFtdKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7IiwiLyoqXHJcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcclxuICogQSBuYXR1cmFsIGxhbmd1YWdlIGNvbXBvbmVudCB0aGF0IHNob3dzIG9uZVxyXG4gKiBzZWN0aW9uIGF0IGEgdGltZSBjZW50ZXJlZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY3JlZW5cclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNi8xNS8yMDE2XHJcbiAqL1xyXG5cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBQcm9kaXNDb250cm9sbGVyIHtcclxuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIHNlY3Rpb25zOiBhbnlbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0KCkge1xyXG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpIDwgdGhpcy5zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbaV0ubmFtZSA9PT0gc2VjdGlvbk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRDdXJyZW50KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZVNlY3Rpb25zKCkge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcHJvZGlzRWwgOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByb2Rpc0VsID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xyXG4gICAgICAgICAgICBwcm9kaXNFbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVnaXN0ZXJTZWN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBuYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0U2VjdGlvbkhlaWdodChzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLW5hdHVyYWwtbGFuZ3VhZ2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXJcclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxyXG4gICAgICAgIHJlcXVpcmU6ICdecHJvZGlzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbGFzdFNjcm9sbCA9IDA7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgZG93blxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgdXBcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsIDwgbGFzdFNjcm9sbCAtIDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKTogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpID0+IG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKSk7IiwiLyoqXHJcbiAqIFNlbGVjdCBSZXNpemVcclxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcclxuICovXHJcblxyXG5pbnRlcmZhY2Ugc2VsZWN0UmVzaXplU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcclxuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcclxuICAgIHBhcmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgYXJyb3dXaWR0aCA9IDMyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKyBhcnJvd1dpZHRofXB4YDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIFRhYiBjb21wb25lbnRcclxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3Mgc3dpdGNoaW5nIGJldHdlZW5cclxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMDgvMjAxNlxyXG4gKi9cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGludGVyZmFjZSBUYWJzIHtcclxuICAgICAgICBsYXN0VGFiOiBudW1iZXI7XHJcbiAgICAgICAgYWN0aXZlVGFiOiBudW1iZXI7XHJcbiAgICAgICAgdGFiczogQXJyYXk8T2JqZWN0PjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRhYlRpdGxlU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgICR0YWJzOiBUYWJzQ29udHJvbGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVGFic0NvbnRyb2xsZXIgaW1wbGVtZW50cyBUYWJze1xyXG4gICAgICAgIGFjdGl2ZVRhYiA9IDE7XHJcbiAgICAgICAgdGFicyA9IFtdO1xyXG4gICAgICAgIGxhc3RUYWIgPSAtMTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSwgcHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+ICg8YW55PnRoaXMpLmN1cnJlbnRUYWIsIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzaXplVGFicygpIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBOdW1iZXIgPSAxNjtcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YWJIZWFkZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcclxuICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkVGFiKGhlYWRlciA6IG5nLklBdWdtZW50ZWRKUXVlcnksIGJvZHkgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGxldCBpZHggOiBudW1iZXIgPSB0aGlzLnRhYnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcclxuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcclxuICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGFuZ2VUYWIoZXZlbnQ6IEpRdWVyeUV2ZW50T2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmKGluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0IDogTnVtYmVyO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudCA6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IGkgKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaWR4ID09PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaWR4IDwgdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGVhclRhYihpZHg6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlRhYnNDb250cm9sbGVyLFxyXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcclxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XHJcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcclxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogV2F2ZSBlZmZlY3RcclxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbm9XYXZlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcclxuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xyXG4gICAgICAgICAgICBsZXQgaXNGYWIgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1pY29uJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcclxuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0geyBsZWZ0OiBlLmNsaWVudFgsIHRvcDogZS5jbGllbnRZIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gYCR7cG9zLmxlZnQgLSBwYXJlbnRQb3MubGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0MnO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnLCBbXSkuZGlyZWN0aXZlKCd3YXZlRWZmZWN0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdC5mYWN0b3J5KCkpO1xyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKSk7XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSB0aHJlYWQge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcclxuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcclxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxyXG4gICAgICAgICd0aHJlYWQubWVudScsXHJcbiAgICAgICAgJ3RocmVhZC50YWInLFxyXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXHJcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxyXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcclxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnXHJcbiAgICBdKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
                            element.addClass('collapsed');
                            lastScroll = scroll;
                        }
                        else if (scroll < lastScroll - 10) {
                            element.removeClass('collapsed');
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
                this.template = "<div class=\"c-menu\">\n                        <div class=\"c-menu__backdrop\"></div>\n                        <ng-transclude></ng-transclude>\n                    </div>";
                this.link = function (scope, element, attrs, ctrl) {
                    ctrl.menuContent = angular.element(element[0].querySelector('.c-menu__content'));
                    ctrl.backdrop = angular.element(element[0].querySelector('.c-menu__backdrop'));
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
                    angular.element(element[0].querySelector('.c-menu__item')).on('click', function () {
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
                    var menuTarget = angular.element($element[0].querySelector('.c-menu__target'));
                    angular.element($element[0].querySelector('.c-menu')).addClass('c-menu--open');
                    this.menuContent.addClass('c-menu__content--open');
                    this.backdrop.addClass('c-menu__backdrop--open');
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
                        this.menuContent[0].style.left = left;
                        this.menuContent[0].style.top = top_1;
                        this.menuContent[0].style.right = 'initial';
                        this.menuContent[0].style.bottom = 'initial';
                    }
                }
                function close() {
                    angular.element($element[0].querySelector('.c-menu')).removeClass('c-menu--open');
                    this.menuContent.removeClass('c-menu__content--open');
                    this.backdrop.removeClass('c-menu__backdrop--open');
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
                    this.menuContent.addClass('c-menu__content--on-body');
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
                this.template = "<button\n                    class=\"c-menu__target c-button\"\n                    ng-transclude\n                    ng-click=\"$menu.open()\"></button>";
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
                this.template = '<ul class="c-menu__content" ng-transclude></ul>';
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
                this.template = '<a class="c-button c-button--menu c-menu__item" ng-transclude></a>';
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
        var Tabs = (function () {
            function Tabs() {
                this.scope = {
                    currentTab: '='
                };
                this.restrict = 'E';
                this.template = "<div class=\"c-tab\">\n                        <div class=\"c-tab__header-wrapper\">\n                            <div class=\"c-tab__header\"></div>\n                        </div>\n                        <div class=\"c-tab__content-wrapper\">\n                            <div class=\"c-tab__content\" ng-transclude></div>\n                        </div>\n                    </div>";
                this.replace = true;
                this.transclude = true;
                this.bindToController = true;
                this.controllerAs = '$tabs';
                this.link = function (scope, element, attrs) {
                };
            }
            Tabs.prototype.controller = function ($scope, $timeout, $element) {
                var _this = this;
                angular.extend(this, {
                    activeTab: 1,
                    tabs: [],
                    addTab: addTab,
                    changeTab: changeTab,
                    updateTabs: updateTabs,
                    clearTab: clearTab
                });
                $scope.$watch(function () { return _this.currentTab; }, function (newValue, oldValue) {
                    if (newValue && newValue === oldValue) {
                        _this.activeTab = newValue;
                        _this.updateTabs();
                    }
                    else if (newValue) {
                        _this.changeTab(null, newValue);
                    }
                });
                function addTab(header, body) {
                    var idx = this.tabs.push({
                        header: header,
                        body: body
                    });
                    angular.element($element[0].querySelector('.c-tab__header')).append(header);
                    header.attr('td-tab-index', idx);
                    body.attr('td-tab-index', idx);
                    this.updateTabs();
                }
                function changeTab(event, index) {
                    if (index == null) {
                        index = parseInt(event.target.getAttribute('td-tab-index'));
                    }
                    if (index && index !== this.activeTab) {
                        this.lastTab = this.activeTab;
                        this.activeTab = index;
                        this.updateTabs();
                    }
                }
                function updateTabs() {
                    if (this.lastTab) {
                        var height = this.tabs[this.activeTab - 1].body[0].offsetHeight;
                        var content = $element[0].querySelector('.c-tab__content');
                        content.style.height = height + "px";
                        content.style.transition = 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    }
                    for (var i = 0; i < this.tabs.length; i++) {
                        var idx = i + 1;
                        this.clearTab(i);
                        if (idx === this.activeTab) {
                            this.tabs[i].header.addClass('active');
                            this.tabs[i].body.addClass('active');
                        }
                        else if (idx < this.activeTab) {
                            this.tabs[i].header.addClass('left');
                            this.tabs[i].body.addClass('left');
                        }
                        else {
                            this.tabs[i].header.addClass('right');
                            this.tabs[i].body.addClass('right');
                        }
                    }
                }
                function clearTab(idx) {
                    this.tabs[idx].header.removeClass('active right left');
                    this.tabs[idx].body.removeClass('active right left');
                }
            };
            Tabs.factory = function () {
                return function () { return new Tabs(); };
            };
            return Tabs;
        }());
        Components.Tabs = Tabs;
        var Tab = (function () {
            function Tab() {
                this.restrict = 'E';
                this.require = '^tdTabs';
                this.scope = true;
                this.link = function (scope, element, attrs, ctrl) {
                    var header = angular.element(element[0].querySelector('.js-tab__title'));
                    var body = angular.element(element[0].querySelector('.js-tab__body'));
                    ctrl.addTab(header, body);
                };
            }
            Tab.prototype.controller = function () {
            };
            Tab.factory = function () {
                return function () { return new Tab(); };
            };
            return Tab;
        }());
        Components.Tab = Tab;
        var TabTitle = (function () {
            function TabTitle() {
                this.replace = true;
                this.require = '^tdTabs';
                this.transclude = true;
                this.template = "<button class=\"c-tab__header-item c-button c-button--tab js-tab__title\"\n                            ng-click=\"$tabs.changeTab($event)\"\n                            ng-transclude></button>";
                this.link = function (scope, element, attrs, ctrl) {
                    scope.$tabs = ctrl;
                };
            }
            TabTitle.factory = function () {
                return function () { return new TabTitle(); };
            };
            return TabTitle;
        }());
        Components.TabTitle = TabTitle;
        var TabBody = (function () {
            function TabBody() {
                this.replace = true;
                this.require = '^tdTab';
                this.transclude = true;
                this.template = '<div class="c-tab__body js-tab__body" ng-transclude></div>';
            }
            TabBody.factory = function () {
                return function () { return new TabBody(); };
            };
            return TabBody;
        }());
        Components.TabBody = TabBody;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
var tab = angular.module('thread.tab', []);
tab.directive('tdTabs', Thread.Components.Tabs.factory());
tab.directive('tdTab', Thread.Components.Tab.factory());
tab.directive('tdTabTitle', Thread.Components.TabTitle.factory());
tab.directive('tdTabBody', Thread.Components.TabBody.factory());
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
                            waveEl.removeClass('wave-effect--focus');
                            waveEl.addClass('wave-effect--active');
                            removeActiveTimeout = _this.$timeout(function () {
                                if (removeActiveTriggered) {
                                    removeActiveTriggered = false;
                                    waveEl.removeClass('wave-effect--active');
                                }
                                removeActiveTimeout = null;
                            }, 300);
                        }
                    });
                    element.on('focus', function () {
                        waveEl[0].style.left = '';
                        waveEl[0].style.top = '';
                        if (!element.hasClass('wave-effect--active')) {
                            waveEl.addClass('wave-effect--focus');
                        }
                        else {
                            rawElement.blur();
                        }
                    });
                    element.on('blur', function () {
                        waveEl.removeClass('wave-effect--focus');
                    });
                    function onMouseUp() {
                        if (removeActiveTimeout) {
                            removeActiveTriggered = true;
                        }
                        else {
                            waveEl.removeClass('wave-effect--active');
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
        'thread.tab'
    ]);
})(thread || (thread = {}));

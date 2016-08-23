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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdFJlc2l6ZS9zZWxlY3RSZXNpemUuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy93YXZlRWZmZWN0L3dhdmVFZmZlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy90YWIvdGFiLmRpcmVjdGl2ZS50cyIsImFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FDQ3BDLElBQU8sTUFBTSxDQTBDWjtBQTFDRCxXQUFPLE1BQU07SUFBQyxJQUFBLFVBQVUsQ0EwQ3ZCO0lBMUNhLFdBQUEsVUFBVSxFQUFDLENBQUM7UUFNdEI7WUFJSSwwQkFBb0IsUUFBOEI7Z0JBQTlCLGFBQVEsR0FBUixRQUFRLENBQXNCO1lBQUcsQ0FBQztZQUV0RCxrQ0FBTyxHQUFQLGNBQVcsQ0FBQztZQUVaLGdDQUFLLEdBQUwsVUFBTSxRQUFlO2dCQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZ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cUI7UUFDckIsZUFBZTtRQUNmLHFCQUFxQjtRQUNyQiwwQkFBMEI7UUFDMUIsZUFBZTtLQUNsQixDQUFDLENBQUM7QUFDUCxDQUFDLEVBZk0sTUFBTSxLQUFOLE1BQU0sUUFlWiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xyXG4gICAgICAgIGNsb3NlOiBGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICAgICAgZGVmZXJDYWxsYmFjayA6IG5nLklEZWZlcnJlZDtcclxuICAgICAgICBjYW5jZWxsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge31cclxuXHJcbiAgICAgICAgY2xvc2UocmVzcG9uc2U/IDogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICAgICAgICAgIGlmKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uRGVzdHJveSgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgKCkgPT4ge1xyXG4gICByZXR1cm4ge1xyXG4gICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcclxuICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5TZXJ2aWNlcyB7XHJcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHE6IG5nLklRU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBuZy5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkY29tcGlsZTogbmcuSUNvbXBpbGVTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBvcGVuKG9wdGlvbnMpIDogbmcuSVByb21pc2Uge1xyXG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQgOiBuZy5JRGVmZXJyZWQ7XHJcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICAgICAgbGV0IGRpYWxvZ1Njb3BlIDogVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nU2NvcGU7XHJcblxyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoYFxyXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIiR7b3B0aW9ucy50YXJnZXR9XCJcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cIiR7b3B0aW9ucy50ZW1wbGF0ZX1cIlxyXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxyXG4gICAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUoZGlhbG9nRWxlbWVudCkob3B0aW9ucy5zY29wZSB8fCB0aGlzLiRyb290U2NvcGUpO1xyXG4gICAgICAgICAgICBkaWFsb2dTY29wZSA9IDxUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZT5kaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xyXG5cclxuICAgICAgICAgICAgZGlhbG9nU2NvcGUub3BlbihkZWZlcnJlZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBGbG9hdGluZyBsYWJlbFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XHJcbiAqL1xyXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IG5nLklOZ01vZGVsQ29udHJvbGxlcikge1xyXG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICBsZXQgbmdNb2RlbEN0cmwgOiBuZy5JTmdNb2RlbENvbnRyb2xsZXIgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2JsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZihuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhdmFsdWUgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfVxyXG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnB1dFJlcXVpcmVBdHRyaWJ1dGVzIHtcclxuICAgICAgICBoaWRlUmVxdWlyZTogYW55XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuaW5wdXRSZXF1aXJlJywgW10pLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQycsXHJcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogVGhyZWFkLkNvbXBvbmVudHMuSW5wdXRSZXF1aXJlQXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5wdXRGaWVsZCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtcmVxdWlyZWQnKTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBNZW51XHJcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgTWVudSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHNjb3BlID0ge307XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlciA9IHRydWU7XHJcbiAgICAgICAgY29udHJvbGxlckFzID0gJyRtZW51JztcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYy1tZW51IGpzLW1lbnVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcblxyXG4gICAgICAgIG1lbnVDb250ZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICBiYWNrZHJvcCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge31cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55LCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XHJcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgncG9zaXRpb24nKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwbGl0UG9zID0gYXR0cnMucG9zaXRpb24uc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oJ3RvcCcsICdsZWZ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4gY3RybC5jbG9zZSgpLCAxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZTogbmcuSVNjb3BlLCAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XHJcbiAgICAgICAgICAgICAgICBvbkJvZHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgeFBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBvcGVuLFxyXG4gICAgICAgICAgICAgICAgY2xvc2UsXHJcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbixcclxuICAgICAgICAgICAgICAgIG1vdmVUb0JvZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkJvZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLnJpZ2h0IC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHlQb3NpdGlvbiwgeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tdG9wJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy54UG9zID0geFBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBNZW51KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51VGFyZ2V0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSBgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XCJcclxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXHJcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkbWVudS5vcGVuKClcIj48L2J1dHRvbj5gO1xyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICg8YW55PnNjb3BlKS4kbWVudSA9IGN0cmw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51VGFyZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51Q29udGVudCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUNvbnRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVJdGVtIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51Q29udGVudCc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVJdGVtKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgbWVudSA9IGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQubWVudScsIFtdKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7IiwiLyoqXHJcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcclxuICogQSBuYXR1cmFsIGxhbmd1YWdlIGNvbXBvbmVudCB0aGF0IHNob3dzIG9uZVxyXG4gKiBzZWN0aW9uIGF0IGEgdGltZSBjZW50ZXJlZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY3JlZW5cclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNi8xNS8yMDE2XHJcbiAqL1xyXG5cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBQcm9kaXNDb250cm9sbGVyIHtcclxuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIHNlY3Rpb25zOiBhbnlbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0KCkge1xyXG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpIDwgdGhpcy5zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbaV0ubmFtZSA9PT0gc2VjdGlvbk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRDdXJyZW50KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZVNlY3Rpb25zKCkge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcHJvZGlzRWwgOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByb2Rpc0VsID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xyXG4gICAgICAgICAgICBwcm9kaXNFbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVnaXN0ZXJTZWN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBuYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0U2VjdGlvbkhlaWdodChzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLW5hdHVyYWwtbGFuZ3VhZ2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXJcclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxyXG4gICAgICAgIHJlcXVpcmU6ICdecHJvZGlzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbGFzdFNjcm9sbCA9IDA7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgZG93blxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgdXBcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsIDwgbGFzdFNjcm9sbCAtIDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKTogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpID0+IG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKSk7IiwiLyoqXHJcbiAqIFNlbGVjdCBSZXNpemVcclxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcclxuICovXHJcblxyXG5pbnRlcmZhY2Ugc2VsZWN0UmVzaXplU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcclxuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcclxuICAgIHBhcmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgYXJyb3dXaWR0aCA9IDMyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKyBhcnJvd1dpZHRofXB4YDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIFdhdmUgZWZmZWN0XHJcbiAqIEEgZGlyZWN0aXZlIHRoYXQgc2hvd3MgYSBncm93aW5nIGNpcmNsZSBpbiB0aGUgYmFja2dyb3VuZFxyXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMS8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3QgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3YXZlRWw7XHJcbiAgICAgICAgICAgIGxldCByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcclxuICAgICAgICAgICAgbGV0IGlzRmFiID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4gY2xhc3M9XCJ3YXZlLWVmZmVjdFwiPjwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYicpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCd3YXZlLWVmZmVjdC0tZmFiJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub24oJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50UG9zID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IGAke3Bvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnR9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gYCR7cG9zLnRvcCAtIHBhcmVudFBvcy50b3B9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub2ZmKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7XHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3RCdXR0b24gZXh0ZW5kcyB3YXZlRWZmZWN0IHtcclxuICAgICAgICByZXN0cmljdCA9ICdDJztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7XHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JykuZGlyZWN0aXZlKCdjQnV0dG9uJywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqXHJcbiAqIFRhYiBjb21wb25lbnRcclxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3Mgc3dpdGNoaW5nIGJldHdlZW5cclxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMDgvMjAxNlxyXG4gKi9cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGludGVyZmFjZSBUYWJzIHtcclxuICAgICAgICBsYXN0VGFiOiBudW1iZXI7XHJcbiAgICAgICAgYWN0aXZlVGFiOiBudW1iZXI7XHJcbiAgICAgICAgdGFiczogQXJyYXk8T2JqZWN0PjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRhYlRpdGxlU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgICR0YWJzOiBUYWJzQ29udHJvbGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVGFic0NvbnRyb2xsZXIgaW1wbGVtZW50cyBUYWJze1xyXG4gICAgICAgIGFjdGl2ZVRhYiA9IDE7XHJcbiAgICAgICAgdGFicyA9IFtdO1xyXG4gICAgICAgIGxhc3RUYWIgPSAtMTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSwgcHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+ICg8YW55PnRoaXMpLmN1cnJlbnRUYWIsIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzaXplVGFicygpIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBOdW1iZXIgPSAxNjtcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YWJIZWFkZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcclxuICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkVGFiKGhlYWRlciA6IG5nLklBdWdtZW50ZWRKUXVlcnksIGJvZHkgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGxldCBpZHggOiBudW1iZXIgPSB0aGlzLnRhYnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcclxuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcclxuICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGFuZ2VUYWIoZXZlbnQ6IEpRdWVyeUV2ZW50T2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmKGluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0IDogTnVtYmVyO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudCA6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IGkgKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaWR4ID09PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaWR4IDwgdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGVhclRhYihpZHg6IG51bWJlcikge1xyXG4gICAgICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmJsdXIoKTtcclxuICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5ib2R5LnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInLCBbXSkuZGlyZWN0aXZlKCd0ZFRhYnMnLCAoJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUYWI6ICc9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLXRhYlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlci13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlciBqcy10YWJfX2hlYWRlclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50LXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcixcclxuICAgICAgICBsaW5rOiAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXHJcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAxMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYicsICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxyXG4gICAgICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6bmcuSVNjb3BlLCBlbGVtZW50Om5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOm5nLklBdHRyaWJ1dGVzLCBjdHJsOmFueSkge1xyXG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fYm9keScpKTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNsYXNzPVwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlPjwvYnV0dG9uPmAsXHJcbiAgICAgICAgbGluayhzY29wZTogVGhyZWFkLkNvbXBvbmVudHMuVGFiVGl0bGVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImMtdGFiX19ib2R5IGpzLXRhYl9fYm9keVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+J1xyXG4gICAgfTtcclxufSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGluZ3MvYW5ndWxhcmpzL2FuZ3VsYXIuZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgdGhyZWFkIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXHJcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXHJcbiAgICAgICAgJ3RocmVhZC53YXZlRWZmZWN0JyxcclxuICAgICAgICAndGhyZWFkLm1lbnUnLFxyXG4gICAgICAgICd0aHJlYWQudGFiJyxcclxuICAgICAgICAndGhyZWFkLmZsb2F0aW5nTGFiZWwnLFxyXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcclxuICAgICAgICAndGhyZWFkLnByb2RpcycsXHJcbiAgICAgICAgJ3RocmVhZC5zZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxyXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJ1xyXG4gICAgXSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

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
            element.addClass('has-value');
            return;
        }
        $timeout(function () {
            var inputField = angular.element(element[0].querySelector('.c-input__field'));
            var ngModelCtrl = inputField.controller('ngModel');
            if (inputField.prop('tagName') !== 'INPUT') {
                element.addClass('has-value');
            }
            else {
                element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
            }
            if (!inputField.attr('placeholder')) {
                inputField.on('input', function () {
                    element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
                });
            }
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
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var SelectController = (function () {
            function SelectController($element) {
                this.$element = $element;
                this.options = [];
                this.selected = 'Test 1';
            }
            SelectController.prototype.addOption = function (name, model) {
                this.options.push({
                    name: name,
                    model: model
                });
            };
            SelectController.prototype.openOptionList = function () {
                var parentPos = this.$element[0].getBoundingClientRect();
                parentPos.left += document.body.scrollLeft;
                parentPos.top += document.body.scrollTop;
                var optionList = this.$element[0].querySelector('.js-select__menu');
                optionList.style.width = this.$element[0].offsetWidth + "px";
                optionList.style.left = (parentPos.left - 16) + "px";
                optionList.style.top = (parentPos.top - 14) + "px";
                angular.element(optionList).addClass('c-select__menu--open');
            };
            SelectController.prototype.closeOptionList = function () {
                var optionList = this.$element[0].querySelector('.js-select__menu');
                angular.element(optionList).removeClass('c-select__menu--open');
            };
            SelectController.prototype.select = function (option) {
                this.closeOptionList();
            };
            return SelectController;
        }());
        Components.SelectController = SelectController;
        var OptionController = (function () {
            function OptionController() {
            }
            return OptionController;
        }());
        Components.OptionController = OptionController;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.select', []).directive('tdSelect', function () {
    return {
        templateUrl: 'components/select/select.html',
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link: function (scope, element, attrs) {
            // let selectedElement = angular.element(element.querySelector('.js-select__selected'));
        }
    };
});
angular.module('thread.select').directive('tdOption', function () {
    return {
        require: '^tdSelect',
        template: '<option ng-transclude></option>',
        controller: Thread.Components.OptionController,
        replace: true,
        transclude: true,
        link: function (scope, element, attrs, ctrl) {
            ctrl.addOption(element.text(), attrs.value || element.text());
        }
    };
});
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
        'thread.dialog',
        'thread.select'
    ]);
})(thread || (thread = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQ0NwQyxJQUFPLE1BQU0sQ0EwQ1o7QUExQ0QsV0FBTyxNQUFNO0lBQUMsSUFBQSxVQUFVLENBMEN2QjtJQTFDYSxXQUFBLFVBQVUsRUFBQyxDQUFDO1FBTXRCO1lBSUksMEJBQW9CLFFBQThCO2dCQUE5QixhQUFRLEdBQVIsUUFBUSxDQUFzQjtZQUFHLENBQUM7WUFFdEQsa0NBQU8sR0FBUCxjQUFXLENBQUM7WUFFWixnQ0FBSyxHQUFMLFVBQU0sUUFB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TUFBTSxRQWdCWiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xyXG4gICAgICAgIGNsb3NlOiBGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICAgICAgZGVmZXJDYWxsYmFjayA6IG5nLklEZWZlcnJlZDtcclxuICAgICAgICBjYW5jZWxsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge31cclxuXHJcbiAgICAgICAgY2xvc2UocmVzcG9uc2U/IDogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICAgICAgICAgIGlmKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uRGVzdHJveSgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgKCkgPT4ge1xyXG4gICByZXR1cm4ge1xyXG4gICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyLFxyXG4gICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcclxuICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5TZXJ2aWNlcyB7XHJcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nU2VydmljZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHE6IG5nLklRU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBuZy5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAgICAgcHJpdmF0ZSAkY29tcGlsZTogbmcuSUNvbXBpbGVTZXJ2aWNlXHJcbiAgICAgICAgKSB7fVxyXG5cclxuICAgICAgICBvcGVuKG9wdGlvbnMpIDogbmcuSVByb21pc2Uge1xyXG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQgOiBuZy5JRGVmZXJyZWQ7XHJcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICAgICAgbGV0IGRpYWxvZ1Njb3BlIDogVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nU2NvcGU7XHJcblxyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoYFxyXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIiR7b3B0aW9ucy50YXJnZXR9XCJcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cIiR7b3B0aW9ucy50ZW1wbGF0ZX1cIlxyXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxyXG4gICAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUoZGlhbG9nRWxlbWVudCkob3B0aW9ucy5zY29wZSB8fCB0aGlzLiRyb290U2NvcGUpO1xyXG4gICAgICAgICAgICBkaWFsb2dTY29wZSA9IDxUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZT5kaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xyXG5cclxuICAgICAgICAgICAgZGlhbG9nU2NvcGUub3BlbihkZWZlcnJlZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBGbG9hdGluZyBsYWJlbFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XHJcbiAqL1xyXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IG5nLklOZ01vZGVsQ29udHJvbGxlcikge1xyXG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcclxuICAgICAgICAgICAgbGV0IG5nTW9kZWxDdHJsIDogbmcuSU5nTW9kZWxDb250cm9sbGVyID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5wdXRGaWVsZC5wcm9wKCd0YWdOYW1lJykgIT09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2ZvY3VzJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmKG5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdibHVyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnLCBbXSkuZGlyZWN0aXZlKCdmbG9hdGluZ0xhYmVsJywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQycsXHJcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXHJcbiAgICB9XHJcbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElucHV0UmVxdWlyZUF0dHJpYnV0ZXMge1xyXG4gICAgICAgIGhpZGVSZXF1aXJlOiBhbnlcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBUaHJlYWQuQ29tcG9uZW50cy5JbnB1dFJlcXVpcmVBdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcclxuICAgICAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdyZXF1aXJlZCcpIHx8IGF0dHJzLmhpZGVSZXF1aXJlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhaW5wdXRGaWVsZC52YWwoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhdGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIE1lbnVcclxuICogQSBjb21wb25lbnQgdGhhdCBzaG93cy9oaWRlcyBhIGxpc3Qgb2YgaXRlbXMgYmFzZWQgb24gdGFyZ2V0IGNsaWNrXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMDYvMjAxNlxyXG4gKi9cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBNZW51IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgc2NvcGUgPSB7fTtcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXN0cmljdCA9ICdFJztcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyID0gdHJ1ZTtcclxuICAgICAgICBjb250cm9sbGVyQXMgPSAnJG1lbnUnO1xyXG4gICAgICAgIHRlbXBsYXRlID0gYDxkaXYgY2xhc3M9XCJjLW1lbnUganMtbWVudVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1tZW51X19iYWNrZHJvcCBqcy1tZW51X19iYWNrZHJvcFwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuXHJcbiAgICAgICAgbWVudUNvbnRlbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgIGJhY2tkcm9wIDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7fVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XHJcbiAgICAgICAgICAgIGN0cmwuYmFja2Ryb3AgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fYmFja2Ryb3AnKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcclxuICAgICAgICAgICAgICAgY3RybC5tZW51Q29udGVudC5hZGRDbGFzcyhgYy1tZW51X19jb250ZW50LS13aWR0aC0ke2F0dHJzLndpZHRofWApXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbW92ZVRvQm9keScpKSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLm1vdmVUb0JvZHkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbihzcGxpdFBvc1swXSwgc3BsaXRQb3NbMV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGN0cmwubWVudUNvbnRlbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1lbnVfX2l0ZW0nKSkub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiBjdHJsLmNsb3NlKCksIDEwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnRyb2xsZXIoJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHtcclxuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgeVBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9wZW4sXHJcbiAgICAgICAgICAgICAgICBjbG9zZSxcclxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy55UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgTWVudSgkdGltZW91dCk7XHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudVRhcmdldCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gYDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFwiXHJcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxyXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJG1lbnUub3BlbigpXCI+PC9idXR0b24+YDtcclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAoPGFueT5zY29wZSkuJG1lbnUgPSBjdHJsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudVRhcmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudUNvbnRlbnQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9ICc8dWwgY2xhc3M9XCJjLW1lbnVfX2NvbnRlbnQganMtbWVudV9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC91bD4nO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVDb250ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51SXRlbSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51SXRlbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnUnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51LmZhY3RvcnkoKSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpOyIsIi8qKlxyXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXHJcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcclxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxyXG4gKi9cclxuXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgUHJvZGlzQ29udHJvbGxlciB7XHJcbiAgICAgICAgY3VycmVudFNlY3Rpb246IG51bWJlcjtcclxuICAgICAgICBzZWN0aW9uczogYW55W107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ29UbyhzZWN0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVTZWN0aW9ucygpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcclxuICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlZ2lzdGVyU2VjdGlvbihlbGVtZW50LCBuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldFNlY3Rpb25IZWlnaHQoc2VjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSBzZWN0aW9uLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXByb2RpcyBqcy1wcm9kaXNcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLW5hdHVyYWwtbGFuZ3VhZ2VfX3NlY3Rpb24gYy1wcm9kaXNfX3NlY3Rpb24ganMtcHJvZGlzX19zZWN0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLWNvbXBsZXRlJzogJHByb2Rpc1NlY3Rpb24uaXNDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+YCxcclxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAvL3JlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgbGV0ICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcclxuICAgICAgICAgICAgdGhpcy5pZCA9ICRwYXJlbnQucmVnaXN0ZXJTZWN0aW9uKCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXNfX3NlY3Rpb24nKSwgJGF0dHJzLm5hbWUpO1xyXG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgU2Nyb2xsQ29sbGFwc2UgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxhc3RTY3JvbGwgPSAwO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJHdpbmRvdykub24oJ3Njcm9sbCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIGRvd25cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIHVwXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCk6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gKCR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSA9PiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckd2luZG93J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCkpOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgU2VsZWN0Q29udHJvbGxlciB7XHJcbiAgICAgICAgb3B0aW9ucyA9IFtdO1xyXG4gICAgICAgIHNlbGVjdGVkID0gJ1Rlc3QgMSc7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRPcHRpb24obmFtZSwgbW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9wZW5PcHRpb25MaXN0KCkge1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50UG9zID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgcGFyZW50UG9zLmxlZnQgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0O1xyXG4gICAgICAgICAgICBwYXJlbnRQb3MudG9wICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgbGV0IG9wdGlvbkxpc3Q6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLndpZHRoID0gYCR7dGhpcy4kZWxlbWVudFswXS5vZmZzZXRXaWR0aH1weGA7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IGAke3BhcmVudFBvcy5sZWZ0IC0gMTZ9cHhgO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLnRvcCA9IGAke3BhcmVudFBvcy50b3AgLSAxNH1weGA7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5hZGRDbGFzcygnYy1zZWxlY3RfX21lbnUtLW9wZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsb3NlT3B0aW9uTGlzdCgpIHtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbkxpc3Q6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uTGlzdCkucmVtb3ZlQ2xhc3MoJ2Mtc2VsZWN0X19tZW51LS1vcGVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWxlY3Qob3B0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VPcHRpb25MaXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBPcHRpb25Db250cm9sbGVyIHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JywgW10pLmRpcmVjdGl2ZSgndGRTZWxlY3QnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9zZWxlY3Qvc2VsZWN0Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0Q3RybCcsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIC8vIGxldCBzZWxlY3RlZEVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19zZWxlY3RlZCcpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8b3B0aW9uIG5nLXRyYW5zY2x1ZGU+PC9vcHRpb24+JyxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgY3RybC5hZGRPcHRpb24oZWxlbWVudC50ZXh0KCksIGF0dHJzLnZhbHVlIHx8IGVsZW1lbnQudGV4dCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogU2VsZWN0IFJlc2l6ZVxyXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxyXG4gKi9cclxuXHJcbmludGVyZmFjZSBzZWxlY3RSZXNpemVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICByZXNpemVEZWZhdWx0IDogbnVtYmVyO1xyXG4gICAgb25SZXNpemU6IEZ1bmN0aW9uO1xyXG4gICAgcGFyZW50OiBzdHJpbmc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IHNlbGVjdFJlc2l6ZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVsIDogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+ZWxlbWVudFswXTtcclxuICAgICAgICAgICAgICAgIGxldCBhcnJvd1dpZHRoID0gMjQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICg8SFRNTE9wdGlvbkVsZW1lbnQ+ZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSkudGV4dDtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXN0RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuPicpLmh0bWwodGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmQodGVzdEVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aCArIGFycm93V2lkdGh9cHhgO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5vblJlc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogVGFiIGNvbXBvbmVudFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxyXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgaW50ZXJmYWNlIFRhYnMge1xyXG4gICAgICAgIGxhc3RUYWI6IG51bWJlcjtcclxuICAgICAgICBhY3RpdmVUYWI6IG51bWJlcjtcclxuICAgICAgICB0YWJzOiBBcnJheTxPYmplY3Q+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVGl0bGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgJHRhYnM6IFRhYnNDb250cm9sbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYWJzQ29udHJvbGxlciBpbXBsZW1lbnRzIFRhYnN7XHJcbiAgICAgICAgYWN0aXZlVGFiID0gMTtcclxuICAgICAgICB0YWJzID0gW107XHJcbiAgICAgICAgbGFzdFRhYiA9IC0xO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLCBwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gKDxhbnk+dGhpcykuY3VycmVudFRhYiwgKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuYWN0aXZlVGFiID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNpemVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGg6IE51bWJlciA9IDE2O1xyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhYkhlYWRlciA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xyXG4gICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRUYWIoaGVhZGVyIDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYm9keSA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgbGV0IGlkeCA6IG51bWJlciA9IHRoaXMudGFicy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxyXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpKS5hcHBlbmQoaGVhZGVyKTtcclxuXHJcbiAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG4gICAgICAgICAgICBib2R5LmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNoYW5nZVRhYihldmVudDogSlF1ZXJ5RXZlbnRPYmplY3QsIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgaWYoaW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCd0ZC10YWItaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZVRhYnMoKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQgOiBOdW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gaSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSAnJztcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsZWFyVGFiKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuYmx1cigpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlRhYnNDb250cm9sbGVyLFxyXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcclxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XHJcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcclxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogV2F2ZSBlZmZlY3RcclxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbm9XYXZlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcclxuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xyXG4gICAgICAgICAgICBsZXQgaXNGYWIgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1pY29uJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcclxuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0geyBsZWZ0OiBlLmNsaWVudFgsIHRvcDogZS5jbGllbnRZIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gYCR7cG9zLmxlZnQgLSBwYXJlbnRQb3MubGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih3YXZlRWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0MnO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnLCBbXSkuZGlyZWN0aXZlKCd3YXZlRWZmZWN0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdC5mYWN0b3J5KCkpO1xyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKSk7XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSB0aHJlYWQge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcclxuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcclxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxyXG4gICAgICAgICd0aHJlYWQubWVudScsXHJcbiAgICAgICAgJ3RocmVhZC50YWInLFxyXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXHJcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxyXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcclxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxyXG4gICAgICAgICd0aHJlYWQuc2VsZWN0J1xyXG4gICAgXSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

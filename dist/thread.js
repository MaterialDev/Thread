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
        controller: ['$element', Thread.Components.DialogController],
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
                this.controller = ['$scope', '$element', function ($scope, $element) {
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
                    }];
            }
            Menu.factory = function () {
                var directive = function ($timeout) { return new Menu($timeout); };
                return directive;
            };
            Menu.$inject = ['$timeout'];
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
menu.directive('tdMenu', ['$timeout', Thread.Components.Menu.factory()]);
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
        controller: ['$element', '$timeout', Thread.Components.ProdisController]
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
                return directive;
            };
            ScrollCollapse.$inject = ['$window'];
            return ScrollCollapse;
        }());
        Components.ScrollCollapse = ScrollCollapse;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.scrollCollapse', []).directive('scrollCollapse', ['$window', Thread.Components.ScrollCollapse.factory()]);
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
            SelectController.prototype.addOption = function (name, value) {
                this.options.push({
                    name: name,
                    value: value
                });
            };
            SelectController.prototype.openOptionList = function () {
                var parentPos = this.$element[0].getBoundingClientRect();
                parentPos.left += document.body.scrollLeft;
                parentPos.top += document.body.scrollTop;
                var backdrop = this.$element[0].querySelector('.js-select__backdrop');
                var optionList = this.$element[0].querySelector('.js-select__menu');
                optionList.style.width = this.$element[0].offsetWidth + "px";
                optionList.style.left = (parentPos.left - 16) + "px";
                optionList.style.top = (parentPos.top - 14) + "px";
                angular.element(optionList).addClass('is-open');
                angular.element(backdrop).addClass('is-open');
            };
            SelectController.prototype.closeOptionList = function () {
                var optionList = this.$element[0].querySelector('.js-select__menu');
                var backdrop = this.$element[0].querySelector('.js-select__backdrop');
                angular.element(optionList).removeClass('is-open');
                angular.element(backdrop).removeClass('is-open');
            };
            SelectController.prototype.select = function (option) {
                this.model = option.value;
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
        scope: {
            model: '=ngModel'
        },
        template: "<div class=\"c-select c-input__field\" tabindex=\"0\" ng-click=\"$selectCtrl.openOptionList();\">\n                        <div class=\"c-select__backdrop js-select__backdrop\"></div>\n                        <span aria-hidden=\"true\" class=\"c-select__value\">{{$selectCtrl.model || ' '}}</span>\n                        <ul aria-hidden=\"true\" class=\"c-select__menu js-select__menu\">\n                            <li class=\"c-select__menu-item\" ng-repeat=\"option in $selectCtrl.options\"\n                                ng-click=\"$selectCtrl.select(option); $event.stopPropagation()\">{{option.name}}\n                            </li>\n                        </ul>\n                        <i class=\"mi c-select__arrow\" aria-hidden=\"true\">arrow_drop_down</i>\n                        <select class=\"c-select__box\" ng-transclude ng-model=\"$selectCtrl.model\"></select>\n                    </div>",
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link: function (scope, element, attrs, ctrl) {
            var backdrop = angular.element(element[0].querySelector('.js-select__backdrop'));
            backdrop.on('click', function (e) {
                e.stopPropagation();
                ctrl.closeOptionList();
            });
        }
    };
});
angular.module('thread.select').directive('tdOption', function () {
    return {
        scope: true,
        require: '^tdSelect',
        template: '<option ng-transclude ng-value="$selectOptionCtrl.value"></option>',
        controller: Thread.Components.OptionController,
        controllerAs: '$selectOptionCtrl',
        replace: true,
        transclude: true,
        link: function (scope, element, attrs, ctrl) {
            var value = attrs.value || element.text().replace(/\s/, '');
            scope.$selectOptionCtrl.value = value;
            ctrl.addOption(element.text(), value);
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
        controller: ['$scope', '$element', '$timeout', Thread.Components.TabsController],
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
                return directive;
            };
            waveEffect.$inject = ['$timeout'];
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
                return directive;
            };
            waveEffectButton.$inject = ['$timeout'];
            return waveEffectButton;
        }(waveEffect));
        Components.waveEffectButton = waveEffectButton;
    })(Components = Thread.Components || (Thread.Components = {}));
})(Thread || (Thread = {}));
angular.module('thread.waveEffect', []).directive('waveEffect', Thread.Components.waveEffect.factory());
angular.module('thread.waveEffect').directive('cButton', ['$timeout', Thread.Components.waveEffectButton.factory()]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2Zsb2F0aW5nTGFiZWwvZmxvYXRpbmdMYWJlbC5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0NoQyxJQUFP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R0osaUJBQUEsVUFBUCxZQUFBO2dCQUNJLElBQUksWUFBWSxVQUFDLFVBQTRCLEVBQUssT0FBQSxJQUFJLE9BQU8sV0FBVyxpQkFBaUI7Z0JBQ3pGLE9BQU87O1lBSkosaUJBQUEsVUFBVSxDQUFDO1lBTXRCLE9BQUE7VUFSc0M7UUFBekIsV0FBQSxtQkFBZ0I7T0FuSG5CLGFBQUEsT0FBQSxlQUFBLE9BQUEsYUFBVTtHQUFqQixXQUFBLFNBQU07QUE4SGIsUUFBUSxPQUFPLHFCQUFxQixJQUFJLFVBQVUsY0FBYyxPQUFPLFdBQVcsV0FBVztBQUM3RixRQUFRLE9BQU8scUJBQXFCLFVBQVUsV0FBVyxDQUFDLFlBQVksT0FBTyxXQUFXLGlCQUFpQjs7QUNwSXpHLElBQU87QUFBUCxDQUFBLFVBQU8sUUFBTztJQUNWO0lBRUEsUUFBUSxPQUFPLFVBQVU7UUFDckI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7R0FkRCxXQUFBLFNBQU07QWRtOEJiIiwiZmlsZSI6InRocmVhZC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnLCBbXSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIERpYWxvZ0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gRGlhbG9nQ29udHJvbGxlcigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7IH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuJG9uRGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gRGlhbG9nQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyID0gRGlhbG9nQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuZGlyZWN0aXZlKCd0ZERpYWxvZycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsIFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXJdLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xuICAgIH07XG59KTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBTZXJ2aWNlcztcbiAgICAoZnVuY3Rpb24gKFNlcnZpY2VzKSB7XG4gICAgICAgIHZhciBEaWFsb2dTZXJ2aWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIERpYWxvZ1NlcnZpY2UoJHEsICRyb290U2NvcGUsICRjb21waWxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kcSA9ICRxO1xuICAgICAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nU2VydmljZS5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dFbGVtZW50O1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dTY29wZTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KFwiXFxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cXFwiXCIgKyBvcHRpb25zLnRhcmdldCArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU9XFxcIlwiICsgb3B0aW9ucy50ZW1wbGF0ZSArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICA+PC90ZC1kaWFsb2c+XFxuICAgICAgICAgICAgXCIpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XG4gICAgICAgICAgICAgICAgZGlhbG9nU2NvcGUgPSBkaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dTZXJ2aWNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBTZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlID0gRGlhbG9nU2VydmljZTtcbiAgICB9KShTZXJ2aWNlcyA9IFRocmVhZC5TZXJ2aWNlcyB8fCAoVGhyZWFkLlNlcnZpY2VzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTtcbi8qKlxuICogRmxvYXRpbmcgbGFiZWxcbiAqIEEgY29tcG9uZW50IHRoYXQgY29udHJvbHMgbGFiZWwgaW50ZXJhY3Rpb25zIG9uIGlucHV0IGZpZWxkc1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTMvMjAxNlxuICovXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBfZmxvYXRpbmdMYWJlbExpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgIGlmIChhdHRycy5ub0Zsb2F0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEZpZWxkID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgdmFyIG5nTW9kZWxDdHJsID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XG4gICAgICAgICAgICBpZiAoaW5wdXRGaWVsZC5wcm9wKCd0YWdOYW1lJykgIT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChuZ01vZGVsQ3RybCkge1xuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhdmFsdWUgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdmb2N1cycpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdibHVyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsIFtdKS5kaXJlY3RpdmUoJ2Zsb2F0aW5nTGFiZWwnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsIGZ1bmN0aW9uICgkd2luZG93LCAkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgYmFja2dyb3VuZEVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwianMtcGFnZV9fYmFja2dyb3VuZCBsLXBhZ2VfX2JhY2tncm91bmRcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzEgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXRvZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25hbEhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyA2NDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhaW5wdXRGaWVsZC52YWwoKSk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIE1lbnVcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDYvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIE1lbnUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudSgkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnRSc7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kVG9Db250cm9sbGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXJBcyA9ICckbWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IFwiPGRpdiBjbGFzcz1cXFwiYy1tZW51IGpzLW1lbnVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlwiO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoXCJjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLVwiICsgYXR0cnMud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbW92ZVRvQm9keScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1vdmVUb0JvZHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdFBvcyA9IGF0dHJzLnBvc2l0aW9uLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKCd0b3AnLCAnbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGN0cmwubWVudUNvbnRlbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1lbnVfX2l0ZW0nKSkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gY3RybC5jbG9zZSgpOyB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlciA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Cb2R5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbjogb3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogY2xvc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UG9zaXRpb246IHNldFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVUb0JvZHk6IG1vdmVUb0JvZHlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmFja2Ryb3AgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfMSA9IHRhcmdldFBvcy50b3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcF8xID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUubGVmdCA9IChsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSAodG9wXzEgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoeVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnlQb3MgPSB5UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdqcy1tZW51X19jb250ZW50LS1vbi1ib2R5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IE1lbnUoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgTWVudS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIE1lbnU7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudSA9IE1lbnU7XG4gICAgICAgIHZhciBNZW51VGFyZ2V0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVUYXJnZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gXCI8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cXFwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XFxcIiRtZW51Lm9wZW4oKVxcXCI+PC9idXR0b24+XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kbWVudSA9IGN0cmw7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVUYXJnZXQuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVUYXJnZXQoKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudVRhcmdldDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51VGFyZ2V0ID0gTWVudVRhcmdldDtcbiAgICAgICAgdmFyIE1lbnVDb250ZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVDb250ZW50KCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9ICc8dWwgY2xhc3M9XCJjLW1lbnVfX2NvbnRlbnQganMtbWVudV9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC91bD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudUNvbnRlbnQuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVDb250ZW50KCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVDb250ZW50O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVDb250ZW50ID0gTWVudUNvbnRlbnQ7XG4gICAgICAgIHZhciBNZW51SXRlbSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51SXRlbSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudUl0ZW0uZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVJdGVtKCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVJdGVtO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVJdGVtID0gTWVudUl0ZW07XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG52YXIgbWVudSA9IGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQubWVudScsIFtdKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnUnLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudS5mYWN0b3J5KCldKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51Q29udGVudCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVDb250ZW50LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7XG4vKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFByb2Rpc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gUHJvZGlzQ29udHJvbGxlcigkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdvVG8gPSBmdW5jdGlvbiAoc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbaV0ubmFtZSA9PT0gc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldEN1cnJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2VjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHByb2Rpc0VsO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2Rpc0VsID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzJyk7XG4gICAgICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnJlZ2lzdGVyU2VjdGlvbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWN0aW9uSGVpZ2h0ID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VjdGlvbi5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gUHJvZGlzQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyID0gUHJvZGlzQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1wcm9kaXMganMtcHJvZGlzXFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcIntcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cXG4gICAgICAgICAgICAgICAgICAgICAgICB9XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlwiLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcbiAgICAgICAgICAgIHRoaXMuaWQgPSAkcGFyZW50LnJlZ2lzdGVyU2VjdGlvbigkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzX19zZWN0aW9uJyksICRhdHRycy5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFNjcm9sbENvbGxhcHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdBJztcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0U2Nyb2xsID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KF90aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Nyb2xsIDwgbGFzdFNjcm9sbCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNjcm9sbENvbGxhcHNlLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkd2luZG93KSB7IHJldHVybiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTY3JvbGxDb2xsYXBzZS4kaW5qZWN0ID0gWyckd2luZG93J107XG4gICAgICAgICAgICByZXR1cm4gU2Nyb2xsQ29sbGFwc2U7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UgPSBTY3JvbGxDb2xsYXBzZTtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFsnJHdpbmRvdycsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKV0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBTZWxlY3RDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFNlbGVjdENvbnRyb2xsZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9ICdUZXN0IDEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuYWRkT3B0aW9uID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuT3B0aW9uTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50UG9zID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICAgICAgcGFyZW50UG9zLnRvcCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbkxpc3QgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLndpZHRoID0gdGhpcy4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLmxlZnQgPSAocGFyZW50UG9zLmxlZnQgLSAxNikgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS50b3AgPSAocGFyZW50UG9zLnRvcCAtIDE0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uTGlzdCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VPcHRpb25MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25MaXN0ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIgPSBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB2YXIgT3B0aW9uQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBPcHRpb25Db250cm9sbGVyKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuT3B0aW9uQ29udHJvbGxlciA9IE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLXNlbGVjdCBjLWlucHV0X19maWVsZFxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5vcGVuT3B0aW9uTGlzdCgpO1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1zZWxlY3RfX2JhY2tkcm9wIGpzLXNlbGVjdF9fYmFja2Ryb3BcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiYy1zZWxlY3RfX3ZhbHVlXFxcIj57eyRzZWxlY3RDdHJsLm1vZGVsIHx8ICcgJ319PC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImMtc2VsZWN0X19tZW51IGpzLXNlbGVjdF9fbWVudVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cXFwiYy1zZWxlY3RfX21lbnUtaXRlbVxcXCIgbmctcmVwZWF0PVxcXCJvcHRpb24gaW4gJHNlbGVjdEN0cmwub3B0aW9uc1xcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXFxcIj57e29wdGlvbi5uYW1lfX1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJtaSBjLXNlbGVjdF9fYXJyb3dcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj5hcnJvd19kcm9wX2Rvd248L2k+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cXFwiYy1zZWxlY3RfX2JveFxcXCIgbmctdHJhbnNjbHVkZSBuZy1tb2RlbD1cXFwiJHNlbGVjdEN0cmwubW9kZWxcXFwiPjwvc2VsZWN0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RDdHJsJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnKS5kaXJlY3RpdmUoJ3RkT3B0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkU2VsZWN0JyxcbiAgICAgICAgdGVtcGxhdGU6ICc8b3B0aW9uIG5nLXRyYW5zY2x1ZGUgbmctdmFsdWU9XCIkc2VsZWN0T3B0aW9uQ3RybC52YWx1ZVwiPjwvb3B0aW9uPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RPcHRpb25DdHJsJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIFNlbGVjdCBSZXNpemVcbiAqIEF1dG9tYXRpY2FsbHkgcmVzaXplcyBzZWxlY3QgZWxlbWVudHMgdG8gZml0IHRoZSB0ZXh0IGV4YWN0bHlcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnLCBbXSkuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemVQYXJlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdldEVsZW1lbnQgPSBnZXRFbGVtZW50O1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScpLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xuICAgICAgICAgICAgICAgIHZhciBlbCA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgdmFyIGFycm93V2lkdGggPSAyNDtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0udGV4dDtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+JykuaHRtbCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudF8xID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50XzEuYXBwZW5kKHRlc3RFbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gKHdpZHRoICsgYXJyb3dXaWR0aCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLm9uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgVGFic0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gVGFic0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLmN1cnJlbnRUYWI7IH0sIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUucmVzaXplVGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAxNjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGFiSGVhZGVyID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVGFiID0gZnVuY3Rpb24gKGhlYWRlciwgYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSB0aGlzLnRhYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmNoYW5nZVRhYiA9IGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWR4ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2xlYXJUYWIgPSBmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFRhYnNDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlRhYnNDb250cm9sbGVyID0gVGFic0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsIGZ1bmN0aW9uICgkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtdGFiXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcl0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGJ1dHRvbiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5cIixcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pO1xuLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdmVFZmZlY3QoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciB3YXZlRWw7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWItbWluaScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IChwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IChwb3MudG9wIC0gcGFyZW50UG9zLnRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F2ZUVmZmVjdC4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3Q7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMud2F2ZUVmZmVjdCA9IHdhdmVFZmZlY3Q7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0QnV0dG9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyh3YXZlRWZmZWN0QnV0dG9uLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdEJ1dHRvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdmVFZmZlY3RCdXR0b24uJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiB3YXZlRWZmZWN0QnV0dG9uO1xuICAgICAgICB9KHdhdmVFZmZlY3QpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uID0gd2F2ZUVmZmVjdEJ1dHRvbjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCldKTtcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxudmFyIHRocmVhZDtcbihmdW5jdGlvbiAodGhyZWFkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXG4gICAgICAgICd0aHJlYWQud2F2ZUVmZmVjdCcsXG4gICAgICAgICd0aHJlYWQubWVudScsXG4gICAgICAgICd0aHJlYWQudGFiJyxcbiAgICAgICAgJ3RocmVhZC5mbG9hdGluZ0xhYmVsJyxcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxuICAgICAgICAndGhyZWFkLnByb2RpcycsXG4gICAgICAgICd0aHJlYWQuc2VsZWN0UmVzaXplJyxcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3QnXG4gICAgXSk7XG59KSh0aHJlYWQgfHwgKHRocmVhZCA9IHt9KSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xyXG4gICAgICAgIGNsb3NlOiBGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGlhbG9nQ29udHJvbGxlciB7XHJcbiAgICAgICAgZGVmZXJDYWxsYmFjayA6IG5nLklEZWZlcnJlZDtcclxuICAgICAgICBjYW5jZWxsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge31cclxuXHJcbiAgICAgICAgY2xvc2UocmVzcG9uc2U/IDogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICAgICAgICAgIGlmKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uRGVzdHJveSgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgKCkgPT4ge1xyXG4gICByZXR1cm4ge1xyXG4gICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlcl0sXHJcbiAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xyXG4gICB9O1xyXG59KTsiLCJtb2R1bGUgVGhyZWFkLlNlcnZpY2VzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dTZXJ2aWNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkcTogbmcuSVFTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcclxuICAgICAgICApIHt9XHJcblxyXG4gICAgICAgIG9wZW4ob3B0aW9ucykgOiBuZy5JUHJvbWlzZSB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZCA6IG5nLklEZWZlcnJlZDtcclxuICAgICAgICAgICAgbGV0IGRpYWxvZ0VsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgICAgICBsZXQgZGlhbG9nU2NvcGUgOiBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZTtcclxuXHJcbiAgICAgICAgICAgIGRlZmVycmVkID0gdGhpcy4kcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXHJcbiAgICAgICAgICAgICAgICA8dGQtZGlhbG9nXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiJHtvcHRpb25zLnRhcmdldH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXHJcbiAgICAgICAgICAgICAgICA+PC90ZC1kaWFsb2c+XHJcbiAgICAgICAgICAgIGApO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaWFsb2dFbGVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XHJcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XHJcblxyXG4gICAgICAgICAgICBkaWFsb2dTY29wZS5vcGVuKGRlZmVycmVkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsIi8qKlxyXG4gKiBGbG9hdGluZyBsYWJlbFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XHJcbiAqL1xyXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IG5nLklOZ01vZGVsQ29udHJvbGxlcikge1xyXG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcclxuICAgICAgICAgICAgbGV0IG5nTW9kZWxDdHJsIDogbmcuSU5nTW9kZWxDb250cm9sbGVyID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5wdXRGaWVsZC5wcm9wKCd0YWdOYW1lJykgIT09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2ZvY3VzJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmKG5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdibHVyJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnLCBbXSkuZGlyZWN0aXZlKCdmbG9hdGluZ0xhYmVsJywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgKCR0aW1lb3V0KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQycsXHJcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXHJcbiAgICB9XHJcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSkge1xyXG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXHJcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgMTApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKX1weGA7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIG9wdGlvbmFsSGVpZ2h0OiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmYgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1tkeW5hbWljLWJhY2tncm91bmQtZW5kXScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCFjdXRvZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmUmVjdCA9IGN1dG9mZi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihvcHRpb25hbEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgNjQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XHJcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IFRocmVhZC5Db21wb25lbnRzLklucHV0UmVxdWlyZUF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogTWVudVxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wNi8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICBzY29wZSA9IHt9O1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xyXG4gICAgICAgIGNvbnRyb2xsZXJBcyA9ICckbWVudSc7XHJcbiAgICAgICAgdGVtcGxhdGUgPSBgPGRpdiBjbGFzcz1cImMtbWVudSBqcy1tZW51XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG5cclxuICAgICAgICBtZW51Q29udGVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgYmFja2Ryb3AgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHt9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcclxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnd2lkdGgnKSkge1xyXG4gICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKGBjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLSR7YXR0cnMud2lkdGh9YClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdtb3ZlVG9Cb2R5JykpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzcGxpdFBvcyA9IGF0dHJzLnBvc2l0aW9uLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKCd0b3AnLCAnbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY3RybC5tZW51Q29udGVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbWVudV9faXRlbScpKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29udHJvbGxlciA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgZnVuY3Rpb24oJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHtcclxuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgeVBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9wZW4sXHJcbiAgICAgICAgICAgICAgICBjbG9zZSxcclxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy55UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBNZW51KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVUYXJnZXQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcclxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRtZW51Lm9wZW4oKVwiPjwvYnV0dG9uPmA7XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgKDxhbnk+c2NvcGUpLiRtZW51ID0gY3RybDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVDb250ZW50IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51Q29udGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudUl0ZW0gaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUl0ZW0oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpOyIsIi8qKlxyXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXHJcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcclxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxyXG4gKi9cclxuXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgUHJvZGlzQ29udHJvbGxlciB7XHJcbiAgICAgICAgY3VycmVudFNlY3Rpb246IG51bWJlcjtcclxuICAgICAgICBzZWN0aW9uczogYW55W107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ29UbyhzZWN0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVTZWN0aW9ucygpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcclxuICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlZ2lzdGVyU2VjdGlvbihlbGVtZW50LCBuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldFNlY3Rpb25IZWlnaHQoc2VjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSBzZWN0aW9uLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXByb2RpcyBqcy1wcm9kaXNcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxyXG4gICAgICAgIHJlcXVpcmU6ICdecHJvZGlzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckd2luZG93J107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0U2Nyb2xsID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcclxuICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyB1cFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9ICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSkgPT4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgWyckd2luZG93JywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpXSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTZWxlY3RDb250cm9sbGVyIHtcclxuICAgICAgICBvcHRpb25zID0gW107XHJcbiAgICAgICAgc2VsZWN0ZWQgPSAnVGVzdCAxJztcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFkZE9wdGlvbihuYW1lLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3Blbk9wdGlvbkxpc3QoKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgIHBhcmVudFBvcy50b3AgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmFja2Ryb3A6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbkxpc3Q6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLndpZHRoID0gYCR7dGhpcy4kZWxlbWVudFswXS5vZmZzZXRXaWR0aH1weGA7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IGAke3BhcmVudFBvcy5sZWZ0IC0gMTZ9cHhgO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLnRvcCA9IGAke3BhcmVudFBvcy50b3AgLSAxNH1weGA7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbG9zZU9wdGlvbkxpc3QoKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb25MaXN0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcclxuICAgICAgICAgICAgbGV0IGJhY2tkcm9wOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWxlY3Qob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICg8YW55PnRoaXMpLm1vZGVsID0gb3B0aW9uLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgT3B0aW9uQ29udHJvbGxlciB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1zZWxlY3QgYy1pbnB1dF9fZmllbGRcIiB0YWJpbmRleD1cIjBcIiBuZy1jbGljaz1cIiRzZWxlY3RDdHJsLm9wZW5PcHRpb25MaXN0KCk7XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXNlbGVjdF9fYmFja2Ryb3AganMtc2VsZWN0X19iYWNrZHJvcFwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBjbGFzcz1cImMtc2VsZWN0X192YWx1ZVwiPnt7JHNlbGVjdEN0cmwubW9kZWwgfHwgJyAnfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBhcmlhLWhpZGRlbj1cInRydWVcIiBjbGFzcz1cImMtc2VsZWN0X19tZW51IGpzLXNlbGVjdF9fbWVudVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiYy1zZWxlY3RfX21lbnUtaXRlbVwiIG5nLXJlcGVhdD1cIm9wdGlvbiBpbiAkc2VsZWN0Q3RybC5vcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRzZWxlY3RDdHJsLnNlbGVjdChvcHRpb24pOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIj57e29wdGlvbi5uYW1lfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwibWkgYy1zZWxlY3RfX2Fycm93XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+YXJyb3dfZHJvcF9kb3duPC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiYy1zZWxlY3RfX2JveFwiIG5nLXRyYW5zY2x1ZGUgbmctbW9kZWw9XCIkc2VsZWN0Q3RybC5tb2RlbFwiPjwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcixcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RDdHJsJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XHJcblxyXG4gICAgICAgICAgICBiYWNrZHJvcC5vbignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnKS5kaXJlY3RpdmUoJ3RkT3B0aW9uJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkU2VsZWN0JyxcclxuICAgICAgICB0ZW1wbGF0ZTogJzxvcHRpb24gbmctdHJhbnNjbHVkZSBuZy12YWx1ZT1cIiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlXCI+PC9vcHRpb24+JyxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RPcHRpb25DdHJsJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTogYW55LCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55LCBjdHJsOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGF0dHJzLnZhbHVlIHx8IGVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL1xccy8sICcnKTtcclxuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgY3RybC5hZGRPcHRpb24oZWxlbWVudC50ZXh0KCksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogU2VsZWN0IFJlc2l6ZVxyXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxyXG4gKi9cclxuXHJcbmludGVyZmFjZSBzZWxlY3RSZXNpemVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICByZXNpemVEZWZhdWx0IDogbnVtYmVyO1xyXG4gICAgb25SZXNpemU6IEZ1bmN0aW9uO1xyXG4gICAgcGFyZW50OiBzdHJpbmc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IHNlbGVjdFJlc2l6ZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVsIDogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+ZWxlbWVudFswXTtcclxuICAgICAgICAgICAgICAgIGxldCBhcnJvd1dpZHRoID0gMjQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICg8SFRNTE9wdGlvbkVsZW1lbnQ+ZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSkudGV4dDtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXN0RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuPicpLmh0bWwodGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmQodGVzdEVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aCArIGFycm93V2lkdGh9cHhgO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5vblJlc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogVGFiIGNvbXBvbmVudFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxyXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgaW50ZXJmYWNlIFRhYnMge1xyXG4gICAgICAgIGxhc3RUYWI6IG51bWJlcjtcclxuICAgICAgICBhY3RpdmVUYWI6IG51bWJlcjtcclxuICAgICAgICB0YWJzOiBBcnJheTxPYmplY3Q+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVGl0bGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgJHRhYnM6IFRhYnNDb250cm9sbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYWJzQ29udHJvbGxlciBpbXBsZW1lbnRzIFRhYnN7XHJcbiAgICAgICAgYWN0aXZlVGFiID0gMTtcclxuICAgICAgICB0YWJzID0gW107XHJcbiAgICAgICAgbGFzdFRhYiA9IC0xO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLCBwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gKDxhbnk+dGhpcykuY3VycmVudFRhYiwgKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuYWN0aXZlVGFiID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNpemVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGg6IE51bWJlciA9IDE2O1xyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhYkhlYWRlciA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xyXG4gICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRUYWIoaGVhZGVyIDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYm9keSA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgbGV0IGlkeCA6IG51bWJlciA9IHRoaXMudGFicy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxyXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpKS5hcHBlbmQoaGVhZGVyKTtcclxuXHJcbiAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG4gICAgICAgICAgICBib2R5LmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNoYW5nZVRhYihldmVudDogSlF1ZXJ5RXZlbnRPYmplY3QsIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgaWYoaW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCd0ZC10YWItaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZVRhYnMoKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQgOiBOdW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gaSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSAnJztcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsZWFyVGFiKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuYmx1cigpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXJdLFxyXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcclxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XHJcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcclxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogV2F2ZSBlZmZlY3RcclxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbm9XYXZlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcclxuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xyXG4gICAgICAgICAgICBsZXQgaXNGYWIgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1pY29uJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcclxuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0geyBsZWZ0OiBlLmNsaWVudFgsIHRvcDogZS5jbGllbnRZIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gYCR7cG9zLmxlZnQgLSBwYXJlbnRQb3MubGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih3YXZlRWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyB3YXZlRWZmZWN0QnV0dG9uIGV4dGVuZHMgd2F2ZUVmZmVjdCB7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnQyc7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JykuZGlyZWN0aXZlKCdjQnV0dG9uJywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24uZmFjdG9yeSgpXSk7XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSB0aHJlYWQge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcclxuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcclxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxyXG4gICAgICAgICd0aHJlYWQubWVudScsXHJcbiAgICAgICAgJ3RocmVhZC50YWInLFxyXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXHJcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxyXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcclxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxyXG4gICAgICAgICd0aHJlYWQuc2VsZWN0J1xyXG4gICAgXSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

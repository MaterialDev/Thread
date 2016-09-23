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
var SelectController = Thread.Components.SelectController;
var Thread;
(function (Thread) {
    var Components;
    (function (Components) {
        var OptionModel = (function () {
            function OptionModel(name, value) {
                this.name = name;
                this.value = value;
                this.isHighlighted = false;
            }
            return OptionModel;
        }());
        Components.OptionModel = OptionModel;
        var SelectController = (function () {
            function SelectController($element) {
                this.$element = $element;
                this.options = [];
            }
            SelectController.prototype.addOption = function (name, value) {
                this.options.push(new OptionModel(name, value));
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
                if (this.selected) {
                    this.selected.isHighlighted = true;
                }
                this.isOpen = true;
            };
            SelectController.prototype.closeOptionList = function () {
                var optionList = this.$element[0].querySelector('.js-select__menu');
                var backdrop = this.$element[0].querySelector('.js-select__backdrop');
                angular.element(optionList).removeClass('is-open');
                angular.element(backdrop).removeClass('is-open');
                this.isOpen = false;
            };
            SelectController.prototype.select = function (option) {
                this.selected = option;
                this.model = option.value;
                this.closeOptionList();
            };
            SelectController.prototype.highlightNext = function () {
                var idx = -1;
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].isHighlighted) {
                        idx = i;
                        this.options[i].isHighlighted = false;
                        break;
                    }
                }
                if (idx >= this.options.length - 1 || idx == -1) {
                    idx = 0;
                }
                else {
                    idx += 1;
                }
                this.unHighlightAll();
                this.selected = this.options[idx];
                this.options[idx].isHighlighted = true;
            };
            SelectController.prototype.highlightPrev = function () {
                var idx = -1;
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].isHighlighted) {
                        idx = i;
                        this.options[i].isHighlighted = false;
                        break;
                    }
                }
                if (idx <= 0) {
                    idx = this.options.length - 1;
                }
                else {
                    idx -= 1;
                }
                this.selected = this.options[idx];
                this.options[idx].isHighlighted = true;
            };
            SelectController.prototype.getHighlighted = function () {
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].isHighlighted) {
                        return this.options[i];
                    }
                }
            };
            SelectController.prototype.unHighlightAll = function () {
                for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
                    var option = _a[_i];
                    option.isHighlighted = false;
                }
                this.selected = null;
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
angular.module('thread.select', []).directive('tdSelect', ["$timeout", function ($timeout) {
    return {
        scope: {
            model: '=ngModel'
        },
        template: "<div class=\"c-select c-input__field js-select\" tabindex=\"0\" ng-click=\"$selectCtrl.openOptionList();\">\n                        <div class=\"c-select__backdrop js-select__backdrop\"></div>\n                        <span aria-hidden=\"true\" class=\"c-select__value\">{{$selectCtrl.model || ' '}}</span>\n                        <ul aria-hidden=\"true\" class=\"c-select__menu js-select__menu\">\n                            <li class=\"c-select__menu-item js-select__menu-item\" ng-repeat=\"option in $selectCtrl.options\" ng-class=\"{'has-focus': option.isHighlighted}\"\n                                ng-click=\"$selectCtrl.select(option); $event.stopPropagation()\">{{option.name}} {{option.isHighlighted}}\n                            </li>\n                        </ul>\n                        <i class=\"mi c-select__arrow\" aria-hidden=\"true\">arrow_drop_down</i>\n                        <select class=\"c-select__box\" ng-transclude ng-model=\"$selectCtrl.model\" tabindex=\"-1\"></select>\n                    </div>",
        controller: Thread.Components.SelectController,
        bindToController: true,
        controllerAs: '$selectCtrl',
        transclude: true,
        replace: true,
        link: function (scope, element, attrs, ctrl) {
            var backdrop = angular.element(element[0].querySelector('.js-select__backdrop'));
            $timeout(function () {
                var option = angular.element(element[0].querySelectorAll('.js-select__menu-item'));
                option.on('mouseenter mouseleave', function () {
                    ctrl.unHighlightAll();
                    scope.$apply();
                });
            });
            backdrop.on('click', function (e) {
                e.stopPropagation();
                ctrl.closeOptionList();
            });
            element.on('keyup', function (e) {
                switch (e.which) {
                    case 38: //arrow up
                    case 37:
                        if (!ctrl.isOpen)
                            ctrl.openOptionList();
                        ctrl.highlightPrev();
                        scope.$apply();
                        break;
                    case 39: //arrow right
                    case 40:
                        if (!ctrl.isOpen)
                            ctrl.openOptionList();
                        ctrl.highlightNext();
                        scope.$apply();
                        break;
                    case 32:
                        ctrl.isOpen ? ctrl.closeOptionList() : ctrl.openOptionList();
                        scope.$apply();
                        break;
                    case 13:
                        if (ctrl.isOpen && ctrl.selected) {
                            ctrl.select(ctrl.selected);
                            scope.$apply();
                        }
                        break;
                }
            });
        }
    };
}]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0NoQyxJQUFP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QUFBLGFBQVU7R0FBakIsV0FBQSxTQUFNO0FBOEhiLFFBQVEsT0FBTyxxQkFBcUIsSUFBSSxVQUFVLGNBQWMsT0FBTyxXQUFXLFdBQVc7QUFDN0YsUUFBUSxPQUFPLHFCQUFxQixVQUFVLFdBQVcsQ0FBQyxZQUFZLE9BQU8sV0FBVyxpQkFBaUI7O0FDcEl6RyxJQUFPO0FBQVAsQ0FBQSxVQUFPLFFBQU87SUFDVjtJQUVBLFFBQVEsT0FBTyxVQUFVO1FBQ3JCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O0dBZEQsV0FBQSxTQUFNO0FkcWlDYiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xufTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBEaWFsb2dDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIERpYWxvZ0NvbnRyb2xsZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkgeyB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrID0gZGVmZXJyZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIERpYWxvZ0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlciA9IERpYWxvZ0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyXSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcbiAgICB9O1xufSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgU2VydmljZXM7XG4gICAgKGZ1bmN0aW9uIChTZXJ2aWNlcykge1xuICAgICAgICB2YXIgRGlhbG9nU2VydmljZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBEaWFsb2dTZXJ2aWNlKCRxLCAkcm9vdFNjb3BlLCAkY29tcGlsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHEgPSAkcTtcbiAgICAgICAgICAgICAgICB0aGlzLiRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIERpYWxvZ1NlcnZpY2UucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nRWxlbWVudDtcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nU2NvcGU7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSB0aGlzLiRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChcIlxcbiAgICAgICAgICAgICAgICA8dGQtZGlhbG9nXFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XFxcIlwiICsgb3B0aW9ucy50YXJnZXQgKyBcIlxcXCJcXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVxcXCJcIiArIG9wdGlvbnMudGVtcGxhdGUgKyBcIlxcXCJcXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxcbiAgICAgICAgICAgIFwiKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpYWxvZ0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUoZGlhbG9nRWxlbWVudCkob3B0aW9ucy5zY29wZSB8fCB0aGlzLiRyb290U2NvcGUpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gZGlhbG9nRWxlbWVudC5pc29sYXRlU2NvcGUoKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dTY29wZS5vcGVuKGRlZmVycmVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gRGlhbG9nU2VydmljZTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgU2VydmljZXMuRGlhbG9nU2VydmljZSA9IERpYWxvZ1NlcnZpY2U7XG4gICAgfSkoU2VydmljZXMgPSBUaHJlYWQuU2VydmljZXMgfHwgKFRocmVhZC5TZXJ2aWNlcyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLnNlcnZpY2UoJyRkaWFsb2cnLCBUaHJlYWQuU2VydmljZXMuRGlhbG9nU2VydmljZSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCBmdW5jdGlvbiAoJHdpbmRvdywgJGludGVydmFsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgdmFyIGJhY2tncm91bmRFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWR5Q2hlY2tJbnRlcnZhbF8xID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWxfMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBvcHRpb25hbEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciBjdXRvZmYgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1tkeW5hbWljLWJhY2tncm91bmQtZW5kXScpO1xuICAgICAgICAgICAgICAgIGlmICghY3V0b2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZHluYW1pYyBiYWNrZ3JvdW5kIGVuZCEgUGxlYXNlIGFkZCB0aGUgYXR0cmlidXRlIFwiZHluYW1pYy1iYWNrZ3JvdW5kLWVuZFwiIHRvIGEgY2hpbGQgZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY3V0b2ZmUmVjdCA9IGN1dG9mZi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBvcHRpb25hbEhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgNjQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcGFnZUJhY2tncm91bmQnXG4gICAgfTtcbn0pO1xuLyoqXG4gKiBGbG9hdGluZyBsYWJlbFxuICogQSBjb21wb25lbnQgdGhhdCBjb250cm9scyBsYWJlbCBpbnRlcmFjdGlvbnMgb24gaW5wdXQgZmllbGRzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XG4gKi9cbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgaWYgKGF0dHJzLm5vRmxvYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICB2YXIgbmdNb2RlbEN0cmwgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcbiAgICAgICAgICAgIGlmIChpbnB1dEZpZWxkLnByb3AoJ3RhZ05hbWUnKSAhPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBNZW51ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnUoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0UnO1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcImMtbWVudSBqcy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKFwiYy1tZW51X19jb250ZW50LS13aWR0aC1cIiArIGF0dHJzLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbihzcGxpdFBvc1swXSwgc3BsaXRQb3NbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGN0cmwuY2xvc2UoKTsgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IG9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGNsb3NlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5OiBtb3ZlVG9Cb2R5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tZW51Q29udGVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxlZnQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b3BfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnhQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLnJpZ2h0IC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wXzEgPSB0YXJnZXRQb3MudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfMSA9IHRhcmdldFBvcy5ib3R0b20gLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSAobGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUudG9wID0gKHRvcF8xICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmJvdHRvbSA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnhQb3MgPSB4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5iYWNrZHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBNZW51KCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE1lbnUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBNZW51O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnUgPSBNZW51O1xuICAgICAgICB2YXIgTWVudVRhcmdldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51VGFyZ2V0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IFwiPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XFxcImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFxcXCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkbWVudS5vcGVuKClcXFwiPjwvYnV0dG9uPlwiO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG1lbnUgPSBjdHJsO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51VGFyZ2V0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51VGFyZ2V0KCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVUYXJnZXQ7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudVRhcmdldCA9IE1lbnVUYXJnZXQ7XG4gICAgICAgIHZhciBNZW51Q29udGVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51Q29udGVudCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVDb250ZW50LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51Q29udGVudCgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51Q29udGVudDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51Q29udGVudCA9IE1lbnVDb250ZW50O1xuICAgICAgICB2YXIgTWVudUl0ZW0gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudUl0ZW0oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVJdGVtLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51SXRlbSgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51SXRlbTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51SXRlbSA9IE1lbnVJdGVtO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xudmFyIG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51VGFyZ2V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudVRhcmdldC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpO1xuLyoqXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXG4gKiBBIG5hdHVyYWwgbGFuZ3VhZ2UgY29tcG9uZW50IHRoYXQgc2hvd3Mgb25lXG4gKiBzZWN0aW9uIGF0IGEgdGltZSBjZW50ZXJlZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY3JlZW5cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA2LzE1LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBQcm9kaXNDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFByb2Rpc0NvbnRyb2xsZXIoJGVsZW1lbnQsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgrK3RoaXMuY3VycmVudFNlY3Rpb24gPj0gdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvID0gZnVuY3Rpb24gKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuY3VycmVudFNlY3Rpb247IGkgPCB0aGlzLnNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNlY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBwcm9kaXNFbDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcm9kaXNFbCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xuICAgICAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5yZWdpc3RlclNlY3Rpb24gPSBmdW5jdGlvbiAoZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U2VjdGlvbkhlaWdodCA9IGZ1bmN0aW9uIChzZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICAgICAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlciA9IFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtcHJvZGlzIGpzLXByb2Rpc1xcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXMnLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycpLmRpcmVjdGl2ZSgncHJvZGlzU2VjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VfX3NlY3Rpb24gYy1wcm9kaXNfX3NlY3Rpb24ganMtcHJvZGlzX19zZWN0aW9uXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVxcXCJ7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cIixcbiAgICAgICAgcmVxdWlyZTogJ15wcm9kaXMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBTY3JvbGxDb2xsYXBzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTY3JvbGxDb2xsYXBzZSgkd2luZG93KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQSc7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNjcm9sbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChfdGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTY3JvbGxDb2xsYXBzZS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHdpbmRvdykgeyByZXR1cm4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2Nyb2xsQ29sbGFwc2UuJGluamVjdCA9IFsnJHdpbmRvdyddO1xuICAgICAgICAgICAgcmV0dXJuIFNjcm9sbENvbGxhcHNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNjcm9sbENvbGxhcHNlID0gU2Nyb2xsQ29sbGFwc2U7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBbJyR3aW5kb3cnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCldKTtcbnZhciBTZWxlY3RDb250cm9sbGVyID0gVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcjtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgT3B0aW9uTW9kZWwgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gT3B0aW9uTW9kZWwobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBPcHRpb25Nb2RlbDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5PcHRpb25Nb2RlbCA9IE9wdGlvbk1vZGVsO1xuICAgICAgICB2YXIgU2VsZWN0Q29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTZWxlY3RDb250cm9sbGVyKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuYWRkT3B0aW9uID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2gobmV3IE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUub3Blbk9wdGlvbkxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgcGFyZW50UG9zLmxlZnQgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIHBhcmVudFBvcy50b3AgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25MaXN0ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS53aWR0aCA9IHRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS5sZWZ0ID0gKHBhcmVudFBvcy5sZWZ0IC0gMTYpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUudG9wID0gKHBhcmVudFBvcy50b3AgLSAxNCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGJhY2tkcm9wKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5jbG9zZU9wdGlvbkxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbkxpc3QgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGJhY2tkcm9wKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBvcHRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmhpZ2hsaWdodE5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWR4ID49IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIHx8IGlkeCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudW5IaWdobGlnaHRBbGwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zW2lkeF07XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuaGlnaGxpZ2h0UHJldiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpZHggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zW2lkeF07XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0SGlnaGxpZ2h0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLnVuSGlnaGxpZ2h0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLm9wdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIgPSBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB2YXIgT3B0aW9uQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBPcHRpb25Db250cm9sbGVyKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuT3B0aW9uQ29udHJvbGxlciA9IE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG1vZGVsOiAnPW5nTW9kZWwnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtc2VsZWN0IGMtaW5wdXRfX2ZpZWxkIGpzLXNlbGVjdFxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5vcGVuT3B0aW9uTGlzdCgpO1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1zZWxlY3RfX2JhY2tkcm9wIGpzLXNlbGVjdF9fYmFja2Ryb3BcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiYy1zZWxlY3RfX3ZhbHVlXFxcIj57eyRzZWxlY3RDdHJsLm1vZGVsIHx8ICcgJ319PC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImMtc2VsZWN0X19tZW51IGpzLXNlbGVjdF9fbWVudVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cXFwiYy1zZWxlY3RfX21lbnUtaXRlbSBqcy1zZWxlY3RfX21lbnUtaXRlbVxcXCIgbmctcmVwZWF0PVxcXCJvcHRpb24gaW4gJHNlbGVjdEN0cmwub3B0aW9uc1xcXCIgbmctY2xhc3M9XFxcInsnaGFzLWZvY3VzJzogb3B0aW9uLmlzSGlnaGxpZ2h0ZWR9XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XFxcIiRzZWxlY3RDdHJsLnNlbGVjdChvcHRpb24pOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcXFwiPnt7b3B0aW9uLm5hbWV9fSB7e29wdGlvbi5pc0hpZ2hsaWdodGVkfX1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJtaSBjLXNlbGVjdF9fYXJyb3dcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj5hcnJvd19kcm9wX2Rvd248L2k+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cXFwiYy1zZWxlY3RfX2JveFxcXCIgbmctdHJhbnNjbHVkZSBuZy1tb2RlbD1cXFwiJHNlbGVjdEN0cmwubW9kZWxcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PC9zZWxlY3Q+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdEN0cmwnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNlbGVjdF9fbWVudS1pdGVtJykpO1xuICAgICAgICAgICAgICAgIG9wdGlvbi5vbignbW91c2VlbnRlciBtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OiAvL2Fycm93IHVwXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cmwuaXNPcGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0UHJldigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTogLy9hcnJvdyByaWdodFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodE5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmlzT3BlbiA/IGN0cmwuY2xvc2VPcHRpb25MaXN0KCkgOiBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuaXNPcGVuICYmIGN0cmwuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChjdHJsLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnKS5kaXJlY3RpdmUoJ3RkT3B0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkU2VsZWN0JyxcbiAgICAgICAgdGVtcGxhdGU6ICc8b3B0aW9uIG5nLXRyYW5zY2x1ZGUgbmctdmFsdWU9XCIkc2VsZWN0T3B0aW9uQ3RybC52YWx1ZVwiPjwvb3B0aW9uPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RPcHRpb25DdHJsJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIFNlbGVjdCBSZXNpemVcbiAqIEF1dG9tYXRpY2FsbHkgcmVzaXplcyBzZWxlY3QgZWxlbWVudHMgdG8gZml0IHRoZSB0ZXh0IGV4YWN0bHlcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnLCBbXSkuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemVQYXJlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdldEVsZW1lbnQgPSBnZXRFbGVtZW50O1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScpLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xuICAgICAgICAgICAgICAgIHZhciBlbCA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgdmFyIGFycm93V2lkdGggPSAyNDtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0udGV4dDtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+JykuaHRtbCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudF8xID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50XzEuYXBwZW5kKHRlc3RFbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gKHdpZHRoICsgYXJyb3dXaWR0aCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLm9uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgVGFic0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gVGFic0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLmN1cnJlbnRUYWI7IH0sIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUucmVzaXplVGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAxNjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGFiSGVhZGVyID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVGFiID0gZnVuY3Rpb24gKGhlYWRlciwgYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSB0aGlzLnRhYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmNoYW5nZVRhYiA9IGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWR4ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2xlYXJUYWIgPSBmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFRhYnNDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlRhYnNDb250cm9sbGVyID0gVGFic0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsIGZ1bmN0aW9uICgkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtdGFiXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcl0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGJ1dHRvbiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5cIixcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pO1xuLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdmVFZmZlY3QoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciB3YXZlRWw7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWItbWluaScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IChwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IChwb3MudG9wIC0gcGFyZW50UG9zLnRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F2ZUVmZmVjdC4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3Q7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMud2F2ZUVmZmVjdCA9IHdhdmVFZmZlY3Q7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0QnV0dG9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyh3YXZlRWZmZWN0QnV0dG9uLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdEJ1dHRvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdmVFZmZlY3RCdXR0b24uJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiB3YXZlRWZmZWN0QnV0dG9uO1xuICAgICAgICB9KHdhdmVFZmZlY3QpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uID0gd2F2ZUVmZmVjdEJ1dHRvbjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCldKTtcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxudmFyIHRocmVhZDtcbihmdW5jdGlvbiAodGhyZWFkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXG4gICAgICAgICd0aHJlYWQud2F2ZUVmZmVjdCcsXG4gICAgICAgICd0aHJlYWQubWVudScsXG4gICAgICAgICd0aHJlYWQudGFiJyxcbiAgICAgICAgJ3RocmVhZC5mbG9hdGluZ0xhYmVsJyxcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxuICAgICAgICAndGhyZWFkLnByb2RpcycsXG4gICAgICAgICd0aHJlYWQuc2VsZWN0UmVzaXplJyxcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3QnXG4gICAgXSk7XG59KSh0aHJlYWQgfHwgKHRocmVhZCA9IHt9KSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xuICAgICAgICBjbG9zZTogRnVuY3Rpb247XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRyb2xsZXIge1xuICAgICAgICBkZWZlckNhbGxiYWNrOiBuZy5JRGVmZXJyZWQ8YW55PjtcbiAgICAgICAgY2FuY2VsbGVkOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxuXG4gICAgICAgICRvbkluaXQoKSB7fVxuXG4gICAgICAgIGNsb3NlKHJlc3BvbnNlPyA6IGFueSkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FuY2VsKCkge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgICAgICBpZihkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJG9uRGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuZGlyZWN0aXZlKCd0ZERpYWxvZycsICgpID0+IHtcbiAgIHJldHVybiB7XG4gICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsIFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXJdLFxuICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXG4gICB9O1xufSk7IiwibW9kdWxlIFRocmVhZC5TZXJ2aWNlcyB7XG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHByaXZhdGUgJHE6IG5nLklRU2VydmljZSxcbiAgICAgICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcbiAgICAgICAgKSB7fVxuXG4gICAgICAgIG9wZW4ob3B0aW9ucyk6IG5nLklQcm9taXNlPGFueT4ge1xuICAgICAgICAgICAgbGV0IGRlZmVycmVkOiBuZy5JRGVmZXJyZWQ8YW55PjtcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG5cbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55KSB7XG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG5cbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZHluYW1pYyBiYWNrZ3JvdW5kIGVuZCEgUGxlYXNlIGFkZCB0aGUgYXR0cmlidXRlIFwiZHluYW1pYy1iYWNrZ3JvdW5kLWVuZFwiIHRvIGEgY2hpbGQgZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBvcHRpb25hbEhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTsiLCIvKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgIGxldCBuZ01vZGVsQ3RybCA6IG5nLklOZ01vZGVsQ29udHJvbGxlciA9IGlucHV0RmllbGQuY29udHJvbGxlcignbmdNb2RlbCcpO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXRGaWVsZC5wcm9wKCd0YWdOYW1lJykgIT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdibHVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIXZhbHVlIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdmb2N1cycpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdibHVyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnLCBbXSkuZGlyZWN0aXZlKCdmbG9hdGluZ0xhYmVsJywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH1cbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnB1dFJlcXVpcmVBdHRyaWJ1dGVzIHtcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBUaHJlYWQuQ29tcG9uZW50cy5JbnB1dFJlcXVpcmVBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdyZXF1aXJlZCcpIHx8IGF0dHJzLmhpZGVSZXF1aXJlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhaW5wdXRGaWVsZC52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIvKipcbiAqIE1lbnVcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDYvMjAxNlxuICovXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBjbGFzcyBNZW51IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHNjb3BlID0ge307XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXN0cmljdCA9ICdFJztcbiAgICAgICAgYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgIGNvbnRyb2xsZXJBcyA9ICckbWVudSc7XG4gICAgICAgIHRlbXBsYXRlID0gYDxkaXYgY2xhc3M9XCJjLW1lbnUganMtbWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgICBtZW51Q29udGVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XG4gICAgICAgIGJhY2tkcm9wIDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7fVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnRyb2xsZXIgPSBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uKCRzY29wZTogbmcuSVNjb3BlLCAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgIG9wZW4sXG4gICAgICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgICAgIGxldCBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcDtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSBgJHt0b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcH1weGA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnhQb3MgPSB4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdqcy1tZW51X19jb250ZW50LS1vbi1ib2R5Jyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIGxldCBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IE1lbnUoJHRpbWVvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51VGFyZ2V0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xuICAgICAgICB0ZW1wbGF0ZSA9IGA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XCJcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRtZW51Lm9wZW4oKVwiPjwvYnV0dG9uPmA7XG5cbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgKDxhbnk+c2NvcGUpLiRtZW51ID0gY3RybDtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51VGFyZ2V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgTWVudUNvbnRlbnQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUNvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51SXRlbSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xuXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVJdGVtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmxldCBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51LmZhY3RvcnkoKV0pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVJdGVtJywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUl0ZW0uZmFjdG9yeSgpKTsiLCIvKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG5cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFByb2Rpc0NvbnRyb2xsZXIge1xuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xuICAgICAgICBzZWN0aW9uczogYW55W107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlU2VjdGlvbnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcbiAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlclNlY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTZWN0aW9uSGVpZ2h0KHNlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlX19zZWN0aW9uIGMtcHJvZGlzX19zZWN0aW9uIGpzLXByb2Rpc19fc2VjdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLWNvbXBsZXRlJzogJHByb2Rpc1NlY3Rpb24uaXNDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIGxldCAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFNjcm9sbENvbGxhcHNlIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHdpbmRvdyddO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFzdFNjcm9sbCA9IDA7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG5cbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgdXBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpID0+IG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFsnJHdpbmRvdycsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKV0pOyIsImltcG9ydCBTZWxlY3RDb250cm9sbGVyID0gVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcjtcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbk1vZGVsIHtcbiAgICAgICAgbmFtZTogU3RyaW5nO1xuICAgICAgICB2YWx1ZTogYW55O1xuICAgICAgICBpc0hpZ2hsaWdodGVkOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IFN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFNlbGVjdENvbnRyb2xsZXIge1xuICAgICAgICBvcHRpb25zID0gW107XG4gICAgICAgIHNlbGVjdGVkOiBPcHRpb25Nb2RlbDtcbiAgICAgICAgbW9kZWw6IGFueTtcbiAgICAgICAgaXNPcGVuOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgYWRkT3B0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaChuZXcgT3B0aW9uTW9kZWwobmFtZSwgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW5PcHRpb25MaXN0KCkge1xuICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICBwYXJlbnRQb3MudG9wICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG4gICAgICAgICAgICBsZXQgYmFja2Ryb3A6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25MaXN0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSBgJHt0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRofXB4YDtcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IGAke3BhcmVudFBvcy5sZWZ0IC0gMTZ9cHhgO1xuICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS50b3AgPSBgJHtwYXJlbnRQb3MudG9wIC0gMTR9cHhgO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZC5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xvc2VPcHRpb25MaXN0KCkge1xuICAgICAgICAgICAgbGV0IG9wdGlvbkxpc3Q6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xuICAgICAgICAgICAgbGV0IGJhY2tkcm9wOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uTGlzdCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdChvcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBvcHRpb247XG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhpZ2hsaWdodE5leHQoKSB7XG4gICAgICAgICAgICBsZXQgaWR4OiBudW1iZXIgPSAtMTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaWR4ID49IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIHx8IGlkeCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlkeCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zW2lkeF07XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhpZ2hsaWdodFByZXYoKSB7XG4gICAgICAgICAgICBsZXQgaWR4OiBudW1iZXIgPSAtMTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaWR4IDw9IDApIHtcbiAgICAgICAgICAgICAgICBpZHggPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWR4IC09IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SGlnaGxpZ2h0ZWQoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVuSGlnaGxpZ2h0QWxsKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgICAgIG9wdGlvbi5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbkNvbnRyb2xsZXIge1xuXG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1zZWxlY3QgYy1pbnB1dF9fZmllbGQganMtc2VsZWN0XCIgdGFiaW5kZXg9XCIwXCIgbmctY2xpY2s9XCIkc2VsZWN0Q3RybC5vcGVuT3B0aW9uTGlzdCgpO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc2VsZWN0X19iYWNrZHJvcCBqcy1zZWxlY3RfX2JhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBjbGFzcz1cImMtc2VsZWN0X192YWx1ZVwiPnt7JHNlbGVjdEN0cmwubW9kZWwgfHwgJyAnfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1oaWRkZW49XCJ0cnVlXCIgY2xhc3M9XCJjLXNlbGVjdF9fbWVudSBqcy1zZWxlY3RfX21lbnVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjLXNlbGVjdF9fbWVudS1pdGVtIGpzLXNlbGVjdF9fbWVudS1pdGVtXCIgbmctcmVwZWF0PVwib3B0aW9uIGluICRzZWxlY3RDdHJsLm9wdGlvbnNcIiBuZy1jbGFzcz1cInsnaGFzLWZvY3VzJzogb3B0aW9uLmlzSGlnaGxpZ2h0ZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+e3tvcHRpb24ubmFtZX19IHt7b3B0aW9uLmlzSGlnaGxpZ2h0ZWR9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJtaSBjLXNlbGVjdF9fYXJyb3dcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5hcnJvd19kcm9wX2Rvd248L2k+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiYy1zZWxlY3RfX2JveFwiIG5nLXRyYW5zY2x1ZGUgbmctbW9kZWw9XCIkc2VsZWN0Q3RybC5tb2RlbFwiIHRhYmluZGV4PVwiLTFcIj48L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdEN0cmwnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IFNlbGVjdENvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIGxldCBiYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJykpO1xuXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zZWxlY3RfX21lbnUtaXRlbScpKTtcblxuICAgICAgICAgICAgICAgIG9wdGlvbi5vbignbW91c2VlbnRlciBtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJhY2tkcm9wLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogICAgLy9hcnJvdyB1cFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OiAgICAvL2Fycm93IGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0UHJldigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTogICAgLy9hcnJvdyByaWdodFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOiAgICAvL2Fycm93IGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0TmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjogICAgLy9zcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5pc09wZW4gPyBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpIDogY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzogICAgLy9lbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuaXNPcGVuICYmIGN0cmwuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChjdHJsLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPG9wdGlvbiBuZy10cmFuc2NsdWRlIG5nLXZhbHVlPVwiJHNlbGVjdE9wdGlvbkN0cmwudmFsdWVcIj48L29wdGlvbj4nLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0T3B0aW9uQ3RybCcsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGxpbmsoc2NvcGU6IGFueSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcikge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBTZWxlY3QgUmVzaXplXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xOS8yMDE2XG4gKi9cblxuaW50ZXJmYWNlIHNlbGVjdFJlc2l6ZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICByZXNpemVEZWZhdWx0IDogbnVtYmVyO1xuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcbiAgICBwYXJlbnQ6IHN0cmluZztcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnLCBbXSkuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemVQYXJlbnQnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcigkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmU6ICc/XnNlbGVjdFJlc2l6ZVBhcmVudCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxuICAgICAgICAgICAgcmVzaXplRGVmYXVsdDogJ0AnLFxuICAgICAgICB9LFxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgbGV0IGFycm93V2lkdGggPSAyNDtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICg8SFRNTE9wdGlvbkVsZW1lbnQ+ZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSkudGV4dDtcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XG5cbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gc2NvcGUucmVzaXplRGVmYXVsdCB8fCAxNTA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRoICsgYXJyb3dXaWR0aH1weGA7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25SZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgaW50ZXJmYWNlIFRhYnMge1xuICAgICAgICBsYXN0VGFiOiBudW1iZXI7XG4gICAgICAgIGFjdGl2ZVRhYjogbnVtYmVyO1xuICAgICAgICB0YWJzOiBBcnJheTxPYmplY3Q+O1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVGl0bGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgICAgICR0YWJzOiBUYWJzQ29udHJvbGxlcjtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgVGFic0NvbnRyb2xsZXIgaW1wbGVtZW50cyBUYWJze1xuICAgICAgICBhY3RpdmVUYWIgPSAxO1xuICAgICAgICB0YWJzID0gW107XG4gICAgICAgIGxhc3RUYWIgPSAtMTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLCBwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgJG9uSW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiAoPGFueT50aGlzKS5jdXJyZW50VGFiLCAobmV3VmFsdWUsIG9sZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXNpemVUYWJzKCkge1xuICAgICAgICAgICAgbGV0IHdpZHRoOiBOdW1iZXIgPSAxNjtcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB0YWJIZWFkZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgIHRhYkhlYWRlci5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZFRhYihoZWFkZXIgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBib2R5IDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgbGV0IGlkeCA6IG51bWJlciA9IHRoaXMudGFicy5wdXNoKHtcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuXG4gICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcblxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xuXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYW5nZVRhYihldmVudDogSlF1ZXJ5RXZlbnRPYmplY3QsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgICAgIGlmKGluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoaW5kZXggJiYgaW5kZXggIT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZVRhYnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0IDogTnVtYmVyO1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQgOiBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBpICsgMTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG5cbiAgICAgICAgICAgICAgICBpZihpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRhYihpZHg6IG51bWJlcikge1xuICAgICAgICAgICAgKDxIVE1MRWxlbWVudD5kb2N1bWVudC5hY3RpdmVFbGVtZW50KS5ibHVyKCk7XG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5ib2R5LnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlci13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19oZWFkZXIganMtdGFiX19oZWFkZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50LXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckdGFicycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXJdLFxuICAgICAgICBsaW5rOiAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlYWR5Q2hlY2tJbnRlcnZhbCA9ICRpbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYicsICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XG4gICAgICAgICAgICBsZXQgYm9keSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2JvZHknKSk7XG5cbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmFkZFRhYihoZWFkZXIsIGJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNsYXNzPVwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiR0YWJzLmNoYW5nZVRhYigkZXZlbnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcbiAgICAgICAgbGluayhzY29wZTogVGhyZWFkLkNvbXBvbmVudHMuVGFiVGl0bGVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcbiAgICAgICAgICAgIHNjb3BlLiR0YWJzID0gY3RybDtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pOyIsIi8qKlxuICogV2F2ZSBlZmZlY3RcbiAqIEEgZGlyZWN0aXZlIHRoYXQgc2hvd3MgYSBncm93aW5nIGNpcmNsZSBpbiB0aGUgYmFja2dyb3VuZFxuICogb2YgY29tcG9uZW50cyBpdCdzIGF0dGFjaGVkIHRvXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMS8yMDE2XG4gKi9cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3QgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVzdHJpY3QgPSAnQSc7XG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgd2F2ZUVsO1xuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgbGV0IGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IGAke3Bvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnR9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IGAke3Bvcy50b3AgLSBwYXJlbnRQb3MudG9wfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcblxuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xuICAgICAgICByZXN0cmljdCA9ICdDJztcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcpLmRpcmVjdGl2ZSgnY0J1dHRvbicsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKV0pO1xuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cblxubW9kdWxlIHRocmVhZCB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndGhyZWFkJywgW1xuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcbiAgICAgICAgJ3RocmVhZC53YXZlRWZmZWN0JyxcbiAgICAgICAgJ3RocmVhZC5tZW51JyxcbiAgICAgICAgJ3RocmVhZC50YWInLFxuICAgICAgICAndGhyZWFkLmZsb2F0aW5nTGFiZWwnLFxuICAgICAgICAndGhyZWFkLmlucHV0UmVxdWlyZScsXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3RSZXNpemUnLFxuICAgICAgICAndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJyxcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdCdcbiAgICBdKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

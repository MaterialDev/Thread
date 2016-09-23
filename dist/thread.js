var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
angular.module('thread.dialog', []);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuc2VydmljZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdFJlc2l6ZS9zZWxlY3RSZXNpemUuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3Qvc2VsZWN0LmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0FoQyxRQUFR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QUFBLGFBQVU7R0FBakIsV0FBQSxTQUFNO0FBOEhiLFFBQVEsT0FBTyxxQkFBcUIsSUFBSSxVQUFVLGNBQWMsT0FBTyxXQUFXLFdBQVc7QUFDN0YsUUFBUSxPQUFPLHFCQUFxQixVQUFVLFdBQVcsQ0FBQyxZQUFZLE9BQU8sV0FBVyxpQkFBaUI7O0FDcEl6RyxJQUFPO0FBQVAsQ0FBQSxVQUFPLFFBQU87SUFDVjtJQUVBLFFBQVEsT0FBTyxVQUFVO1FBQ3JCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O0dBZEQsV0FBQSxTQUFNO0FkcWlDYiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xufTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsIFtdKS5kaXJlY3RpdmUoJ2R5bmFtaWNCYWNrZ3JvdW5kJywgZnVuY3Rpb24gKCR3aW5kb3csICRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xuICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgnZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZWFkeUNoZWNrSW50ZXJ2YWxfMSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgb3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN1dG9mZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgRGlhbG9nQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBEaWFsb2dDb250cm9sbGVyKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS4kb25EZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIgPSBEaWFsb2dDb250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlcl0sXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXG4gICAgfTtcbn0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIFNlcnZpY2VzO1xuICAgIChmdW5jdGlvbiAoU2VydmljZXMpIHtcbiAgICAgICAgdmFyIERpYWxvZ1NlcnZpY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gRGlhbG9nU2VydmljZSgkcSwgJHJvb3RTY29wZSwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRxID0gJHE7XG4gICAgICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEaWFsb2dTZXJ2aWNlLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZ0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZ1Njb3BlO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gdGhpcy4kcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoXCJcXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVxcXCJcIiArIG9wdGlvbnMudGFyZ2V0ICsgXCJcXFwiXFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cXFwiXCIgKyBvcHRpb25zLnRlbXBsYXRlICsgXCJcXFwiXFxuICAgICAgICAgICAgICAgID48L3RkLWRpYWxvZz5cXG4gICAgICAgICAgICBcIik7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaWFsb2dFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dTY29wZSA9IGRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG4gICAgICAgICAgICAgICAgZGlhbG9nU2NvcGUub3BlbihkZWZlcnJlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIERpYWxvZ1NlcnZpY2U7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIFNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UgPSBEaWFsb2dTZXJ2aWNlO1xuICAgIH0pKFNlcnZpY2VzID0gVGhyZWFkLlNlcnZpY2VzIHx8IChUaHJlYWQuU2VydmljZXMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpO1xuLyoqXG4gKiBGbG9hdGluZyBsYWJlbFxuICogQSBjb21wb25lbnQgdGhhdCBjb250cm9scyBsYWJlbCBpbnRlcmFjdGlvbnMgb24gaW5wdXQgZmllbGRzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XG4gKi9cbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgaWYgKGF0dHJzLm5vRmxvYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICB2YXIgbmdNb2RlbEN0cmwgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcbiAgICAgICAgICAgIGlmIChpbnB1dEZpZWxkLnByb3AoJ3RhZ05hbWUnKSAhPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBNZW51ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnUoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0UnO1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcImMtbWVudSBqcy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKFwiYy1tZW51X19jb250ZW50LS13aWR0aC1cIiArIGF0dHJzLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbihzcGxpdFBvc1swXSwgc3BsaXRQb3NbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGN0cmwuY2xvc2UoKTsgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IG9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGNsb3NlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5OiBtb3ZlVG9Cb2R5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tZW51Q29udGVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxlZnQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b3BfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnhQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLnJpZ2h0IC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wXzEgPSB0YXJnZXRQb3MudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfMSA9IHRhcmdldFBvcy5ib3R0b20gLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSAobGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUudG9wID0gKHRvcF8xICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmJvdHRvbSA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnhQb3MgPSB4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5iYWNrZHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBNZW51KCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE1lbnUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBNZW51O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnUgPSBNZW51O1xuICAgICAgICB2YXIgTWVudVRhcmdldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51VGFyZ2V0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IFwiPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XFxcImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFxcXCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkbWVudS5vcGVuKClcXFwiPjwvYnV0dG9uPlwiO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG1lbnUgPSBjdHJsO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51VGFyZ2V0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51VGFyZ2V0KCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVUYXJnZXQ7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudVRhcmdldCA9IE1lbnVUYXJnZXQ7XG4gICAgICAgIHZhciBNZW51Q29udGVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51Q29udGVudCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVDb250ZW50LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51Q29udGVudCgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51Q29udGVudDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51Q29udGVudCA9IE1lbnVDb250ZW50O1xuICAgICAgICB2YXIgTWVudUl0ZW0gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudUl0ZW0oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVJdGVtLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51SXRlbSgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51SXRlbTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51SXRlbSA9IE1lbnVJdGVtO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xudmFyIG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51VGFyZ2V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudVRhcmdldC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpO1xuLyoqXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXG4gKiBBIG5hdHVyYWwgbGFuZ3VhZ2UgY29tcG9uZW50IHRoYXQgc2hvd3Mgb25lXG4gKiBzZWN0aW9uIGF0IGEgdGltZSBjZW50ZXJlZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY3JlZW5cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA2LzE1LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBQcm9kaXNDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFByb2Rpc0NvbnRyb2xsZXIoJGVsZW1lbnQsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgrK3RoaXMuY3VycmVudFNlY3Rpb24gPj0gdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvID0gZnVuY3Rpb24gKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuY3VycmVudFNlY3Rpb247IGkgPCB0aGlzLnNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNlY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBwcm9kaXNFbDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcm9kaXNFbCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xuICAgICAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5yZWdpc3RlclNlY3Rpb24gPSBmdW5jdGlvbiAoZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U2VjdGlvbkhlaWdodCA9IGZ1bmN0aW9uIChzZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICAgICAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlciA9IFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtcHJvZGlzIGpzLXByb2Rpc1xcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXMnLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycpLmRpcmVjdGl2ZSgncHJvZGlzU2VjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VfX3NlY3Rpb24gYy1wcm9kaXNfX3NlY3Rpb24ganMtcHJvZGlzX19zZWN0aW9uXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVxcXCJ7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cIixcbiAgICAgICAgcmVxdWlyZTogJ15wcm9kaXMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBTY3JvbGxDb2xsYXBzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTY3JvbGxDb2xsYXBzZSgkd2luZG93KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQSc7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNjcm9sbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChfdGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTY3JvbGxDb2xsYXBzZS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHdpbmRvdykgeyByZXR1cm4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2Nyb2xsQ29sbGFwc2UuJGluamVjdCA9IFsnJHdpbmRvdyddO1xuICAgICAgICAgICAgcmV0dXJuIFNjcm9sbENvbGxhcHNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNjcm9sbENvbGxhcHNlID0gU2Nyb2xsQ29sbGFwc2U7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBbJyR3aW5kb3cnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCldKTtcbi8qKlxuICogU2VsZWN0IFJlc2l6ZVxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxuICovXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgb25SZXNpemU6ICcmc2VsZWN0UmVzaXplJyxcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVzaXplSW5wdXQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICB2YXIgYXJyb3dXaWR0aCA9IDI0O1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XS50ZXh0O1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aDtcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRfMS5hcHBlbmQodGVzdEVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gc2NvcGUucmVzaXplRGVmYXVsdCB8fCAxNTA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSAod2lkdGggKyBhcnJvd1dpZHRoKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25SZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG52YXIgU2VsZWN0Q29udHJvbGxlciA9IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXI7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIE9wdGlvbk1vZGVsID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gT3B0aW9uTW9kZWw7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuT3B0aW9uTW9kZWwgPSBPcHRpb25Nb2RlbDtcbiAgICAgICAgdmFyIFNlbGVjdENvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gU2VsZWN0Q29udHJvbGxlcigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmFkZE9wdGlvbiA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wdXNoKG5ldyBPcHRpb25Nb2RlbChuYW1lLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLm9wZW5PcHRpb25MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRQb3MgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHBhcmVudFBvcy5sZWZ0ICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICBwYXJlbnRQb3MudG9wICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIHZhciBiYWNrZHJvcCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uTGlzdCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSB0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IChwYXJlbnRQb3MubGVmdCAtIDE2KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLnRvcCA9IChwYXJlbnRQb3MudG9wIC0gMTQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VPcHRpb25MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25MaXN0ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gb3B0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5oaWdobGlnaHROZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlkeCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSB8fCBpZHggPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmhpZ2hsaWdodFByZXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWR4IDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZHggLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmdldEhpZ2hsaWdodGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS51bkhpZ2hsaWdodEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5vcHRpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gU2VsZWN0Q29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyID0gU2VsZWN0Q29udHJvbGxlcjtcbiAgICAgICAgdmFyIE9wdGlvbkNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gT3B0aW9uQ29udHJvbGxlcigpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBPcHRpb25Db250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIgPSBPcHRpb25Db250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnLCBbXSkuZGlyZWN0aXZlKCd0ZFNlbGVjdCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLXNlbGVjdCBjLWlucHV0X19maWVsZCBqcy1zZWxlY3RcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBuZy1jbGljaz1cXFwiJHNlbGVjdEN0cmwub3Blbk9wdGlvbkxpc3QoKTtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtc2VsZWN0X19iYWNrZHJvcCBqcy1zZWxlY3RfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImMtc2VsZWN0X192YWx1ZVxcXCI+e3skc2VsZWN0Q3RybC5tb2RlbCB8fCAnICd9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGNsYXNzPVxcXCJjLXNlbGVjdF9fbWVudSBqcy1zZWxlY3RfX21lbnVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XFxcImMtc2VsZWN0X19tZW51LWl0ZW0ganMtc2VsZWN0X19tZW51LWl0ZW1cXFwiIG5nLXJlcGVhdD1cXFwib3B0aW9uIGluICRzZWxlY3RDdHJsLm9wdGlvbnNcXFwiIG5nLWNsYXNzPVxcXCJ7J2hhcy1mb2N1cyc6IG9wdGlvbi5pc0hpZ2hsaWdodGVkfVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXFxcIj57e29wdGlvbi5uYW1lfX0ge3tvcHRpb24uaXNIaWdobGlnaHRlZH19XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwibWkgYy1zZWxlY3RfX2Fycm93XFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+YXJyb3dfZHJvcF9kb3duPC9pPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XFxcImMtc2VsZWN0X19ib3hcXFwiIG5nLXRyYW5zY2x1ZGUgbmctbW9kZWw9XFxcIiRzZWxlY3RDdHJsLm1vZGVsXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjwvc2VsZWN0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RDdHJsJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zZWxlY3RfX21lbnUtaXRlbScpKTtcbiAgICAgICAgICAgICAgICBvcHRpb24ub24oJ21vdXNlZW50ZXIgbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC51bkhpZ2hsaWdodEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFja2Ryb3Aub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogLy9hcnJvdyB1cFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodFByZXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vYXJyb3cgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5oaWdobGlnaHROZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5pc09wZW4gPyBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpIDogY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmlzT3BlbiAmJiBjdHJsLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZWxlY3QoY3RybC5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPG9wdGlvbiBuZy10cmFuc2NsdWRlIG5nLXZhbHVlPVwiJHNlbGVjdE9wdGlvbkN0cmwudmFsdWVcIj48L29wdGlvbj4nLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0T3B0aW9uQ3RybCcsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGF0dHJzLnZhbHVlIHx8IGVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL1xccy8sICcnKTtcbiAgICAgICAgICAgIHNjb3BlLiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBjdHJsLmFkZE9wdGlvbihlbGVtZW50LnRleHQoKSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgVGFic0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gVGFic0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLmN1cnJlbnRUYWI7IH0sIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUucmVzaXplVGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAxNjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGFiSGVhZGVyID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVGFiID0gZnVuY3Rpb24gKGhlYWRlciwgYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSB0aGlzLnRhYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmNoYW5nZVRhYiA9IGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWR4ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2xlYXJUYWIgPSBmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFRhYnNDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlRhYnNDb250cm9sbGVyID0gVGFic0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsIGZ1bmN0aW9uICgkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtdGFiXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcl0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGJ1dHRvbiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5cIixcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pO1xuLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdmVFZmZlY3QoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciB3YXZlRWw7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWItbWluaScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IChwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IChwb3MudG9wIC0gcGFyZW50UG9zLnRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F2ZUVmZmVjdC4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3Q7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMud2F2ZUVmZmVjdCA9IHdhdmVFZmZlY3Q7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0QnV0dG9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyh3YXZlRWZmZWN0QnV0dG9uLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdEJ1dHRvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdmVFZmZlY3RCdXR0b24uJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiB3YXZlRWZmZWN0QnV0dG9uO1xuICAgICAgICB9KHdhdmVFZmZlY3QpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uID0gd2F2ZUVmZmVjdEJ1dHRvbjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCldKTtcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxudmFyIHRocmVhZDtcbihmdW5jdGlvbiAodGhyZWFkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXG4gICAgICAgICd0aHJlYWQud2F2ZUVmZmVjdCcsXG4gICAgICAgICd0aHJlYWQubWVudScsXG4gICAgICAgICd0aHJlYWQudGFiJyxcbiAgICAgICAgJ3RocmVhZC5mbG9hdGluZ0xhYmVsJyxcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxuICAgICAgICAndGhyZWFkLnByb2RpcycsXG4gICAgICAgICd0aHJlYWQuc2VsZWN0UmVzaXplJyxcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3QnXG4gICAgXSk7XG59KSh0aHJlYWQgfHwgKHRocmVhZCA9IHt9KSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcclxuICAgIH07XHJcbn0pOyIsIlxyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgb3BlbjogRnVuY3Rpb247XHJcbiAgICAgICAgY2xvc2U6IEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dDb250cm9sbGVyIHtcclxuICAgICAgICBkZWZlckNhbGxiYWNrIDogbmcuSURlZmVycmVkO1xyXG4gICAgICAgIGNhbmNlbGxlZDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHt9XHJcblxyXG4gICAgICAgICRvbkluaXQoKSB7fVxyXG5cclxuICAgICAgICBjbG9zZShyZXNwb25zZT8gOiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbmNlbCgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG5cclxuICAgICAgICAgICAgaWYoZGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25EZXN0cm95KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCAoKSA9PiB7XHJcbiAgIHJldHVybiB7XHJcbiAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyXSxcclxuICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXHJcbiAgIH07XHJcbn0pOyIsIm1vZHVsZSBUaHJlYWQuU2VydmljZXMge1xyXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRxOiBuZy5JUVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IG5nLklDb21waWxlU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgb3BlbihvcHRpb25zKSA6IG5nLklQcm9taXNlIHtcclxuICAgICAgICAgICAgbGV0IGRlZmVycmVkIDogbmcuSURlZmVycmVkO1xyXG4gICAgICAgICAgICBsZXQgZGlhbG9nRWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xyXG5cclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB0aGlzLiRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICBkaWFsb2dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KGBcclxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU9XCIke29wdGlvbnMudGVtcGxhdGV9XCJcclxuICAgICAgICAgICAgICAgID48L3RkLWRpYWxvZz5cclxuICAgICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpYWxvZ0VsZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcclxuICAgICAgICAgICAgZGlhbG9nU2NvcGUgPSA8VGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nU2NvcGU+ZGlhbG9nRWxlbWVudC5pc29sYXRlU2NvcGUoKTtcclxuXHJcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLnNlcnZpY2UoJyRkaWFsb2cnLCBUaHJlYWQuU2VydmljZXMuRGlhbG9nU2VydmljZSk7IiwiLyoqXHJcbiAqIEZsb2F0aW5nIGxhYmVsXHJcbiAqIEEgY29tcG9uZW50IHRoYXQgY29udHJvbHMgbGFiZWwgaW50ZXJhY3Rpb25zIG9uIGlucHV0IGZpZWxkc1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcclxuICovXHJcbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XHJcbiAgICAgICAgaWYgKCg8YW55PmF0dHJzKS5ub0Zsb2F0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICBsZXQgbmdNb2RlbEN0cmwgOiBuZy5JTmdNb2RlbENvbnRyb2xsZXIgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dEZpZWxkLnByb3AoJ3RhZ05hbWUnKSAhPT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignZm9jdXMnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdibHVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYobmdNb2RlbEN0cmwpIHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIXZhbHVlIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdmb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsIFtdKS5kaXJlY3RpdmUoJ2Zsb2F0aW5nTGFiZWwnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJykuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcclxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcclxuICAgIH1cclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XHJcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IFRocmVhZC5Db21wb25lbnRzLklucHV0UmVxdWlyZUF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogTWVudVxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wNi8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICBzY29wZSA9IHt9O1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xyXG4gICAgICAgIGNvbnRyb2xsZXJBcyA9ICckbWVudSc7XHJcbiAgICAgICAgdGVtcGxhdGUgPSBgPGRpdiBjbGFzcz1cImMtbWVudSBqcy1tZW51XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG5cclxuICAgICAgICBtZW51Q29udGVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgYmFja2Ryb3AgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHt9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcclxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnd2lkdGgnKSkge1xyXG4gICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKGBjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLSR7YXR0cnMud2lkdGh9YClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdtb3ZlVG9Cb2R5JykpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzcGxpdFBvcyA9IGF0dHJzLnBvc2l0aW9uLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKCd0b3AnLCAnbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY3RybC5tZW51Q29udGVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbWVudV9faXRlbScpKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29udHJvbGxlciA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgZnVuY3Rpb24oJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHtcclxuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgeVBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9wZW4sXHJcbiAgICAgICAgICAgICAgICBjbG9zZSxcclxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy55UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBNZW51KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVUYXJnZXQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcclxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRtZW51Lm9wZW4oKVwiPjwvYnV0dG9uPmA7XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgKDxhbnk+c2NvcGUpLiRtZW51ID0gY3RybDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVDb250ZW50IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51Q29udGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudUl0ZW0gaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUl0ZW0oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpOyIsIi8qKlxyXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXHJcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcclxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxyXG4gKi9cclxuXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgUHJvZGlzQ29udHJvbGxlciB7XHJcbiAgICAgICAgY3VycmVudFNlY3Rpb246IG51bWJlcjtcclxuICAgICAgICBzZWN0aW9uczogYW55W107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ29UbyhzZWN0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVTZWN0aW9ucygpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcclxuICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlZ2lzdGVyU2VjdGlvbihlbGVtZW50LCBuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldFNlY3Rpb25IZWlnaHQoc2VjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSBzZWN0aW9uLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXByb2RpcyBqcy1wcm9kaXNcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxyXG4gICAgICAgIHJlcXVpcmU6ICdecHJvZGlzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckd2luZG93J107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0U2Nyb2xsID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcclxuICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyB1cFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9ICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSkgPT4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgWyckd2luZG93JywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpXSk7IiwiLyoqXHJcbiAqIFNlbGVjdCBSZXNpemVcclxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcclxuICovXHJcblxyXG5pbnRlcmZhY2Ugc2VsZWN0UmVzaXplU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcclxuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcclxuICAgIHBhcmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgYXJyb3dXaWR0aCA9IDI0O1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKyBhcnJvd1dpZHRofXB4YDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiaW1wb3J0IFNlbGVjdENvbnRyb2xsZXIgPSBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyO1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbk1vZGVsIHtcclxuICAgICAgICBuYW1lOiBTdHJpbmc7XHJcbiAgICAgICAgdmFsdWU6IGFueTtcclxuICAgICAgICBpc0hpZ2hsaWdodGVkOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBTdHJpbmcsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFNlbGVjdENvbnRyb2xsZXIge1xyXG4gICAgICAgIG9wdGlvbnMgPSBbXTtcclxuICAgICAgICBzZWxlY3RlZDogT3B0aW9uTW9kZWw7XHJcbiAgICAgICAgbW9kZWw6IGFueTtcclxuICAgICAgICBpc09wZW46IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRPcHRpb24obmFtZSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2gobmV3IE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuT3B0aW9uTGlzdCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHBhcmVudFBvcy5sZWZ0ICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgcGFyZW50UG9zLnRvcCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgIGxldCBiYWNrZHJvcDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uTGlzdDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSBgJHt0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRofXB4YDtcclxuICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS5sZWZ0ID0gYCR7cGFyZW50UG9zLmxlZnQgLSAxNn1weGA7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUudG9wID0gYCR7cGFyZW50UG9zLnRvcCAtIDE0fXB4YDtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbG9zZU9wdGlvbkxpc3QoKSB7XHJcbiAgICAgICAgICAgIGxldCBvcHRpb25MaXN0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcclxuICAgICAgICAgICAgbGV0IGJhY2tkcm9wOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VsZWN0KG9wdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gb3B0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9uLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlnaGxpZ2h0TmV4dCgpIHtcclxuICAgICAgICAgICAgbGV0IGlkeDogbnVtYmVyID0gLTE7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaWR4ID49IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIHx8IGlkeCA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVuSGlnaGxpZ2h0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdobGlnaHRQcmV2KCkge1xyXG4gICAgICAgICAgICBsZXQgaWR4OiBudW1iZXIgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpZHggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEhpZ2hsaWdodGVkKCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdW5IaWdobGlnaHRBbGwoKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgT3B0aW9uQ29udHJvbGxlciB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtc2VsZWN0IGMtaW5wdXRfX2ZpZWxkIGpzLXNlbGVjdFwiIHRhYmluZGV4PVwiMFwiIG5nLWNsaWNrPVwiJHNlbGVjdEN0cmwub3Blbk9wdGlvbkxpc3QoKTtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc2VsZWN0X19iYWNrZHJvcCBqcy1zZWxlY3RfX2JhY2tkcm9wXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGNsYXNzPVwiYy1zZWxlY3RfX3ZhbHVlXCI+e3skc2VsZWN0Q3RybC5tb2RlbCB8fCAnICd9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHVsIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGNsYXNzPVwiYy1zZWxlY3RfX21lbnUganMtc2VsZWN0X19tZW51XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjLXNlbGVjdF9fbWVudS1pdGVtIGpzLXNlbGVjdF9fbWVudS1pdGVtXCIgbmctcmVwZWF0PVwib3B0aW9uIGluICRzZWxlY3RDdHJsLm9wdGlvbnNcIiBuZy1jbGFzcz1cInsnaGFzLWZvY3VzJzogb3B0aW9uLmlzSGlnaGxpZ2h0ZWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRzZWxlY3RDdHJsLnNlbGVjdChvcHRpb24pOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIj57e29wdGlvbi5uYW1lfX0ge3tvcHRpb24uaXNIaWdobGlnaHRlZH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cIm1pIGMtc2VsZWN0X19hcnJvd1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPmFycm93X2Ryb3BfZG93bjwvaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImMtc2VsZWN0X19ib3hcIiBuZy10cmFuc2NsdWRlIG5nLW1vZGVsPVwiJHNlbGVjdEN0cmwubW9kZWxcIiB0YWJpbmRleD1cIi0xXCI+PC9zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdEN0cmwnLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IFNlbGVjdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNlbGVjdF9fbWVudS1pdGVtJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbi5vbignbW91c2VlbnRlciBtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwudW5IaWdobGlnaHRBbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGJhY2tkcm9wLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OiAgICAvL2Fycm93IHVwXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzogICAgLy9hcnJvdyBsZWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5oaWdobGlnaHRQcmV2KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OiAgICAvL2Fycm93IHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDogICAgLy9hcnJvdyBkb3duXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5oaWdobGlnaHROZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOiAgICAvL3NwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaXNPcGVuID8gY3RybC5jbG9zZU9wdGlvbkxpc3QoKSA6IGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6ICAgIC8vZW50ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuaXNPcGVuICYmIGN0cmwuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0KGN0cmwuc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcpLmRpcmVjdGl2ZSgndGRPcHRpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRTZWxlY3QnLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPG9wdGlvbiBuZy10cmFuc2NsdWRlIG5nLXZhbHVlPVwiJHNlbGVjdE9wdGlvbkN0cmwudmFsdWVcIj48L29wdGlvbj4nLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdE9wdGlvbkN0cmwnLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBhbnksIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xyXG4gICAgICAgICAgICBzY29wZS4kc2VsZWN0T3B0aW9uQ3RybC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBjdHJsLmFkZE9wdGlvbihlbGVtZW50LnRleHQoKSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBUYWIgY29tcG9uZW50XHJcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHN3aXRjaGluZyBiZXR3ZWVuXHJcbiAqIHNldHMgb2YgY29udGVudCBzZXBhcmF0ZWQgaW50byBncm91cHMgYnkgdGFic1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzA4LzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBpbnRlcmZhY2UgVGFicyB7XHJcbiAgICAgICAgbGFzdFRhYjogbnVtYmVyO1xyXG4gICAgICAgIGFjdGl2ZVRhYjogbnVtYmVyO1xyXG4gICAgICAgIHRhYnM6IEFycmF5PE9iamVjdD47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBUYWJUaXRsZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgICAgICAkdGFiczogVGFic0NvbnRyb2xsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRhYnNDb250cm9sbGVyIGltcGxlbWVudHMgVGFic3tcclxuICAgICAgICBhY3RpdmVUYWIgPSAxO1xyXG4gICAgICAgIHRhYnMgPSBbXTtcclxuICAgICAgICBsYXN0VGFiID0gLTE7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHNjb3BlOiBuZy5JU2NvcGUsIHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiAoPGFueT50aGlzKS5jdXJyZW50VGFiLCAobmV3VmFsdWUsIG9sZFZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihuZXdWYWx1ZSAmJiBuZXdWYWx1ZSA9PT0gb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS5hY3RpdmVUYWIgPSBuZXdWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS5jaGFuZ2VUYWIobnVsbCwgbmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc2l6ZVRhYnMoKSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aDogTnVtYmVyID0gMTY7XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFiSGVhZGVyID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJyk7XHJcbiAgICAgICAgICAgIHRhYkhlYWRlci5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFkZFRhYihoZWFkZXIgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBib2R5IDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgICAgICBsZXQgaWR4IDogbnVtYmVyID0gdGhpcy50YWJzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXHJcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xyXG5cclxuICAgICAgICAgICAgaGVhZGVyLmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XHJcbiAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRhYnMoKTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2hhbmdlVGFiKGV2ZW50OiBKUXVlcnlFdmVudE9iamVjdCwgaW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgICAgICBpZihpbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoaW5kZXggJiYgaW5kZXggIT09IHRoaXMuYWN0aXZlVGFiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlVGFicygpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodCA6IE51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgOiBIVE1MRWxlbWVudDtcclxuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2NvbnRlbnQnKTtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUudHJhbnNpdGlvbiA9ICdoZWlnaHQgNTAwbXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZHggPSBpICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGFiKGkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGlkeCA9PT0gdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkeCA8IHRoaXMuYWN0aXZlVGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xlYXJUYWIoaWR4OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgKDxIVE1MRWxlbWVudD5kb2N1bWVudC5hY3RpdmVFbGVtZW50KS5ibHVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmhlYWRlci5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcclxuICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uYm9keS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJywgW10pLmRpcmVjdGl2ZSgndGRUYWJzJywgKCRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBjdXJyZW50VGFiOiAnPSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy10YWJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19oZWFkZXItd3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19oZWFkZXIganMtdGFiX19oZWFkZXJcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudC13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckdGFicycsXHJcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcl0sXHJcbiAgICAgICAgbGluazogKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlYWR5Q2hlY2tJbnRlcnZhbCA9ICRpbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgMTApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWInLCAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBsaW5rKHNjb3BlOm5nLklTY29wZSwgZWxlbWVudDpuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczpuZy5JQXR0cmlidXRlcywgY3RybDphbnkpIHtcclxuICAgICAgICAgICAgbGV0IGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xyXG4gICAgICAgICAgICBsZXQgYm9keSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2JvZHknKSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmFkZFRhYihoZWFkZXIsIGJvZHkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjbGFzcz1cImMtdGFiX19oZWFkZXItaXRlbSBjLWJ1dHRvbiBjLWJ1dHRvbi0tdGFiIGpzLXRhYl9fdGl0bGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiR0YWJzLmNoYW5nZVRhYigkZXZlbnQpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5gLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IFRocmVhZC5Db21wb25lbnRzLlRhYlRpdGxlU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiR0YWJzID0gY3RybDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYkJvZHknLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYicsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjLXRhYl9fYm9keSBqcy10YWJfX2JvZHlcIiBuZy10cmFuc2NsdWRlPjwvZGl2PidcclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBXYXZlIGVmZmVjdFxyXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGEgZ3Jvd2luZyBjaXJjbGUgaW4gdGhlIGJhY2tncm91bmRcclxuICogb2YgY29tcG9uZW50cyBpdCdzIGF0dGFjaGVkIHRvXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMTEvMjAxNlxyXG4gKi9cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyB3YXZlRWZmZWN0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnQSc7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgd2F2ZUVsO1xyXG4gICAgICAgICAgICBsZXQgcmF3RWxlbWVudCA9IGVsZW1lbnRbMF07XHJcbiAgICAgICAgICAgIGxldCBpc0ZhYiA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICB3YXZlRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuIGNsYXNzPVwid2F2ZS1lZmZlY3RcIj48L3NwYW4+Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWItbWluaScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRmFiID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNGYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2NpcmNsZSwgaGVpZ2h0IG11c3QgbWF0Y2ggdGhlIHdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZCh3YXZlRWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9uKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSBgJHtwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0fXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IGAke3Bvcy50b3AgLSBwYXJlbnRQb3MudG9wfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVHJpZ2dlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdmb2N1cycsICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHdhdmVFbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3RCdXR0b24gZXh0ZW5kcyB3YXZlRWZmZWN0IHtcclxuICAgICAgICByZXN0cmljdCA9ICdDJztcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnLCBbXSkuZGlyZWN0aXZlKCd3YXZlRWZmZWN0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdC5mYWN0b3J5KCkpO1xyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCldKTtcclxuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxyXG5cclxubW9kdWxlIHRocmVhZCB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgndGhyZWFkJywgW1xyXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxyXG4gICAgICAgICd0aHJlYWQud2F2ZUVmZmVjdCcsXHJcbiAgICAgICAgJ3RocmVhZC5tZW51JyxcclxuICAgICAgICAndGhyZWFkLnRhYicsXHJcbiAgICAgICAgJ3RocmVhZC5mbG9hdGluZ0xhYmVsJyxcclxuICAgICAgICAndGhyZWFkLmlucHV0UmVxdWlyZScsXHJcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxyXG4gICAgICAgICd0aHJlYWQuc2VsZWN0UmVzaXplJyxcclxuICAgICAgICAndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJyxcclxuICAgICAgICAndGhyZWFkLmRpYWxvZycsXHJcbiAgICAgICAgJ3RocmVhZC5zZWxlY3QnXHJcbiAgICBdKTtcclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==

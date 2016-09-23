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
            element.toggleClass('has-value', !!inputField.val() || !!inputField.attr('placeholder'));
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
                this.isSelected = false;
            }
            return OptionModel;
        }());
        Components.OptionModel = OptionModel;
        var SelectController = (function () {
            function SelectController($element, $timeout) {
                this.$element = $element;
                this.$timeout = $timeout;
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
                    this.highlighted = this.selected;
                    this.highlighted.isHighlighted = true;
                    var selected = this.$element[0].querySelector('.is-selected');
                }
                this.isOpen = true;
            };
            SelectController.prototype.getElementPositionInView = function (parent, element) {
                var parentRect = parent.getBoundingClientRect();
                var elementRect = element.getBoundingClientRect();
                var parentTop = parentRect.top + document.body.scrollTop;
                var parentBottom = parentRect.bottom + document.body.scrollTop;
                var elementTop = elementRect.top + parent.scrollTop;
                var elementBottom = elementRect.bottom + parent.scrollTop;
                if (elementRect.top < parentTop) {
                    return elementTop - parentTop;
                }
                else if (elementRect.bottom > parentBottom) {
                    return elementBottom - parentBottom;
                }
                else {
                    return parent.scrollTop;
                }
            };
            SelectController.prototype.closeOptionList = function () {
                var _this = this;
                this.$timeout(function () {
                    var optionList = _this.$element[0].querySelector('.js-select__menu');
                    var backdrop = _this.$element[0].querySelector('.js-select__backdrop');
                    var selected = _this.$element[0].querySelector('.is-selected');
                    angular.element(optionList).removeClass('is-open');
                    angular.element(backdrop).removeClass('is-open');
                    _this.isOpen = false;
                    var newPosition = _this.getElementPositionInView(optionList, selected);
                    _this.$timeout(function () {
                        optionList.scrollTop = newPosition;
                    }, 200);
                });
            };
            SelectController.prototype.select = function (option) {
                if (this.selected) {
                    this.selected.isSelected = false;
                }
                this.selected = option;
                this.selected.isSelected = true;
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
                this.highlighted = this.options[idx];
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
                this.highlighted = this.options[idx];
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
                this.highlighted = null;
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
        template: "<div class=\"c-select c-input__field js-select\" tabindex=\"0\" ng-click=\"$selectCtrl.openOptionList();\">\n                        <div class=\"c-select__backdrop js-select__backdrop\"></div>\n                        <span aria-hidden=\"true\" class=\"c-select__value\">{{$selectCtrl.model || ' '}}</span>\n                        <ul aria-hidden=\"true\" class=\"c-select__menu js-select__menu\">\n                            <li class=\"c-select__menu-item js-select__menu-item\" ng-repeat=\"option in $selectCtrl.options\" ng-class=\"{'has-focus': option.isHighlighted, 'is-selected': option.isSelected}\"\n                                ng-click=\"$selectCtrl.select(option); $event.stopPropagation()\">{{option.name}}\n                            </li>\n                        </ul>\n                        <i class=\"mi c-select__arrow\" aria-hidden=\"true\">arrow_drop_down</i>\n                        <select class=\"c-select__box\" ng-transclude ng-model=\"$selectCtrl.model\" tabindex=\"-1\"></select>\n                    </div>",
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
            element.on('blur', function (e) {
                // ctrl.closeOptionList();
                scope.$apply();
            });
            element.on('keydown', function (e) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0NoQyxJQUFP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OztHQWRELFdBQUEsU0FBTTtBZHFrQ2IiLCJmaWxlIjoidGhyZWFkLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbn07XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgRGlhbG9nQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBEaWFsb2dDb250cm9sbGVyKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS4kb25EZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXIgPSBEaWFsb2dDb250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlcl0sXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXG4gICAgfTtcbn0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIFNlcnZpY2VzO1xuICAgIChmdW5jdGlvbiAoU2VydmljZXMpIHtcbiAgICAgICAgdmFyIERpYWxvZ1NlcnZpY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gRGlhbG9nU2VydmljZSgkcSwgJHJvb3RTY29wZSwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRxID0gJHE7XG4gICAgICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEaWFsb2dTZXJ2aWNlLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZ0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZ1Njb3BlO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkID0gdGhpcy4kcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoXCJcXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVxcXCJcIiArIG9wdGlvbnMudGFyZ2V0ICsgXCJcXFwiXFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cXFwiXCIgKyBvcHRpb25zLnRlbXBsYXRlICsgXCJcXFwiXFxuICAgICAgICAgICAgICAgID48L3RkLWRpYWxvZz5cXG4gICAgICAgICAgICBcIik7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaWFsb2dFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dTY29wZSA9IGRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG4gICAgICAgICAgICAgICAgZGlhbG9nU2NvcGUub3BlbihkZWZlcnJlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIERpYWxvZ1NlcnZpY2U7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIFNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UgPSBEaWFsb2dTZXJ2aWNlO1xuICAgIH0pKFNlcnZpY2VzID0gVGhyZWFkLlNlcnZpY2VzIHx8IChUaHJlYWQuU2VydmljZXMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsIFtdKS5kaXJlY3RpdmUoJ2R5bmFtaWNCYWNrZ3JvdW5kJywgZnVuY3Rpb24gKCR3aW5kb3csICRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xuICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgnZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZWFkeUNoZWNrSW50ZXJ2YWxfMSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgb3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN1dG9mZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTtcbi8qKlxuICogRmxvYXRpbmcgbGFiZWxcbiAqIEEgY29tcG9uZW50IHRoYXQgY29udHJvbHMgbGFiZWwgaW50ZXJhY3Rpb25zIG9uIGlucHV0IGZpZWxkc1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTMvMjAxNlxuICovXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBfZmxvYXRpbmdMYWJlbExpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgIGlmIChhdHRycy5ub0Zsb2F0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEZpZWxkID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgdmFyIG5nTW9kZWxDdHJsID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XG4gICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobmdNb2RlbEN0cmwpIHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIXZhbHVlIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignZm9jdXMnKTtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnLCBbXSkuZGlyZWN0aXZlKCdmbG9hdGluZ0xhYmVsJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJykuZGlyZWN0aXZlKCdjSW5wdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncmVxdWlyZWQnKSB8fCBhdHRycy5oaWRlUmVxdWlyZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhaW5wdXRGaWVsZC52YWwoKSk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIXRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIE1lbnVcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDYvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIE1lbnUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudSgkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnRSc7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kVG9Db250cm9sbGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXJBcyA9ICckbWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IFwiPGRpdiBjbGFzcz1cXFwiYy1tZW51IGpzLW1lbnVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlwiO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoXCJjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLVwiICsgYXR0cnMud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbW92ZVRvQm9keScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1vdmVUb0JvZHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGxpdFBvcyA9IGF0dHJzLnBvc2l0aW9uLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKCd0b3AnLCAnbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGN0cmwubWVudUNvbnRlbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1lbnVfX2l0ZW0nKSkub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gY3RybC5jbG9zZSgpOyB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlciA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Cb2R5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlQb3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbjogb3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogY2xvc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UG9zaXRpb246IHNldFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVUb0JvZHk6IG1vdmVUb0JvZHlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmFja2Ryb3AgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueVBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfMSA9IHRhcmdldFBvcy50b3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcF8xID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUubGVmdCA9IChsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSAodG9wXzEgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoeVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnlQb3MgPSB5UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdqcy1tZW51X19jb250ZW50LS1vbi1ib2R5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IE1lbnUoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgTWVudS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIE1lbnU7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudSA9IE1lbnU7XG4gICAgICAgIHZhciBNZW51VGFyZ2V0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVUYXJnZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gXCI8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cXFwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxcbiAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XFxcIiRtZW51Lm9wZW4oKVxcXCI+PC9idXR0b24+XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kbWVudSA9IGN0cmw7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVUYXJnZXQuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVUYXJnZXQoKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudVRhcmdldDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51VGFyZ2V0ID0gTWVudVRhcmdldDtcbiAgICAgICAgdmFyIE1lbnVDb250ZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVDb250ZW50KCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9ICc8dWwgY2xhc3M9XCJjLW1lbnVfX2NvbnRlbnQganMtbWVudV9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC91bD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudUNvbnRlbnQuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVDb250ZW50KCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVDb250ZW50O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVDb250ZW50ID0gTWVudUNvbnRlbnQ7XG4gICAgICAgIHZhciBNZW51SXRlbSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51SXRlbSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudUl0ZW0uZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1lbnVJdGVtKCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVJdGVtO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVJdGVtID0gTWVudUl0ZW07XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG52YXIgbWVudSA9IGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQubWVudScsIFtdKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnUnLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudS5mYWN0b3J5KCldKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51Q29udGVudCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVDb250ZW50LmZhY3RvcnkoKSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7XG4vKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFByb2Rpc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gUHJvZGlzQ29udHJvbGxlcigkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdvVG8gPSBmdW5jdGlvbiAoc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbaV0ubmFtZSA9PT0gc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldEN1cnJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2VjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHByb2Rpc0VsO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2Rpc0VsID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzJyk7XG4gICAgICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnJlZ2lzdGVyU2VjdGlvbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWN0aW9uSGVpZ2h0ID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VjdGlvbi5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gUHJvZGlzQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyID0gUHJvZGlzQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1wcm9kaXMganMtcHJvZGlzXFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcIntcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cXG4gICAgICAgICAgICAgICAgICAgICAgICB9XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlwiLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcbiAgICAgICAgICAgIHRoaXMuaWQgPSAkcGFyZW50LnJlZ2lzdGVyU2VjdGlvbigkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzX19zZWN0aW9uJyksICRhdHRycy5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFNjcm9sbENvbGxhcHNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdBJztcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0U2Nyb2xsID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KF90aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Nyb2xsIDwgbGFzdFNjcm9sbCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNjcm9sbENvbGxhcHNlLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkd2luZG93KSB7IHJldHVybiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTY3JvbGxDb2xsYXBzZS4kaW5qZWN0ID0gWyckd2luZG93J107XG4gICAgICAgICAgICByZXR1cm4gU2Nyb2xsQ29sbGFwc2U7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UgPSBTY3JvbGxDb2xsYXBzZTtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFsnJHdpbmRvdycsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKV0pO1xudmFyIFNlbGVjdENvbnRyb2xsZXIgPSBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBPcHRpb25Nb2RlbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBPcHRpb25Nb2RlbChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE9wdGlvbk1vZGVsO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk9wdGlvbk1vZGVsID0gT3B0aW9uTW9kZWw7XG4gICAgICAgIHZhciBTZWxlY3RDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFNlbGVjdENvbnRyb2xsZXIoJGVsZW1lbnQsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmFkZE9wdGlvbiA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wdXNoKG5ldyBPcHRpb25Nb2RlbChuYW1lLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLm9wZW5PcHRpb25MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRQb3MgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHBhcmVudFBvcy5sZWZ0ICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICBwYXJlbnRQb3MudG9wICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIHZhciBiYWNrZHJvcCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uTGlzdCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSB0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IChwYXJlbnRQb3MubGVmdCAtIDE2KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLnRvcCA9IChwYXJlbnRQb3MudG9wIC0gMTQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdGhpcy5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZC5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuaXMtc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmdldEVsZW1lbnRQb3NpdGlvbkluVmlldyA9IGZ1bmN0aW9uIChwYXJlbnQsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50UmVjdCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRUb3AgPSBwYXJlbnRSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRCb3R0b20gPSBwYXJlbnRSZWN0LmJvdHRvbSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50VG9wID0gZWxlbWVudFJlY3QudG9wICsgcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudEJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRSZWN0LnRvcCA8IHBhcmVudFRvcCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudFRvcCAtIHBhcmVudFRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZWxlbWVudFJlY3QuYm90dG9tID4gcGFyZW50Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Qm90dG9tIC0gcGFyZW50Qm90dG9tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmNsb3NlT3B0aW9uTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uTGlzdCA9IF90aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gX3RoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gX3RoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmlzLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSBfdGhpcy5nZXRFbGVtZW50UG9zaXRpb25JblZpZXcob3B0aW9uTGlzdCwgc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnNjcm9sbFRvcCA9IG5ld1Bvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG9wdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5oaWdobGlnaHROZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlkeCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSB8fCBpZHggPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmhpZ2hsaWdodFByZXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWR4IDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZHggLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmdldEhpZ2hsaWdodGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS51bkhpZ2hsaWdodEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5vcHRpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gU2VsZWN0Q29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyID0gU2VsZWN0Q29udHJvbGxlcjtcbiAgICAgICAgdmFyIE9wdGlvbkNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gT3B0aW9uQ29udHJvbGxlcigpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBPcHRpb25Db250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIgPSBPcHRpb25Db250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnLCBbXSkuZGlyZWN0aXZlKCd0ZFNlbGVjdCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLXNlbGVjdCBjLWlucHV0X19maWVsZCBqcy1zZWxlY3RcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBuZy1jbGljaz1cXFwiJHNlbGVjdEN0cmwub3Blbk9wdGlvbkxpc3QoKTtcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtc2VsZWN0X19iYWNrZHJvcCBqcy1zZWxlY3RfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImMtc2VsZWN0X192YWx1ZVxcXCI+e3skc2VsZWN0Q3RybC5tb2RlbCB8fCAnICd9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGNsYXNzPVxcXCJjLXNlbGVjdF9fbWVudSBqcy1zZWxlY3RfX21lbnVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XFxcImMtc2VsZWN0X19tZW51LWl0ZW0ganMtc2VsZWN0X19tZW51LWl0ZW1cXFwiIG5nLXJlcGVhdD1cXFwib3B0aW9uIGluICRzZWxlY3RDdHJsLm9wdGlvbnNcXFwiIG5nLWNsYXNzPVxcXCJ7J2hhcy1mb2N1cyc6IG9wdGlvbi5pc0hpZ2hsaWdodGVkLCAnaXMtc2VsZWN0ZWQnOiBvcHRpb24uaXNTZWxlY3RlZH1cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJHNlbGVjdEN0cmwuc2VsZWN0KG9wdGlvbik7ICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxcXCI+e3tvcHRpb24ubmFtZX19XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwibWkgYy1zZWxlY3RfX2Fycm93XFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+YXJyb3dfZHJvcF9kb3duPC9pPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XFxcImMtc2VsZWN0X19ib3hcXFwiIG5nLXRyYW5zY2x1ZGUgbmctbW9kZWw9XFxcIiRzZWxlY3RDdHJsLm1vZGVsXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjwvc2VsZWN0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RDdHJsJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zZWxlY3RfX21lbnUtaXRlbScpKTtcbiAgICAgICAgICAgICAgICBvcHRpb24ub24oJ21vdXNlZW50ZXIgbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC51bkhpZ2hsaWdodEFsbCgpO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFja2Ryb3Aub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OiAvL2Fycm93IHVwXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cmwuaXNPcGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0UHJldigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTogLy9hcnJvdyByaWdodFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodE5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmlzT3BlbiA/IGN0cmwuY2xvc2VPcHRpb25MaXN0KCkgOiBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuaXNPcGVuICYmIGN0cmwuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChjdHJsLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnKS5kaXJlY3RpdmUoJ3RkT3B0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkU2VsZWN0JyxcbiAgICAgICAgdGVtcGxhdGU6ICc8b3B0aW9uIG5nLXRyYW5zY2x1ZGUgbmctdmFsdWU9XCIkc2VsZWN0T3B0aW9uQ3RybC52YWx1ZVwiPjwvb3B0aW9uPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLk9wdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RPcHRpb25DdHJsJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIFNlbGVjdCBSZXNpemVcbiAqIEF1dG9tYXRpY2FsbHkgcmVzaXplcyBzZWxlY3QgZWxlbWVudHMgdG8gZml0IHRoZSB0ZXh0IGV4YWN0bHlcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnLCBbXSkuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemVQYXJlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdldEVsZW1lbnQgPSBnZXRFbGVtZW50O1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScpLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc2l6ZUlucHV0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xuICAgICAgICAgICAgICAgIHZhciBlbCA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgdmFyIGFycm93V2lkdGggPSAyNDtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0udGV4dDtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4+JykuaHRtbCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudF8xID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50XzEuYXBwZW5kKHRlc3RFbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gKHdpZHRoICsgYXJyb3dXaWR0aCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLm9uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgVGFic0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gVGFic0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLmN1cnJlbnRUYWI7IH0sIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlVGFiID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUucmVzaXplVGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSAxNjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSB0aGlzLnRhYnNbaV0uaGVhZGVyWzBdLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGFiSGVhZGVyID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuYWRkVGFiID0gZnVuY3Rpb24gKGhlYWRlciwgYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSB0aGlzLnRhYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmNoYW5nZVRhYiA9IGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RUYWIgPSB0aGlzLmFjdGl2ZVRhYjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMudGFic1t0aGlzLmFjdGl2ZVRhYiAtIDFdLmJvZHlbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWR4ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2xlYXJUYWIgPSBmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFRhYnNDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlRhYnNDb250cm9sbGVyID0gVGFic0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsIGZ1bmN0aW9uICgkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtdGFiXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlcl0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKCdmb250cycgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX3RpdGxlJykpO1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGJ1dHRvbiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZT48L2J1dHRvbj5cIixcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pO1xuLyoqXG4gKiBXYXZlIGVmZmVjdFxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdmVFZmZlY3QoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdub1dhdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciB3YXZlRWw7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWItbWluaScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWljb24nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSB7IGxlZnQ6IGUuY2xpZW50WCwgdG9wOiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IChwb3MubGVmdCAtIHBhcmVudFBvcy5sZWZ0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IChwb3MudG9wIC0gcGFyZW50UG9zLnRvcCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QoJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F2ZUVmZmVjdC4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3Q7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMud2F2ZUVmZmVjdCA9IHdhdmVFZmZlY3Q7XG4gICAgICAgIHZhciB3YXZlRWZmZWN0QnV0dG9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyh3YXZlRWZmZWN0QnV0dG9uLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdEJ1dHRvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdmVFZmZlY3RCdXR0b24uJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiB3YXZlRWZmZWN0QnV0dG9uO1xuICAgICAgICB9KHdhdmVFZmZlY3QpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uID0gd2F2ZUVmZmVjdEJ1dHRvbjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnKS5kaXJlY3RpdmUoJ2NCdXR0b24nLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbi5mYWN0b3J5KCldKTtcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBpbmdzL2FuZ3VsYXJqcy9hbmd1bGFyLmQudHNcIiAvPlxudmFyIHRocmVhZDtcbihmdW5jdGlvbiAodGhyZWFkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXG4gICAgICAgICd0aHJlYWQud2F2ZUVmZmVjdCcsXG4gICAgICAgICd0aHJlYWQubWVudScsXG4gICAgICAgICd0aHJlYWQudGFiJyxcbiAgICAgICAgJ3RocmVhZC5mbG9hdGluZ0xhYmVsJyxcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxuICAgICAgICAndGhyZWFkLnByb2RpcycsXG4gICAgICAgICd0aHJlYWQuc2VsZWN0UmVzaXplJyxcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3QnXG4gICAgXSk7XG59KSh0aHJlYWQgfHwgKHRocmVhZCA9IHt9KSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycsIFtdKTsiLCJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgICAgIG9wZW46IEZ1bmN0aW9uO1xuICAgICAgICBjbG9zZTogRnVuY3Rpb247XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRyb2xsZXIge1xuICAgICAgICBkZWZlckNhbGxiYWNrOiBuZy5JRGVmZXJyZWQ8YW55PjtcbiAgICAgICAgY2FuY2VsbGVkOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxuXG4gICAgICAgICRvbkluaXQoKSB7fVxuXG4gICAgICAgIGNsb3NlKHJlc3BvbnNlPyA6IGFueSkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FuY2VsKCkge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgICAgICBpZihkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJG9uRGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuZGlyZWN0aXZlKCd0ZERpYWxvZycsICgpID0+IHtcbiAgIHJldHVybiB7XG4gICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsIFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXJdLFxuICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXG4gICB9O1xufSk7IiwibW9kdWxlIFRocmVhZC5TZXJ2aWNlcyB7XG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHByaXZhdGUgJHE6IG5nLklRU2VydmljZSxcbiAgICAgICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcbiAgICAgICAgKSB7fVxuXG4gICAgICAgIG9wZW4ob3B0aW9ucyk6IG5nLklQcm9taXNlPGFueT4ge1xuICAgICAgICAgICAgbGV0IGRlZmVycmVkOiBuZy5JRGVmZXJyZWQ8YW55PjtcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChgXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVwiJHtvcHRpb25zLnRlbXBsYXRlfVwiXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxuICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gPFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlPmRpYWxvZ0VsZW1lbnQuaXNvbGF0ZVNjb3BlKCk7XG5cbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5zZXJ2aWNlKCckZGlhbG9nJywgVGhyZWFkLlNlcnZpY2VzLkRpYWxvZ1NlcnZpY2UpOyIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSwgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55KSB7XG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZEVsIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImpzLXBhZ2VfX2JhY2tncm91bmQgbC1wYWdlX19iYWNrZ3JvdW5kXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG5cbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZHluYW1pYyBiYWNrZ3JvdW5kIGVuZCEgUGxlYXNlIGFkZCB0aGUgYXR0cmlidXRlIFwiZHluYW1pYy1iYWNrZ3JvdW5kLWVuZFwiIHRvIGEgY2hpbGQgZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyBvcHRpb25hbEhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTsiLCIvKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgIGxldCBuZ01vZGVsQ3RybCA6IG5nLklOZ01vZGVsQ29udHJvbGxlciA9IGlucHV0RmllbGQuY29udHJvbGxlcignbmdNb2RlbCcpO1xuXG4gICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuXG4gICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdibHVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIXZhbHVlIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdmb2N1cycpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdibHVyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnLCBbXSkuZGlyZWN0aXZlKCdmbG9hdGluZ0xhYmVsJywgKCR0aW1lb3V0KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQycsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH1cbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnB1dFJlcXVpcmVBdHRyaWJ1dGVzIHtcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBUaHJlYWQuQ29tcG9uZW50cy5JbnB1dFJlcXVpcmVBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdyZXF1aXJlZCcpIHx8IGF0dHJzLmhpZGVSZXF1aXJlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhaW5wdXRGaWVsZC52YWwoKSk7XG5cbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIvKipcbiAqIE1lbnVcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDYvMjAxNlxuICovXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xuICAgIGV4cG9ydCBjbGFzcyBNZW51IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHNjb3BlID0ge307XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXN0cmljdCA9ICdFJztcbiAgICAgICAgYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgIGNvbnRyb2xsZXJBcyA9ICckbWVudSc7XG4gICAgICAgIHRlbXBsYXRlID0gYDxkaXYgY2xhc3M9XCJjLW1lbnUganMtbWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgICBtZW51Q29udGVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XG4gICAgICAgIGJhY2tkcm9wIDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7fVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3dpZHRoJykpIHtcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnRyb2xsZXIgPSBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uKCRzY29wZTogbmcuSVNjb3BlLCAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgIG9wZW4sXG4gICAgICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgICAgIGxldCBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGVmdDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcDtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMueFBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wID0gdGFyZ2V0UG9zLmJvdHRvbSAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS50b3AgPSBgJHt0b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcH1weGA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnhQb3MgPSB4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdqcy1tZW51X19jb250ZW50LS1vbi1ib2R5Jyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV07XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIGxldCBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IE1lbnUoJHRpbWVvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51VGFyZ2V0IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xuICAgICAgICB0ZW1wbGF0ZSA9IGA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYy1tZW51X190YXJnZXQgYy1idXR0b24ganMtbWVudV9fdGFyZ2V0XCJcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRtZW51Lm9wZW4oKVwiPjwvYnV0dG9uPmA7XG5cbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xuICAgICAgICAgICAgKDxhbnk+c2NvcGUpLiRtZW51ID0gY3RybDtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51VGFyZ2V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgTWVudUNvbnRlbnQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUNvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBNZW51SXRlbSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICBzY29wZSA9IHRydWU7XG4gICAgICAgIHRlbXBsYXRlID0gJzxhIGNsYXNzPVwiYy1idXR0b24gYy1idXR0b24tLW1lbnUgYy1tZW51X19pdGVtIGpzLW1lbnVfX2l0ZW1cIiBuZy10cmFuc2NsdWRlPjwvYT4nO1xuXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVJdGVtKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmxldCBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51LmZhY3RvcnkoKV0pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVJdGVtJywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUl0ZW0uZmFjdG9yeSgpKTsiLCIvKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG5cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFByb2Rpc0NvbnRyb2xsZXIge1xuICAgICAgICBjdXJyZW50U2VjdGlvbjogbnVtYmVyO1xuICAgICAgICBzZWN0aW9uczogYW55W107XG5cbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICBpZiAoKyt0aGlzLmN1cnJlbnRTZWN0aW9uID49IHRoaXMuc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnb1RvKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlU2VjdGlvbnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcbiAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlclNlY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTZWN0aW9uSGVpZ2h0KHNlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtcHJvZGlzIGpzLXByb2Rpc1wiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlX19zZWN0aW9uIGMtcHJvZGlzX19zZWN0aW9uIGpzLXByb2Rpc19fc2VjdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLWNvbXBsZXRlJzogJHByb2Rpc1NlY3Rpb24uaXNDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIGxldCAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIFNjcm9sbENvbGxhcHNlIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHdpbmRvdyddO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFzdFNjcm9sbCA9IDA7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG5cbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgdXBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpID0+IG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTtcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLCBbXSkuZGlyZWN0aXZlKCdzY3JvbGxDb2xsYXBzZScsIFsnJHdpbmRvdycsIFRocmVhZC5Db21wb25lbnRzLlNjcm9sbENvbGxhcHNlLmZhY3RvcnkoKV0pOyIsImltcG9ydCBTZWxlY3RDb250cm9sbGVyID0gVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcjtcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbk1vZGVsIHtcbiAgICAgICAgbmFtZTogU3RyaW5nO1xuICAgICAgICB2YWx1ZTogYW55O1xuICAgICAgICBpc0hpZ2hsaWdodGVkOiBib29sZWFuO1xuICAgICAgICBpc1NlbGVjdGVkOiBib29sZWFuO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IFN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgU2VsZWN0Q29udHJvbGxlciB7XG4gICAgICAgIG9wdGlvbnMgPSBbXTtcbiAgICAgICAgc2VsZWN0ZWQ6IE9wdGlvbk1vZGVsO1xuICAgICAgICBoaWdobGlnaHRlZDogT3B0aW9uTW9kZWw7XG4gICAgICAgIG1vZGVsOiBhbnk7XG4gICAgICAgIGlzT3BlbjogYm9vbGVhbjtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgYWRkT3B0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaChuZXcgT3B0aW9uTW9kZWwobmFtZSwgdmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW5PcHRpb25MaXN0KCkge1xuICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICBwYXJlbnRQb3MudG9wICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG4gICAgICAgICAgICBsZXQgYmFja2Ryb3A6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25MaXN0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSBgJHt0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRofXB4YDtcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IGAke3BhcmVudFBvcy5sZWZ0IC0gMTZ9cHhgO1xuICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS50b3AgPSBgJHtwYXJlbnRQb3MudG9wIC0gMTR9cHhgO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZC5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuaXMtc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0RWxlbWVudFBvc2l0aW9uSW5WaWV3KHBhcmVudDogSFRNTEVsZW1lbnQsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50UmVjdCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGxldCBlbGVtZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIGxldCBwYXJlbnRUb3AgPSBwYXJlbnRSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgbGV0IHBhcmVudEJvdHRvbSA9IHBhcmVudFJlY3QuYm90dG9tICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbiAgICAgICAgICAgIGxldCBlbGVtZW50VG9wID0gZWxlbWVudFJlY3QudG9wICsgcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgIGxldCBlbGVtZW50Qm90dG9tID0gZWxlbWVudFJlY3QuYm90dG9tICsgcGFyZW50LnNjcm9sbFRvcDtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnRSZWN0LnRvcCA8IHBhcmVudFRvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50VG9wIC0gcGFyZW50VG9wO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50UmVjdC5ib3R0b20gPiBwYXJlbnRCb3R0b20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudEJvdHRvbSAtIHBhcmVudEJvdHRvbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjbG9zZU9wdGlvbkxpc3QoKSB7XG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uTGlzdDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgbGV0IGJhY2tkcm9wOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5pcy1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBsZXQgbmV3UG9zaXRpb24gPSB0aGlzLmdldEVsZW1lbnRQb3NpdGlvbkluVmlldyhvcHRpb25MaXN0LCBzZWxlY3RlZCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zY3JvbGxUb3AgPSBuZXdQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxlY3Qob3B0aW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gb3B0aW9uO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZC5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb24udmFsdWU7XG4gICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGlnaGxpZ2h0TmV4dCgpIHtcbiAgICAgICAgICAgIGxldCBpZHg6IG51bWJlciA9IC0xO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpZHggPj0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDEgfHwgaWR4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudW5IaWdobGlnaHRBbGwoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaGlnaGxpZ2h0UHJldigpIHtcbiAgICAgICAgICAgIGxldCBpZHg6IG51bWJlciA9IC0xO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpZHggPD0gMCkge1xuICAgICAgICAgICAgICAgIGlkeCA9IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRIaWdobGlnaHRlZCgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdW5IaWdobGlnaHRBbGwoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgT3B0aW9uQ29udHJvbGxlciB7XG5cbiAgICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JywgW10pLmRpcmVjdGl2ZSgndGRTZWxlY3QnLCAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLXNlbGVjdCBjLWlucHV0X19maWVsZCBqcy1zZWxlY3RcIiB0YWJpbmRleD1cIjBcIiBuZy1jbGljaz1cIiRzZWxlY3RDdHJsLm9wZW5PcHRpb25MaXN0KCk7XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1zZWxlY3RfX2JhY2tkcm9wIGpzLXNlbGVjdF9fYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGNsYXNzPVwiYy1zZWxlY3RfX3ZhbHVlXCI+e3skc2VsZWN0Q3RybC5tb2RlbCB8fCAnICd9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBhcmlhLWhpZGRlbj1cInRydWVcIiBjbGFzcz1cImMtc2VsZWN0X19tZW51IGpzLXNlbGVjdF9fbWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImMtc2VsZWN0X19tZW51LWl0ZW0ganMtc2VsZWN0X19tZW51LWl0ZW1cIiBuZy1yZXBlYXQ9XCJvcHRpb24gaW4gJHNlbGVjdEN0cmwub3B0aW9uc1wiIG5nLWNsYXNzPVwieydoYXMtZm9jdXMnOiBvcHRpb24uaXNIaWdobGlnaHRlZCwgJ2lzLXNlbGVjdGVkJzogb3B0aW9uLmlzU2VsZWN0ZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+e3tvcHRpb24ubmFtZX19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cIm1pIGMtc2VsZWN0X19hcnJvd1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPmFycm93X2Ryb3BfZG93bjwvaT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJjLXNlbGVjdF9fYm94XCIgbmctdHJhbnNjbHVkZSBuZy1tb2RlbD1cIiRzZWxlY3RDdHJsLm1vZGVsXCIgdGFiaW5kZXg9XCItMVwiPjwvc2VsZWN0PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0Q3RybCcsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogU2VsZWN0Q29udHJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XG5cbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNlbGVjdF9fbWVudS1pdGVtJykpO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9uLm9uKCdtb3VzZWVudGVyIG1vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwudW5IaWdobGlnaHRBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYmFja2Ryb3Aub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogICAgLy9hcnJvdyB1cFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OiAgICAvL2Fycm93IGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0UHJldigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTogICAgLy9hcnJvdyByaWdodFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOiAgICAvL2Fycm93IGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0TmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjogICAgLy9zcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5pc09wZW4gPyBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpIDogY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzogICAgLy9lbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0cmwuaXNPcGVuICYmIGN0cmwuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChjdHJsLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPG9wdGlvbiBuZy10cmFuc2NsdWRlIG5nLXZhbHVlPVwiJHNlbGVjdE9wdGlvbkN0cmwudmFsdWVcIj48L29wdGlvbj4nLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0T3B0aW9uQ3RybCcsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGxpbmsoc2NvcGU6IGFueSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcikge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gYXR0cnMudmFsdWUgfHwgZWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXFxzLywgJycpO1xuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBTZWxlY3QgUmVzaXplXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xOS8yMDE2XG4gKi9cblxuaW50ZXJmYWNlIHNlbGVjdFJlc2l6ZVNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcbiAgICByZXNpemVEZWZhdWx0IDogbnVtYmVyO1xuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcbiAgICBwYXJlbnQ6IHN0cmluZztcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnLCBbXSkuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemVQYXJlbnQnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcigkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsICgkdGltZW91dCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmU6ICc/XnNlbGVjdFJlc2l6ZVBhcmVudCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxuICAgICAgICAgICAgcmVzaXplRGVmYXVsdDogJ0AnLFxuICAgICAgICB9LFxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgbGV0IGFycm93V2lkdGggPSAyNDtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICg8SFRNTE9wdGlvbkVsZW1lbnQ+ZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSkudGV4dDtcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XG5cbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gc2NvcGUucmVzaXplRGVmYXVsdCB8fCAxNTA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRoICsgYXJyb3dXaWR0aH1weGA7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25SZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiLyoqXG4gKiBUYWIgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XG4gKi9cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgaW50ZXJmYWNlIFRhYnMge1xuICAgICAgICBsYXN0VGFiOiBudW1iZXI7XG4gICAgICAgIGFjdGl2ZVRhYjogbnVtYmVyO1xuICAgICAgICB0YWJzOiBBcnJheTxPYmplY3Q+O1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVGl0bGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XG4gICAgICAgICR0YWJzOiBUYWJzQ29udHJvbGxlcjtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgVGFic0NvbnRyb2xsZXIgaW1wbGVtZW50cyBUYWJze1xuICAgICAgICBhY3RpdmVUYWIgPSAxO1xuICAgICAgICB0YWJzID0gW107XG4gICAgICAgIGxhc3RUYWIgPSAtMTtcblxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLCBwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgJG9uSW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiAoPGFueT50aGlzKS5jdXJyZW50VGFiLCAobmV3VmFsdWUsIG9sZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAoPGFueT50aGlzKS51cGRhdGVUYWJzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXNpemVUYWJzKCkge1xuICAgICAgICAgICAgbGV0IHdpZHRoOiBOdW1iZXIgPSAxNjtcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB0YWJIZWFkZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcbiAgICAgICAgICAgIHRhYkhlYWRlci5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZFRhYihoZWFkZXIgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBib2R5IDogbmcuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgICAgICAgICAgbGV0IGlkeCA6IG51bWJlciA9IHRoaXMudGFicy5wdXNoKHtcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJykpLmFwcGVuZChoZWFkZXIpO1xuXG4gICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgIGJvZHkuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcblxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xuXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYW5nZVRhYihldmVudDogSlF1ZXJ5RXZlbnRPYmplY3QsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgICAgIGlmKGluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RkLXRhYi1pbmRleCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoaW5kZXggJiYgaW5kZXggIT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZVRhYnMoKSB7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0IDogTnVtYmVyO1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQgOiBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBpICsgMTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XG5cbiAgICAgICAgICAgICAgICBpZihpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRhYihpZHg6IG51bWJlcikge1xuICAgICAgICAgICAgKDxIVE1MRWxlbWVudD5kb2N1bWVudC5hY3RpdmVFbGVtZW50KS5ibHVyKCk7XG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5ib2R5LnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlci13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19oZWFkZXIganMtdGFiX19oZWFkZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50LXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQganMtdGFiX19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckdGFicycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXJdLFxuICAgICAgICBsaW5rOiAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlYWR5Q2hlY2tJbnRlcnZhbCA9ICRpbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYicsICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XG4gICAgICAgICAgICBsZXQgYm9keSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2JvZHknKSk7XG5cbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHJsLmFkZFRhYihoZWFkZXIsIGJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYlRpdGxlJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNsYXNzPVwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiR0YWJzLmNoYW5nZVRhYigkZXZlbnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcbiAgICAgICAgbGluayhzY29wZTogVGhyZWFkLkNvbXBvbmVudHMuVGFiVGl0bGVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcbiAgICAgICAgICAgIHNjb3BlLiR0YWJzID0gY3RybDtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXG4gICAgfTtcbn0pOyIsIi8qKlxuICogV2F2ZSBlZmZlY3RcbiAqIEEgZGlyZWN0aXZlIHRoYXQgc2hvd3MgYSBncm93aW5nIGNpcmNsZSBpbiB0aGUgYmFja2dyb3VuZFxuICogb2YgY29tcG9uZW50cyBpdCdzIGF0dGFjaGVkIHRvXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMS8yMDE2XG4gKi9cbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3QgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcbiAgICAgICAgcmVzdHJpY3QgPSAnQSc7XG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgd2F2ZUVsO1xuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgbGV0IGlzRmFiID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1mYWInKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnd2F2ZS1lZmZlY3QtLWZhYicpO1xuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IGAke3Bvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnR9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9IGAke3Bvcy50b3AgLSBwYXJlbnRQb3MudG9wfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcblxuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHdhdmVFbCkge1xuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9mZignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7XG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xuICAgICAgICByZXN0cmljdCA9ICdDJztcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcpLmRpcmVjdGl2ZSgnY0J1dHRvbicsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKV0pO1xuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cblxubW9kdWxlIHRocmVhZCB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgndGhyZWFkJywgW1xuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcbiAgICAgICAgJ3RocmVhZC53YXZlRWZmZWN0JyxcbiAgICAgICAgJ3RocmVhZC5tZW51JyxcbiAgICAgICAgJ3RocmVhZC50YWInLFxuICAgICAgICAndGhyZWFkLmZsb2F0aW5nTGFiZWwnLFxuICAgICAgICAndGhyZWFkLmlucHV0UmVxdWlyZScsXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3RSZXNpemUnLFxuICAgICAgICAndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJyxcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdCdcbiAgICBdKTtcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

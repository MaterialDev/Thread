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
                ctrl.closeOptionList();
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
                        if (ctrl.isOpen && ctrl.highlighted) {
                            ctrl.select(ctrl.highlighted);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvZmxvYXRpbmdMYWJlbC9mbG9hdGluZ0xhYmVsLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL21lbnUvbWVudS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Byb2Rpcy9wcm9kaXMuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zY3JvbGxDb2xsYXBzZS9zY3JvbGxDb2xsYXBzZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0NoQyxJQUFP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O1FBQ0E7UUFDQTs7R0FkRCxXQUFBLFNBQU07QWRxa0NiIiwiZmlsZSI6InRocmVhZC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnLCBbXSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIERpYWxvZ0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gRGlhbG9nQ29udHJvbGxlcigkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7IH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuJG9uRGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gRGlhbG9nQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyID0gRGlhbG9nQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuZGlyZWN0aXZlKCd0ZERpYWxvZycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsIFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ0NvbnRyb2xsZXJdLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xuICAgIH07XG59KTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBTZXJ2aWNlcztcbiAgICAoZnVuY3Rpb24gKFNlcnZpY2VzKSB7XG4gICAgICAgIHZhciBEaWFsb2dTZXJ2aWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIERpYWxvZ1NlcnZpY2UoJHEsICRyb290U2NvcGUsICRjb21waWxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kcSA9ICRxO1xuICAgICAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRGlhbG9nU2VydmljZS5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dFbGVtZW50O1xuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dTY29wZTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KFwiXFxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cXFwiXCIgKyBvcHRpb25zLnRhcmdldCArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU9XFxcIlwiICsgb3B0aW9ucy50ZW1wbGF0ZSArIFwiXFxcIlxcbiAgICAgICAgICAgICAgICA+PC90ZC1kaWFsb2c+XFxuICAgICAgICAgICAgXCIpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kY29tcGlsZShkaWFsb2dFbGVtZW50KShvcHRpb25zLnNjb3BlIHx8IHRoaXMuJHJvb3RTY29wZSk7XG4gICAgICAgICAgICAgICAgZGlhbG9nU2NvcGUgPSBkaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2dTZXJ2aWNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBTZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlID0gRGlhbG9nU2VydmljZTtcbiAgICB9KShTZXJ2aWNlcyA9IFRocmVhZC5TZXJ2aWNlcyB8fCAoVGhyZWFkLlNlcnZpY2VzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLCBbXSkuZGlyZWN0aXZlKCdkeW5hbWljQmFja2dyb3VuZCcsIGZ1bmN0aW9uICgkd2luZG93LCAkaW50ZXJ2YWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgYmFja2dyb3VuZEVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwianMtcGFnZV9fYmFja2dyb3VuZCBsLXBhZ2VfX2JhY2tncm91bmRcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChiYWNrZ3JvdW5kRWwpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZHlDaGVja0ludGVydmFsXzEgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbF8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZiA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2R5bmFtaWMtYmFja2dyb3VuZC1lbmRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXRvZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjdXRvZmZSZWN0ID0gY3V0b2ZmLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25hbEhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1dG9mZlJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKyA2NDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcbiAgICB9O1xufSk7XG4vKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICBpZiAoYXR0cnMubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgIHZhciBuZ01vZGVsQ3RybCA9IGlucHV0RmllbGQuY29udHJvbGxlcignbmdNb2RlbCcpO1xuICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5pbnB1dFJlcXVpcmUnLCBbXSkuZGlyZWN0aXZlKCdjSW5wdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0MnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuYy1pbnB1dF9fZmllbGQnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1yZXF1aXJlZCcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy1yZXF1aXJlZC1pbnZhbGlkJywgIWlucHV0RmllbGQudmFsKCkpO1xuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBNZW51XG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBNZW51ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnUoJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0UnO1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZFRvQ29udHJvbGxlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyQXMgPSAnJG1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcImMtbWVudSBqcy1tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXFxcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKFwiYy1tZW51X19jb250ZW50LS13aWR0aC1cIiArIGF0dHJzLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BsaXRQb3MgPSBhdHRycy5wb3NpdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbihzcGxpdFBvc1swXSwgc3BsaXRQb3NbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRQb3NpdGlvbigndG9wJywgJ2xlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGN0cmwuY2xvc2UoKTsgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeFBvczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IG9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGNsb3NlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiBzZXRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5OiBtb3ZlVG9Cb2R5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1lbnVDb250ZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJhY2tkcm9wID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tZW51Q29udGVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lbnVUYXJnZXQgPSBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX3RhcmdldCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UG9zID0gbWVudVRhcmdldFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxlZnQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b3BfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnhQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLnJpZ2h0IC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gdGFyZ2V0UG9zLmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wXzEgPSB0YXJnZXRQb3MudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfMSA9IHRhcmdldFBvcy5ib3R0b20gLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSAobGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUudG9wID0gKHRvcF8xICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmJvdHRvbSA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKSkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gc2V0UG9zaXRpb24oeVBvc2l0aW9uLCB4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS10b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnYy1tZW51X19jb250ZW50LS1ib3R0b20nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnhQb3MgPSB4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQm9keSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5iYWNrZHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBNZW51KCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE1lbnUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiBNZW51O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnUgPSBNZW51O1xuICAgICAgICB2YXIgTWVudVRhcmdldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51VGFyZ2V0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IFwiPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XFxcImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFxcXCJcXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkbWVudS5vcGVuKClcXFwiPjwvYnV0dG9uPlwiO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG1lbnUgPSBjdHJsO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51VGFyZ2V0LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51VGFyZ2V0KCk7IH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIE1lbnVUYXJnZXQ7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudVRhcmdldCA9IE1lbnVUYXJnZXQ7XG4gICAgICAgIHZhciBNZW51Q29udGVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51Q29udGVudCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVDb250ZW50LmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51Q29udGVudCgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51Q29udGVudDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51Q29udGVudCA9IE1lbnVDb250ZW50O1xuICAgICAgICB2YXIgTWVudUl0ZW0gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudUl0ZW0oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zY2x1ZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnVJdGVtLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNZW51SXRlbSgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51SXRlbTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51SXRlbSA9IE1lbnVJdGVtO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xudmFyIG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XG5tZW51LmRpcmVjdGl2ZSgndGRNZW51VGFyZ2V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudVRhcmdldC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpO1xuLyoqXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXG4gKiBBIG5hdHVyYWwgbGFuZ3VhZ2UgY29tcG9uZW50IHRoYXQgc2hvd3Mgb25lXG4gKiBzZWN0aW9uIGF0IGEgdGltZSBjZW50ZXJlZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzY3JlZW5cbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA2LzE1LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBQcm9kaXNDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFByb2Rpc0NvbnRyb2xsZXIoJGVsZW1lbnQsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgrK3RoaXMuY3VycmVudFNlY3Rpb24gPj0gdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvID0gZnVuY3Rpb24gKHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuY3VycmVudFNlY3Rpb247IGkgPCB0aGlzLnNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNlY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBwcm9kaXNFbDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcm9kaXNFbCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2RpcycpO1xuICAgICAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5yZWdpc3RlclNlY3Rpb24gPSBmdW5jdGlvbiAoZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U2VjdGlvbkhlaWdodCA9IGZ1bmN0aW9uIChzZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlY3Rpb24ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICAgICAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlciA9IFByb2Rpc0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtcHJvZGlzIGpzLXByb2Rpc1xcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XCIsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXMnLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycpLmRpcmVjdGl2ZSgncHJvZGlzU2VjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLW5hdHVyYWwtbGFuZ3VhZ2VfX3NlY3Rpb24gYy1wcm9kaXNfX3NlY3Rpb24ganMtcHJvZGlzX19zZWN0aW9uXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVxcXCJ7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLXZpc2libGUnOiAkcHJvZGlzU2VjdGlvbi5pZCA8PSAkcHJvZGlzLmN1cnJlbnRTZWN0aW9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cIixcbiAgICAgICAgcmVxdWlyZTogJ15wcm9kaXMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJHNjb3BlLiRwcm9kaXM7XG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBTY3JvbGxDb2xsYXBzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTY3JvbGxDb2xsYXBzZSgkd2luZG93KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQSc7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNjcm9sbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChfdGhpcy4kd2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTY3JvbGxDb2xsYXBzZS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHdpbmRvdykgeyByZXR1cm4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2Nyb2xsQ29sbGFwc2UuJGluamVjdCA9IFsnJHdpbmRvdyddO1xuICAgICAgICAgICAgcmV0dXJuIFNjcm9sbENvbGxhcHNlO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNjcm9sbENvbGxhcHNlID0gU2Nyb2xsQ29sbGFwc2U7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBbJyR3aW5kb3cnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCldKTtcbnZhciBTZWxlY3RDb250cm9sbGVyID0gVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcjtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgT3B0aW9uTW9kZWwgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gT3B0aW9uTW9kZWwobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBPcHRpb25Nb2RlbDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5PcHRpb25Nb2RlbCA9IE9wdGlvbk1vZGVsO1xuICAgICAgICB2YXIgU2VsZWN0Q29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTZWxlY3RDb250cm9sbGVyKCRlbGVtZW50LCAkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5hZGRPcHRpb24gPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucHVzaChuZXcgT3B0aW9uTW9kZWwobmFtZSwgdmFsdWUpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuT3B0aW9uTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50UG9zID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICAgICAgcGFyZW50UG9zLnRvcCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbkxpc3QgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLndpZHRoID0gdGhpcy4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLmxlZnQgPSAocGFyZW50UG9zLmxlZnQgLSAxNikgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS50b3AgPSAocGFyZW50UG9zLnRvcCAtIDE0KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uTGlzdCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQuaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmlzLXNlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5nZXRFbGVtZW50UG9zaXRpb25JblZpZXcgPSBmdW5jdGlvbiAocGFyZW50LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudFJlY3QgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50VG9wID0gcGFyZW50UmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50Qm90dG9tID0gcGFyZW50UmVjdC5ib3R0b20gKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudFRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHBhcmVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRCb3R0b20gPSBlbGVtZW50UmVjdC5ib3R0b20gKyBwYXJlbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50UmVjdC50b3AgPCBwYXJlbnRUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRUb3AgLSBwYXJlbnRUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVsZW1lbnRSZWN0LmJvdHRvbSA+IHBhcmVudEJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudEJvdHRvbSAtIHBhcmVudEJvdHRvbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5jbG9zZU9wdGlvbkxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbkxpc3QgPSBfdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZHJvcCA9IF90aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IF90aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5pcy1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQob3B0aW9uTGlzdCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGJhY2tkcm9wKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gX3RoaXMuZ2V0RWxlbWVudFBvc2l0aW9uSW5WaWV3KG9wdGlvbkxpc3QsIHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zY3JvbGxUb3AgPSBuZXdQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZC5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBvcHRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZC5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuaGlnaGxpZ2h0TmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpZHggPj0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDEgfHwgaWR4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZHggKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51bkhpZ2hsaWdodEFsbCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5oaWdobGlnaHRQcmV2ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpZHggPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlkeCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCA9IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBTZWxlY3RDb250cm9sbGVyLnByb3RvdHlwZS5nZXRIaWdobGlnaHRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUudW5IaWdobGlnaHRBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMub3B0aW9uczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFNlbGVjdENvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlciA9IFNlbGVjdENvbnRyb2xsZXI7XG4gICAgICAgIHZhciBPcHRpb25Db250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE9wdGlvbkNvbnRyb2xsZXIoKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gT3B0aW9uQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyID0gT3B0aW9uQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JywgW10pLmRpcmVjdGl2ZSgndGRTZWxlY3QnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiYy1zZWxlY3QgYy1pbnB1dF9fZmllbGQganMtc2VsZWN0XFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgbmctY2xpY2s9XFxcIiRzZWxlY3RDdHJsLm9wZW5PcHRpb25MaXN0KCk7XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXNlbGVjdF9fYmFja2Ryb3AganMtc2VsZWN0X19iYWNrZHJvcFxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGNsYXNzPVxcXCJjLXNlbGVjdF9fdmFsdWVcXFwiPnt7JHNlbGVjdEN0cmwubW9kZWwgfHwgJyAnfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHVsIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiYy1zZWxlY3RfX21lbnUganMtc2VsZWN0X19tZW51XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJjLXNlbGVjdF9fbWVudS1pdGVtIGpzLXNlbGVjdF9fbWVudS1pdGVtXFxcIiBuZy1yZXBlYXQ9XFxcIm9wdGlvbiBpbiAkc2VsZWN0Q3RybC5vcHRpb25zXFxcIiBuZy1jbGFzcz1cXFwieydoYXMtZm9jdXMnOiBvcHRpb24uaXNIaWdobGlnaHRlZCwgJ2lzLXNlbGVjdGVkJzogb3B0aW9uLmlzU2VsZWN0ZWR9XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XFxcIiRzZWxlY3RDdHJsLnNlbGVjdChvcHRpb24pOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcXFwiPnt7b3B0aW9uLm5hbWV9fVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcIm1pIGMtc2VsZWN0X19hcnJvd1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPmFycm93X2Ryb3BfZG93bjwvaT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVxcXCJjLXNlbGVjdF9fYm94XFxcIiBuZy10cmFuc2NsdWRlIG5nLW1vZGVsPVxcXCIkc2VsZWN0Q3RybC5tb2RlbFxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48L3NlbGVjdD5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlwiLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0Q3RybCcsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIHZhciBiYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX2JhY2tkcm9wJykpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc2VsZWN0X19tZW51LWl0ZW0nKSk7XG4gICAgICAgICAgICAgICAgb3B0aW9uLm9uKCdtb3VzZWVudGVyIG1vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwudW5IaWdobGlnaHRBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhY2tkcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogLy9hcnJvdyB1cFxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodFByZXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vYXJyb3cgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5oaWdobGlnaHROZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5pc09wZW4gPyBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpIDogY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmlzT3BlbiAmJiBjdHJsLmhpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZWxlY3QoY3RybC5oaWdobGlnaHRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPG9wdGlvbiBuZy10cmFuc2NsdWRlIG5nLXZhbHVlPVwiJHNlbGVjdE9wdGlvbkN0cmwudmFsdWVcIj48L29wdGlvbj4nLFxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0T3B0aW9uQ3RybCcsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGF0dHJzLnZhbHVlIHx8IGVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL1xccy8sICcnKTtcbiAgICAgICAgICAgIHNjb3BlLiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBjdHJsLmFkZE9wdGlvbihlbGVtZW50LnRleHQoKSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLyoqXG4gKiBTZWxlY3QgUmVzaXplXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xOS8yMDE2XG4gKi9cbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmU6ICc/XnNlbGVjdFJlc2l6ZVBhcmVudCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxuICAgICAgICAgICAgcmVzaXplRGVmYXVsdDogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgIHZhciBhcnJvd1dpZHRoID0gMjQ7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBlbC5vcHRpb25zW2VsLnNlbGVjdGVkSW5kZXhdLnRleHQ7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZXN0RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuPicpLmh0bWwodGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGN0cmwgPyBjdHJsLmdldEVsZW1lbnQoKSA6IGVsZW1lbnQucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudF8xLmFwcGVuZCh0ZXN0RWwpO1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRlc3RFbFswXS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5zdHlsZS53aWR0aCA9ICh3aWR0aCArIGFycm93V2lkdGgpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIGlmIChzY29wZS5vblJlc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcbi8qKlxuICogVGFiIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3Mgc3dpdGNoaW5nIGJldHdlZW5cbiAqIHNldHMgb2YgY29udGVudCBzZXBhcmF0ZWQgaW50byBncm91cHMgYnkgdGFic1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMDgvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFRhYnNDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFRhYnNDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5jdXJyZW50VGFiOyB9LCBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAmJiBuZXdWYWx1ZSA9PT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VUYWIobnVsbCwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLnJlc2l6ZVRhYnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gMTY7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRhYkhlYWRlciA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9faGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gd2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmFkZFRhYiA9IGZ1bmN0aW9uIChoZWFkZXIsIGJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gdGhpcy50YWJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgYm9keTogYm9keVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpKS5hcHBlbmQoaGVhZGVyKTtcbiAgICAgICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcbiAgICAgICAgICAgICAgICBib2R5LmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XG4gICAgICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5jaGFuZ2VUYWIgPSBmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCd0ZC10YWItaW5kZXgnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFiID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlVGFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBjb250ZW50O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkeCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGFiKGkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWR4ID09PSB0aGlzLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaWR4IDwgdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRhYiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLmNsZWFyVGFiID0gZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmhlYWRlci5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5ib2R5LnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBUYWJzQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5UYWJzQ29udHJvbGxlciA9IFRhYnNDb250cm9sbGVyO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInLCBbXSkuZGlyZWN0aXZlKCd0ZFRhYnMnLCBmdW5jdGlvbiAoJGludGVydmFsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWI6ICc9J1xuICAgICAgICB9LFxuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZTogXCI8ZGl2IGNsYXNzPVxcXCJjLXRhYlxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlci13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2hlYWRlciBqcy10YWJfX2hlYWRlclxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlwiLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyQXM6ICckdGFicycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXJdLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgnZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWR5Q2hlY2tJbnRlcnZhbF8yID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlYWR5Q2hlY2tJbnRlcnZhbF8yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYicsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWJzJyxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fYm9keScpKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjdHJsLmFkZFRhYihoZWFkZXIsIGJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiBcIjxidXR0b24gY2xhc3M9XFxcImMtdGFiX19oZWFkZXItaXRlbSBjLWJ1dHRvbiBjLWJ1dHRvbi0tdGFiIGpzLXRhYl9fdGl0bGVcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XFxcIiR0YWJzLmNoYW5nZVRhYigkZXZlbnQpXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+XCIsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgICAgICAgIHNjb3BlLiR0YWJzID0gY3RybDtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYkJvZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYicsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImMtdGFiX19ib2R5IGpzLXRhYl9fYm9keVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+J1xuICAgIH07XG59KTtcbi8qKlxuICogV2F2ZSBlZmZlY3RcbiAqIEEgZGlyZWN0aXZlIHRoYXQgc2hvd3MgYSBncm93aW5nIGNpcmNsZSBpbiB0aGUgYmFja2dyb3VuZFxuICogb2YgY29tcG9uZW50cyBpdCdzIGF0dGFjaGVkIHRvXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8xMS8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgd2F2ZUVmZmVjdCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiB3YXZlRWZmZWN0KCR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdBJztcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbm9XYXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgd2F2ZUVsO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmF3RWxlbWVudCA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBpc0ZhYiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4gY2xhc3M9XCJ3YXZlLWVmZmVjdFwiPjwvc3Bhbj4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1pY29uJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNGYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NpcmNsZSwgaGVpZ2h0IG11c3QgbWF0Y2ggdGhlIHdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZCh3YXZlRWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub24oJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zID0geyBsZWZ0OiBlLmNsaWVudFgsIHRvcDogZS5jbGllbnRZIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAocG9zLmxlZnQgLSBwYXJlbnRQb3MubGVmdCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAocG9zLnRvcCAtIHBhcmVudFBvcy50b3ApICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVGltZW91dCA9IF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlVXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQWN0aXZlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3YXZlRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZUVmZmVjdC5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSBmdW5jdGlvbiAoJHRpbWVvdXQpIHsgcmV0dXJuIG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0KCR0aW1lb3V0KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdmVFZmZlY3QuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcbiAgICAgICAgICAgIHJldHVybiB3YXZlRWZmZWN0O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLndhdmVFZmZlY3QgPSB3YXZlRWZmZWN0O1xuICAgICAgICB2YXIgd2F2ZUVmZmVjdEJ1dHRvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMod2F2ZUVmZmVjdEJ1dHRvbiwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhdmVFZmZlY3RCdXR0b24oKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdDJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhdmVFZmZlY3RCdXR0b24uZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR0aW1lb3V0KSB7IHJldHVybiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbigkdGltZW91dCk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3YXZlRWZmZWN0QnV0dG9uLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gd2F2ZUVmZmVjdEJ1dHRvbjtcbiAgICAgICAgfSh3YXZlRWZmZWN0KSk7XG4gICAgICAgIENvbXBvbmVudHMud2F2ZUVmZmVjdEJ1dHRvbiA9IHdhdmVFZmZlY3RCdXR0b247XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLndhdmVFZmZlY3QnLCBbXSkuZGlyZWN0aXZlKCd3YXZlRWZmZWN0JywgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdC5mYWN0b3J5KCkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JykuZGlyZWN0aXZlKCdjQnV0dG9uJywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24uZmFjdG9yeSgpXSk7XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cbnZhciB0aHJlYWQ7XG4oZnVuY3Rpb24gKHRocmVhZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXG4gICAgICAgICd0aHJlYWQuc2Nyb2xsQ29sbGFwc2UnLFxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxuICAgICAgICAndGhyZWFkLm1lbnUnLFxuICAgICAgICAndGhyZWFkLnRhYicsXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcbiAgICAgICAgJ3RocmVhZC5wcm9kaXMnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxuICAgICAgICAndGhyZWFkLmRpYWxvZycsXG4gICAgICAgICd0aHJlYWQuc2VsZWN0J1xuICAgIF0pO1xufSkodGhyZWFkIHx8ICh0aHJlYWQgPSB7fSkpO1xuIiwiYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnLCBbXSk7IiwiXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Njb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgICAgICBvcGVuOiBGdW5jdGlvbjtcclxuICAgICAgICBjbG9zZTogRnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRyb2xsZXIge1xyXG4gICAgICAgIGRlZmVyQ2FsbGJhY2s6IG5nLklEZWZlcnJlZDxhbnk+O1xyXG4gICAgICAgIGNhbmNlbGxlZDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHt9XHJcblxyXG4gICAgICAgICRvbkluaXQoKSB7fVxyXG5cclxuICAgICAgICBjbG9zZShyZXNwb25zZT8gOiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnLmlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlamVjdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sucmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbmNlbCgpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG5cclxuICAgICAgICAgICAgaWYoZGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjayA9IGRlZmVycmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25EZXN0cm95KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCAoKSA9PiB7XHJcbiAgIHJldHVybiB7XHJcbiAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyXSxcclxuICAgICAgIGNvbnRyb2xsZXJBczogJyRkaWFsb2cnXHJcbiAgIH07XHJcbn0pOyIsIm1vZHVsZSBUaHJlYWQuU2VydmljZXMge1xyXG4gICAgZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBwcml2YXRlICRxOiBuZy5JUVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogbmcuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGNvbXBpbGU6IG5nLklDb21waWxlU2VydmljZVxyXG4gICAgICAgICkge31cclxuXHJcbiAgICAgICAgb3BlbihvcHRpb25zKTogbmcuSVByb21pc2U8YW55PiB7XHJcbiAgICAgICAgICAgIGxldCBkZWZlcnJlZDogbmcuSURlZmVycmVkPGFueT47XHJcbiAgICAgICAgICAgIGxldCBkaWFsb2dFbGVtZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICAgICAgbGV0IGRpYWxvZ1Njb3BlIDogVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nU2NvcGU7XHJcblxyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGRpYWxvZ0VsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoYFxyXG4gICAgICAgICAgICAgICAgPHRkLWRpYWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIiR7b3B0aW9ucy50YXJnZXR9XCJcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZT1cIiR7b3B0aW9ucy50ZW1wbGF0ZX1cIlxyXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxyXG4gICAgICAgICAgICBgKTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGlhbG9nRWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUoZGlhbG9nRWxlbWVudCkob3B0aW9ucy5zY29wZSB8fCB0aGlzLiRyb290U2NvcGUpO1xyXG4gICAgICAgICAgICBkaWFsb2dTY29wZSA9IDxUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dTY29wZT5kaWFsb2dFbGVtZW50Lmlzb2xhdGVTY29wZSgpO1xyXG5cclxuICAgICAgICAgICAgZGlhbG9nU2NvcGUub3BlbihkZWZlcnJlZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJykuc2VydmljZSgnJGRpYWxvZycsIFRocmVhZC5TZXJ2aWNlcy5EaWFsb2dTZXJ2aWNlKTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBGbG9hdGluZyBsYWJlbFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMy8yMDE2XHJcbiAqL1xyXG5mdW5jdGlvbiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIF9mbG9hdGluZ0xhYmVsTGluayhzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IG5nLklOZ01vZGVsQ29udHJvbGxlcikge1xyXG4gICAgICAgIGlmICgoPGFueT5hdHRycykubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpbnB1dEZpZWxkIDogbmcuSUF1Z21lbnRlZEpRdWVyeSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcclxuICAgICAgICAgICAgbGV0IG5nTW9kZWxDdHJsIDogbmcuSU5nTW9kZWxDb250cm9sbGVyID0gaW5wdXRGaWVsZC5jb250cm9sbGVyKCduZ01vZGVsJyk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIWlucHV0RmllbGQudmFsKCkgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignZm9jdXMnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdibHVyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYobmdNb2RlbEN0cmwpIHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtdmFsdWUnLCAhIXZhbHVlIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQub2ZmKCdmb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsIFtdKS5kaXJlY3RpdmUoJ2Zsb2F0aW5nTGFiZWwnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJykuZGlyZWN0aXZlKCdjSW5wdXQnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcclxuICAgICAgICBsaW5rOiBmbG9hdGluZ0xhYmVsTGluaygkdGltZW91dClcclxuICAgIH1cclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XHJcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IFRocmVhZC5Db21wb25lbnRzLklucHV0UmVxdWlyZUF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogTWVudVxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IHNob3dzL2hpZGVzIGEgbGlzdCBvZiBpdGVtcyBiYXNlZCBvbiB0YXJnZXQgY2xpY2tcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wNi8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnUgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICBzY29wZSA9IHt9O1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xyXG4gICAgICAgIGNvbnRyb2xsZXJBcyA9ICckbWVudSc7XHJcbiAgICAgICAgdGVtcGxhdGUgPSBgPGRpdiBjbGFzcz1cImMtbWVudSBqcy1tZW51XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLW1lbnVfX2JhY2tkcm9wIGpzLW1lbnVfX2JhY2tkcm9wXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG5cclxuICAgICAgICBtZW51Q29udGVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgYmFja2Ryb3AgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHt9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fY29udGVudCcpKTtcclxuICAgICAgICAgICAgY3RybC5iYWNrZHJvcCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19iYWNrZHJvcCcpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnd2lkdGgnKSkge1xyXG4gICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50LmFkZENsYXNzKGBjLW1lbnVfX2NvbnRlbnQtLXdpZHRoLSR7YXR0cnMud2lkdGh9YClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdtb3ZlVG9Cb2R5JykpIHtcclxuICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ3Bvc2l0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzcGxpdFBvcyA9IGF0dHJzLnBvc2l0aW9uLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKHNwbGl0UG9zWzBdLCBzcGxpdFBvc1sxXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFBvc2l0aW9uKCd0b3AnLCAnbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY3RybC5tZW51Q29udGVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbWVudV9faXRlbScpKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IGN0cmwuY2xvc2UoKSwgMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29udHJvbGxlciA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgZnVuY3Rpb24oJHNjb3BlOiBuZy5JU2NvcGUsICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHtcclxuICAgICAgICAgICAgICAgIG9uQm9keTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB4UG9zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgeVBvczogbnVsbCxcclxuICAgICAgICAgICAgICAgIG9wZW4sXHJcbiAgICAgICAgICAgICAgICBjbG9zZSxcclxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgbW92ZVRvQm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVudVRhcmdldCA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fdGFyZ2V0JykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXRQb3MgPSBtZW51VGFyZ2V0WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MucmlnaHQgLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgPSB0YXJnZXRQb3MubGVmdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy55UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MudG9wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLmxlZnQgPSBgJHtsZWZ0ICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9IGAke3RvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnJpZ2h0ID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUuYm90dG9tID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudScpKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZHJvcC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQb3NpdGlvbih5UG9zaXRpb24sIHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXRvcCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWJvdHRvbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHhQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMueFBvcyA9IHhQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZVRvQm9keSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Cb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLm1lbnVDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLmFwcGVuZCh0aGlzLmJhY2tkcm9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBNZW51KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVUYXJnZXQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGVcclxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRtZW51Lm9wZW4oKVwiPjwvYnV0dG9uPmA7XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgKDxhbnk+c2NvcGUpLiRtZW51ID0gY3RybDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVUYXJnZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbnVDb250ZW50IGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVxdWlyZSA9ICdedGRNZW51JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPHVsIGNsYXNzPVwiYy1tZW51X19jb250ZW50IGpzLW1lbnVfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvdWw+JztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51Q29udGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudUl0ZW0gaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnVDb250ZW50JztcclxuICAgICAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICBzY29wZSA9IHRydWU7XHJcbiAgICAgICAgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudUl0ZW0oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51JywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnUuZmFjdG9yeSgpXSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVUYXJnZXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51VGFyZ2V0LmZhY3RvcnkoKSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUl0ZW0nLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51SXRlbS5mYWN0b3J5KCkpOyIsIi8qKlxyXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlXHJcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcclxuICogc2VjdGlvbiBhdCBhIHRpbWUgY2VudGVyZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxyXG4gKi9cclxuXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgUHJvZGlzQ29udHJvbGxlciB7XHJcbiAgICAgICAgY3VycmVudFNlY3Rpb246IG51bWJlcjtcclxuICAgICAgICBzZWN0aW9uczogYW55W107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5zZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ29UbyhzZWN0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlY3Rpb25zW2ldLm5hbWUgPT09IHNlY3Rpb25OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0Q3VycmVudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVTZWN0aW9ucygpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHByb2Rpc0VsIDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHRoaXMuZ2V0U2VjdGlvbkhlaWdodCh0aGlzLnNlY3Rpb25zW2ldLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcm9kaXNFbCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXMnKTtcclxuICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlZ2lzdGVyU2VjdGlvbihlbGVtZW50LCBuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldFNlY3Rpb25IZWlnaHQoc2VjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXIgPSBzZWN0aW9uLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgbGV0IHN0eWxlIDogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGdldENvbXB1dGVkU3R5bGUoc2VjdGlvbik7XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnByb2RpcycsIFtdKS5kaXJlY3RpdmUoJ3Byb2RpcycsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1uYXR1cmFsLWxhbmd1YWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXByb2RpcyBqcy1wcm9kaXNcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuUHJvZGlzQ29udHJvbGxlcl1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnKS5kaXJlY3RpdmUoJ3Byb2Rpc1NlY3Rpb24nLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cIntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tY29tcGxldGUnOiAkcHJvZGlzU2VjdGlvbi5pc0NvbXBsZXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS12aXNpYmxlJzogJHByb2Rpc1NlY3Rpb24uaWQgPD0gJHByb2Rpcy5jdXJyZW50U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XCIgbmctdHJhbnNjbHVkZT48L2Rpdj5gLFxyXG4gICAgICAgIHJlcXVpcmU6ICdecHJvZGlzJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIC8vcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICAgICAgICBsZXQgJHBhcmVudCA9ICRzY29wZS4kcHJvZGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gJHBhcmVudC5yZWdpc3RlclNlY3Rpb24oJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXByb2Rpc19fc2VjdGlvbicpLCAkYXR0cnMubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBTY3JvbGxDb2xsYXBzZSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckd2luZG93J107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpbmsgPSAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0U2Nyb2xsID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiR3aW5kb3cpLm9uKCdzY3JvbGwnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Nyb2xsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyBkb3duXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsID4gbGFzdFNjcm9sbCArIDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtY29sbGFwc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNjcm9sbCA9IHNjcm9sbDtcclxuICAgICAgICAgICAgICAgICAgICAvL1Njcm9sbGluZyB1cFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGl2ZSA9ICgkd2luZG93OiBuZy5JV2luZG93U2VydmljZSkgPT4gbmV3IFNjcm9sbENvbGxhcHNlKCR3aW5kb3cpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgWyckd2luZG93JywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpXSk7IiwiaW1wb3J0IFNlbGVjdENvbnRyb2xsZXIgPSBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyO1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIE9wdGlvbk1vZGVsIHtcclxuICAgICAgICBuYW1lOiBTdHJpbmc7XHJcbiAgICAgICAgdmFsdWU6IGFueTtcclxuICAgICAgICBpc0hpZ2hsaWdodGVkOiBib29sZWFuO1xyXG4gICAgICAgIGlzU2VsZWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IFN0cmluZywgdmFsdWU6IGFueSkge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFNlbGVjdENvbnRyb2xsZXIge1xyXG4gICAgICAgIG9wdGlvbnMgPSBbXTtcclxuICAgICAgICBzZWxlY3RlZDogT3B0aW9uTW9kZWw7XHJcbiAgICAgICAgaGlnaGxpZ2h0ZWQ6IE9wdGlvbk1vZGVsO1xyXG4gICAgICAgIG1vZGVsOiBhbnk7XHJcbiAgICAgICAgaXNPcGVuOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRPcHRpb24obmFtZSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2gobmV3IE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcGVuT3B0aW9uTGlzdCgpIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHBhcmVudFBvcy5sZWZ0ICs9IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgcGFyZW50UG9zLnRvcCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgIGxldCBiYWNrZHJvcDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uTGlzdDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUud2lkdGggPSBgJHt0aGlzLiRlbGVtZW50WzBdLm9mZnNldFdpZHRofXB4YDtcclxuICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS5sZWZ0ID0gYCR7cGFyZW50UG9zLmxlZnQgLSAxNn1weGA7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUudG9wID0gYCR7cGFyZW50UG9zLnRvcCAtIDE0fXB4YDtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdGhpcy5zZWxlY3RlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQuaXNIaWdobGlnaHRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5pcy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRFbGVtZW50UG9zaXRpb25JblZpZXcocGFyZW50OiBIVE1MRWxlbWVudCwgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudFJlY3QgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGFyZW50VG9wID0gcGFyZW50UmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcclxuICAgICAgICAgICAgbGV0IHBhcmVudEJvdHRvbSA9IHBhcmVudFJlY3QuYm90dG9tICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICBsZXQgZWxlbWVudFRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHBhcmVudC5zY3JvbGxUb3A7XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50Qm90dG9tID0gZWxlbWVudFJlY3QuYm90dG9tICsgcGFyZW50LnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50UmVjdC50b3AgPCBwYXJlbnRUb3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50VG9wIC0gcGFyZW50VG9wO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnRSZWN0LmJvdHRvbSA+IHBhcmVudEJvdHRvbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRCb3R0b20gLSBwYXJlbnRCb3R0b207XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50LnNjcm9sbFRvcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xvc2VPcHRpb25MaXN0KCkge1xyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHRpb25MaXN0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zZWxlY3RfX21lbnUnKTtcclxuICAgICAgICAgICAgICAgIGxldCBiYWNrZHJvcDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5pcy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3UG9zaXRpb24gPSB0aGlzLmdldEVsZW1lbnRQb3NpdGlvbkluVmlldyhvcHRpb25MaXN0LCBzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zY3JvbGxUb3AgPSBuZXdQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VsZWN0KG9wdGlvbikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZC5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBvcHRpb247XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb24udmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VPcHRpb25MaXN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdobGlnaHROZXh0KCkge1xyXG4gICAgICAgICAgICBsZXQgaWR4OiBudW1iZXIgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpZHggPj0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDEgfHwgaWR4ID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZHggPSAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWR4ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudW5IaWdobGlnaHRBbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhpZ2hsaWdodFByZXYoKSB7XHJcbiAgICAgICAgICAgIGxldCBpZHg6IG51bWJlciA9IC0xO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlkeCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZHggPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdGhpcy5vcHRpb25zW2lkeF07XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpZHhdLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0SGlnaGxpZ2h0ZWQoKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1bkhpZ2hsaWdodEFsbCgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBPcHRpb25Db250cm9sbGVyIHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JywgW10pLmRpcmVjdGl2ZSgndGRTZWxlY3QnLCAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBtb2RlbDogJz1uZ01vZGVsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYy1zZWxlY3QgYy1pbnB1dF9fZmllbGQganMtc2VsZWN0XCIgdGFiaW5kZXg9XCIwXCIgbmctY2xpY2s9XCIkc2VsZWN0Q3RybC5vcGVuT3B0aW9uTGlzdCgpO1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1zZWxlY3RfX2JhY2tkcm9wIGpzLXNlbGVjdF9fYmFja2Ryb3BcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCIgY2xhc3M9XCJjLXNlbGVjdF9fdmFsdWVcIj57eyRzZWxlY3RDdHJsLm1vZGVsIHx8ICcgJ319PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dWwgYXJpYS1oaWRkZW49XCJ0cnVlXCIgY2xhc3M9XCJjLXNlbGVjdF9fbWVudSBqcy1zZWxlY3RfX21lbnVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImMtc2VsZWN0X19tZW51LWl0ZW0ganMtc2VsZWN0X19tZW51LWl0ZW1cIiBuZy1yZXBlYXQ9XCJvcHRpb24gaW4gJHNlbGVjdEN0cmwub3B0aW9uc1wiIG5nLWNsYXNzPVwieydoYXMtZm9jdXMnOiBvcHRpb24uaXNIaWdobGlnaHRlZCwgJ2lzLXNlbGVjdGVkJzogb3B0aW9uLmlzU2VsZWN0ZWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cIiRzZWxlY3RDdHJsLnNlbGVjdChvcHRpb24pOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIj57e29wdGlvbi5uYW1lfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwibWkgYy1zZWxlY3RfX2Fycm93XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+YXJyb3dfZHJvcF9kb3duPC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiYy1zZWxlY3RfX2JveFwiIG5nLXRyYW5zY2x1ZGUgbmctbW9kZWw9XCIkc2VsZWN0Q3RybC5tb2RlbFwiIHRhYmluZGV4PVwiLTFcIj48L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0Q3RybCcsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogU2VsZWN0Q29udHJvbGxlcikge1xyXG4gICAgICAgICAgICBsZXQgYmFja2Ryb3AgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpKTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHRpb24gPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc2VsZWN0X19tZW51LWl0ZW0nKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLm9uKCdtb3VzZWVudGVyIG1vdXNlbGVhdmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC51bkhpZ2hsaWdodEFsbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYmFja2Ryb3Aub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogICAgLy9hcnJvdyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6ICAgIC8vYXJyb3cgbGVmdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cmwuaXNPcGVuKSBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0UHJldigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOTogICAgLy9hcnJvdyByaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6ICAgIC8vYXJyb3cgZG93blxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cmwuaXNPcGVuKSBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0TmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjogICAgLy9zcGFjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmlzT3BlbiA/IGN0cmwuY2xvc2VPcHRpb25MaXN0KCkgOiBjdHJsLm9wZW5PcHRpb25MaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOiAgICAvL2VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLmlzT3BlbiAmJiBjdHJsLmhpZ2hsaWdodGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNlbGVjdChjdHJsLmhpZ2hsaWdodGVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3QnKS5kaXJlY3RpdmUoJ3RkT3B0aW9uJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkU2VsZWN0JyxcclxuICAgICAgICB0ZW1wbGF0ZTogJzxvcHRpb24gbmctdHJhbnNjbHVkZSBuZy12YWx1ZT1cIiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlXCI+PC9vcHRpb24+JyxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5PcHRpb25Db250cm9sbGVyLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRzZWxlY3RPcHRpb25DdHJsJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTogYW55LCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55LCBjdHJsOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGF0dHJzLnZhbHVlIHx8IGVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL1xccy8sICcnKTtcclxuICAgICAgICAgICAgc2NvcGUuJHNlbGVjdE9wdGlvbkN0cmwudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgY3RybC5hZGRPcHRpb24oZWxlbWVudC50ZXh0KCksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogU2VsZWN0IFJlc2l6ZVxyXG4gKiBBdXRvbWF0aWNhbGx5IHJlc2l6ZXMgc2VsZWN0IGVsZW1lbnRzIHRvIGZpdCB0aGUgdGV4dCBleGFjdGx5XHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxyXG4gKi9cclxuXHJcbmludGVyZmFjZSBzZWxlY3RSZXNpemVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICByZXNpemVEZWZhdWx0IDogbnVtYmVyO1xyXG4gICAgb25SZXNpemU6IEZ1bmN0aW9uO1xyXG4gICAgcGFyZW50OiBzdHJpbmc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJywgW10pLmRpcmVjdGl2ZSgnc2VsZWN0UmVzaXplUGFyZW50JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXIoJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRFbGVtZW50ID0gZ2V0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnQoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zZWxlY3RSZXNpemUnKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZScsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIG9uUmVzaXplOiAnJnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IHNlbGVjdFJlc2l6ZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNpemVJbnB1dCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2l6ZUlucHV0KCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVsIDogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+ZWxlbWVudFswXTtcclxuICAgICAgICAgICAgICAgIGxldCBhcnJvd1dpZHRoID0gMjQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICg8SFRNTE9wdGlvbkVsZW1lbnQ+ZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSkudGV4dDtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXN0RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuPicpLmh0bWwodGV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmQodGVzdEVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHNjb3BlLnJlc2l6ZURlZmF1bHQgfHwgMTUwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSBgJHt3aWR0aCArIGFycm93V2lkdGh9cHhgO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5vblJlc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm9uUmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogVGFiIGNvbXBvbmVudFxyXG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyBzd2l0Y2hpbmcgYmV0d2VlblxyXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8wOC8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgaW50ZXJmYWNlIFRhYnMge1xyXG4gICAgICAgIGxhc3RUYWI6IG51bWJlcjtcclxuICAgICAgICBhY3RpdmVUYWI6IG51bWJlcjtcclxuICAgICAgICB0YWJzOiBBcnJheTxPYmplY3Q+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGFiVGl0bGVTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgJHRhYnM6IFRhYnNDb250cm9sbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYWJzQ29udHJvbGxlciBpbXBsZW1lbnRzIFRhYnN7XHJcbiAgICAgICAgYWN0aXZlVGFiID0gMTtcclxuICAgICAgICB0YWJzID0gW107XHJcbiAgICAgICAgbGFzdFRhYiA9IC0xO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogbmcuSVNjb3BlLCBwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gKDxhbnk+dGhpcykuY3VycmVudFRhYiwgKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuYWN0aXZlVGFiID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcykuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNpemVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGg6IE51bWJlciA9IDE2O1xyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gdGhpcy50YWJzW2ldLmhlYWRlclswXS5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhYkhlYWRlciA9IDxIVE1MRWxlbWVudD50aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xyXG4gICAgICAgICAgICB0YWJIZWFkZXIuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhZGRUYWIoaGVhZGVyIDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYm9keSA6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgbGV0IGlkeCA6IG51bWJlciA9IHRoaXMudGFicy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxyXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpKS5hcHBlbmQoaGVhZGVyKTtcclxuXHJcbiAgICAgICAgICAgIGhlYWRlci5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG4gICAgICAgICAgICBib2R5LmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemVUYWJzKCk7XHJcblxyXG4gICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNoYW5nZVRhYihldmVudDogSlF1ZXJ5RXZlbnRPYmplY3QsIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgaWYoaW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCd0ZC10YWItaW5kZXgnKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGluZGV4ICYmIGluZGV4ICE9PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0VGFiID0gdGhpcy5hY3RpdmVUYWI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZVRhYnMoKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQgOiBOdW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubGFzdFRhYiA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYnNbdGhpcy5hY3RpdmVUYWIgLSAxXS5ib2R5WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19jb250ZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50LnN0eWxlLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDUwMG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSknO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gaSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihpZHggPT09IHRoaXMuYWN0aXZlVGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZHggPCB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSAnJztcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsZWFyVGFiKGlkeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuYmx1cigpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1tpZHhdLmJvZHkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicsIFtdKS5kaXJlY3RpdmUoJ3RkVGFicycsICgkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgY3VycmVudFRhYjogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtdGFiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyLXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9faGVhZGVyIGpzLXRhYl9faGVhZGVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2NvbnRlbnQtd3JhcHBlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50IGpzLXRhYl9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuVGFic0NvbnRyb2xsZXJdLFxyXG4gICAgICAgIGxpbms6IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgUmVzaXplIHRoZSBiYWNrZ3JvdW5kIG9uY2Ugc2hpZnQgZnJvbSBmb250cyBsb2FkZWQgaGFzIG9jY3VyZWRcclxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgKDxhbnk+ZG9jdW1lbnQpLmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCByZWFkeUNoZWNrSW50ZXJ2YWwgPSAkaW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiJywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgbGluayhzY29wZTpuZy5JU2NvcGUsIGVsZW1lbnQ6bmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6bmcuSUF0dHJpYnV0ZXMsIGN0cmw6YW55KSB7XHJcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX190aXRsZScpKTtcclxuICAgICAgICAgICAgbGV0IGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19ib2R5JykpO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJUaXRsZScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxidXR0b24gY2xhc3M9XCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXRyYW5zY2x1ZGU+PC9idXR0b24+YCxcclxuICAgICAgICBsaW5rKHNjb3BlOiBUaHJlYWQuQ29tcG9uZW50cy5UYWJUaXRsZVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkge1xyXG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiYy10YWJfX2JvZHkganMtdGFiX19ib2R5XCIgbmctdHJhbnNjbHVkZT48L2Rpdj4nXHJcbiAgICB9O1xyXG59KTsiLCIvKipcclxuICogV2F2ZSBlZmZlY3RcclxuICogQSBkaXJlY3RpdmUgdGhhdCBzaG93cyBhIGdyb3dpbmcgY2lyY2xlIGluIHRoZSBiYWNrZ3JvdW5kXHJcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzExLzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0EnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaW5rID0gKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnbm9XYXZlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHdhdmVFbDtcclxuICAgICAgICAgICAgbGV0IHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xyXG4gICAgICAgICAgICBsZXQgaXNGYWIgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB3aWR0aDtcclxuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsID0gYW5ndWxhci5lbGVtZW50KCc8c3BhbiBjbGFzcz1cIndhdmUtZWZmZWN0XCI+PC9zcGFuPicpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0tZmFiLW1pbmknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGFzQ2xhc3MoJ2MtYnV0dG9uLS1pY29uJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ3dhdmUtZWZmZWN0LS1mYWInKTtcclxuICAgICAgICAgICAgICAgICAgICBpc0ZhYiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguY2VpbChyYXdFbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vbignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0geyBsZWZ0OiBlLmNsaWVudFgsIHRvcDogZS5jbGllbnRZIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gYCR7cG9zLmxlZnQgLSBwYXJlbnRQb3MubGVmdH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSBgJHtwb3MudG9wIC0gcGFyZW50UG9zLnRvcH1weGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLmxlZnQgPSAnJztcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS50b3AgPSAnJztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdhdmVFbC5yZW1vdmVDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmF3RWxlbWVudC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih3YXZlRWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5vZmYoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0KCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyB3YXZlRWZmZWN0QnV0dG9uIGV4dGVuZHMgd2F2ZUVmZmVjdCB7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnQyc7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JykuZGlyZWN0aXZlKCdjQnV0dG9uJywgWyckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24uZmFjdG9yeSgpXSk7XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSB0aHJlYWQge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3RocmVhZCcsIFtcclxuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcclxuICAgICAgICAndGhyZWFkLndhdmVFZmZlY3QnLFxyXG4gICAgICAgICd0aHJlYWQubWVudScsXHJcbiAgICAgICAgJ3RocmVhZC50YWInLFxyXG4gICAgICAgICd0aHJlYWQuZmxvYXRpbmdMYWJlbCcsXHJcbiAgICAgICAgJ3RocmVhZC5pbnB1dFJlcXVpcmUnLFxyXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcclxuICAgICAgICAndGhyZWFkLnNlbGVjdFJlc2l6ZScsXHJcbiAgICAgICAgJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxyXG4gICAgICAgICd0aHJlYWQuc2VsZWN0J1xyXG4gICAgXSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

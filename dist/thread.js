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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRocmVhZC5qcyIsImNvbXBvbmVudHMvZGlhbG9nL2RpYWxvZy5tb2R1bGUudHMiLCJjb21wb25lbnRzL2RpYWxvZy9kaWFsb2cuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9kaWFsb2cvZGlhbG9nLnNlcnZpY2UudHMiLCJjb21wb25lbnRzL2Zsb2F0aW5nTGFiZWwvZmxvYXRpbmdMYWJlbC5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL2R5bmFtaWNCYWNrZ3JvdW5kL2R5bmFtaWNCYWNrZ3JvdW5kLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvbWVudS9tZW51LmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvaW5wdXRSZXF1aXJlL2lucHV0UmVxdWlyZS5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3Njcm9sbENvbGxhcHNlL3Njcm9sbENvbGxhcHNlLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvcHJvZGlzL3Byb2Rpcy5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3NlbGVjdC9zZWxlY3QuZGlyZWN0aXZlLnRzIiwiY29tcG9uZW50cy9zZWxlY3RSZXNpemUvc2VsZWN0UmVzaXplLmRpcmVjdGl2ZS50cyIsImNvbXBvbmVudHMvdGFiL3RhYi5kaXJlY3RpdmUudHMiLCJjb21wb25lbnRzL3dhdmVFZmZlY3Qvd2F2ZUVmZmVjdC5kaXJlY3RpdmUudHMiLCJhcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGNBQWMsVUFBVSxHQUFHLEdBQUc7SUFDeEQsS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsZUFBZSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ25ELFNBQVMsS0FBSyxFQUFFLEtBQUssY0FBYztJQUNuQyxFQUFFLFlBQVksTUFBTSxPQUFPLE9BQU8sT0FBTyxNQUFNLEdBQUcsWUFBWSxFQUFFLFdBQVcsSUFBSTs7QUNIbkYsUUFBUSxPQUFPLGlCQUFpQjtBQ0NoQyxJQUFP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QTtRQUNBO1FBQ0E7O0dBZEQsV0FBQSxTQUFNO0FkcWtDYiIsImZpbGUiOiJ0aHJlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xufTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pO1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBEaWFsb2dDb250cm9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIERpYWxvZ0NvbnRyb2xsZXIoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS4kb25Jbml0ID0gZnVuY3Rpb24gKCkgeyB9O1xuICAgICAgICAgICAgRGlhbG9nQ29udHJvbGxlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCcuaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBEaWFsb2dDb250cm9sbGVyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKGRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnLmlzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrID0gZGVmZXJyZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIERpYWxvZ0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIERpYWxvZ0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlciA9IERpYWxvZ0NvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLmRpcmVjdGl2ZSgndGREaWFsb2cnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5EaWFsb2dDb250cm9sbGVyXSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJGRpYWxvZydcbiAgICB9O1xufSk7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgU2VydmljZXM7XG4gICAgKGZ1bmN0aW9uIChTZXJ2aWNlcykge1xuICAgICAgICB2YXIgRGlhbG9nU2VydmljZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBEaWFsb2dTZXJ2aWNlKCRxLCAkcm9vdFNjb3BlLCAkY29tcGlsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHEgPSAkcTtcbiAgICAgICAgICAgICAgICB0aGlzLiRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIERpYWxvZ1NlcnZpY2UucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nRWxlbWVudDtcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nU2NvcGU7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQgPSB0aGlzLiRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgZGlhbG9nRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChcIlxcbiAgICAgICAgICAgICAgICA8dGQtZGlhbG9nXFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XFxcIlwiICsgb3B0aW9ucy50YXJnZXQgKyBcIlxcXCJcXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlPVxcXCJcIiArIG9wdGlvbnMudGVtcGxhdGUgKyBcIlxcXCJcXG4gICAgICAgICAgICAgICAgPjwvdGQtZGlhbG9nPlxcbiAgICAgICAgICAgIFwiKTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpYWxvZ0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGNvbXBpbGUoZGlhbG9nRWxlbWVudCkob3B0aW9ucy5zY29wZSB8fCB0aGlzLiRyb290U2NvcGUpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ1Njb3BlID0gZGlhbG9nRWxlbWVudC5pc29sYXRlU2NvcGUoKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dTY29wZS5vcGVuKGRlZmVycmVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gRGlhbG9nU2VydmljZTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgU2VydmljZXMuRGlhbG9nU2VydmljZSA9IERpYWxvZ1NlcnZpY2U7XG4gICAgfSkoU2VydmljZXMgPSBUaHJlYWQuU2VydmljZXMgfHwgKFRocmVhZC5TZXJ2aWNlcyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLnNlcnZpY2UoJyRkaWFsb2cnLCBUaHJlYWQuU2VydmljZXMuRGlhbG9nU2VydmljZSk7XG4vKipcbiAqIEZsb2F0aW5nIGxhYmVsXG4gKiBBIGNvbXBvbmVudCB0aGF0IGNvbnRyb2xzIGxhYmVsIGludGVyYWN0aW9ucyBvbiBpbnB1dCBmaWVsZHNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcbiAqL1xuZnVuY3Rpb24gZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICBpZiAoYXR0cnMubm9GbG9hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5jLWlucHV0X19maWVsZCcpKTtcbiAgICAgICAgICAgIHZhciBuZ01vZGVsQ3RybCA9IGlucHV0RmllbGQuY29udHJvbGxlcignbmdNb2RlbCcpO1xuICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcbiAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISF2YWx1ZSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2JsdXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZmxvYXRpbmdMYWJlbCcpLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZmxvYXRpbmdMYWJlbExpbmsoJHRpbWVvdXQpXG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5keW5hbWljQmFja2dyb3VuZCcsIFtdKS5kaXJlY3RpdmUoJ2R5bmFtaWNCYWNrZ3JvdW5kJywgZnVuY3Rpb24gKCR3aW5kb3csICRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xuICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGJhY2tncm91bmRFbCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICgnZm9udHMnIGluIGRvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZWFkeUNoZWNrSW50ZXJ2YWxfMSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbFswXS5zdHlsZS5oZWlnaHQgPSBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgcGFyc2VJbnQoYXR0cnMuZHluYW1pY0JhY2tncm91bmQpKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGNhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpICsgXCJweFwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVIZWlnaHQoZWxlbWVudCwgb3B0aW9uYWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN1dG9mZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGR5bmFtaWMgYmFja2dyb3VuZCBlbmQhIFBsZWFzZSBhZGQgdGhlIGF0dHJpYnV0ZSBcImR5bmFtaWMtYmFja2dyb3VuZC1lbmRcIiB0byBhIGNoaWxkIGVsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbmFsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXRvZmZSZWN0LnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgb3B0aW9uYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHBhZ2VCYWNrZ3JvdW5kJ1xuICAgIH07XG59KTtcbi8qKlxuICogTWVudVxuICogQSBjb21wb25lbnQgdGhhdCBzaG93cy9oaWRlcyBhIGxpc3Qgb2YgaXRlbXMgYmFzZWQgb24gdGFyZ2V0IGNsaWNrXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXG4gKiBAY3JlYXRlZCAwNy8wNi8yMDE2XG4gKi9cbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgTWVudSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBNZW51KCR0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0cmljdCA9ICdFJztcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRUb0NvbnRyb2xsZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlckFzID0gJyRtZW51JztcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gXCI8ZGl2IGNsYXNzPVxcXCJjLW1lbnUganMtbWVudVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1tZW51X19iYWNrZHJvcCBqcy1tZW51X19iYWNrZHJvcFxcXCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLm1lbnVDb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2NvbnRlbnQnKSk7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuYmFja2Ryb3AgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtbWVudV9fYmFja2Ryb3AnKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgnd2lkdGgnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5tZW51Q29udGVudC5hZGRDbGFzcyhcImMtbWVudV9fY29udGVudC0td2lkdGgtXCIgKyBhdHRycy53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCdtb3ZlVG9Cb2R5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubW92ZVRvQm9keSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgncG9zaXRpb24nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNwbGl0UG9zID0gYXR0cnMucG9zaXRpb24uc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oJ3RvcCcsICdsZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3RybC5iYWNrZHJvcC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoY3RybC5tZW51Q29udGVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbWVudV9faXRlbScpKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBjdHJsLmNsb3NlKCk7IH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkJvZHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhQb3M6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeVBvczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBvcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBjbG9zZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbjogc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZVRvQm9keTogbW92ZVRvQm9keVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5iYWNrZHJvcC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tZW51Q29udGVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5iYWNrZHJvcCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWVudUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AuYWRkQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldFBvcyA9IG1lbnVUYXJnZXRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZWZ0ID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9wXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy54UG9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5yaWdodCAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy55UG9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcF8xID0gdGFyZ2V0UG9zLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wXzEgPSB0YXJnZXRQb3MuYm90dG9tIC0gdGhpcy5tZW51Q29udGVudFswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5sZWZ0ID0gKGxlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50WzBdLnN0eWxlLnRvcCA9ICh0b3BfMSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5yaWdodCA9ICdpbml0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHlQb3NpdGlvbiwgeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh5UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tdG9wJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tYm90dG9tJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdjLW1lbnVfX2NvbnRlbnQtLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54UG9zID0geFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueVBvcyA9IHlQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVUb0JvZHkoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2pzLW1lbnVfX2NvbnRlbnQtLW9uLWJvZHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpKS5hcHBlbmQodGhpcy5tZW51Q29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1lbnUuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR0aW1lb3V0KSB7IHJldHVybiBuZXcgTWVudSgkdGltZW91dCk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBNZW51LiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gTWVudTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5NZW51ID0gTWVudTtcbiAgICAgICAgdmFyIE1lbnVUYXJnZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudVRhcmdldCgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVpcmUgPSAnXnRkTWVudSc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBcIjxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVxcXCJjLW1lbnVfX3RhcmdldCBjLWJ1dHRvbiBqcy1tZW51X190YXJnZXRcXFwiXFxuICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlXFxuICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cXFwiJG1lbnUub3BlbigpXFxcIj48L2J1dHRvbj5cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRtZW51ID0gY3RybDtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWVudVRhcmdldC5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudVRhcmdldCgpOyB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBNZW51VGFyZ2V0O1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLk1lbnVUYXJnZXQgPSBNZW51VGFyZ2V0O1xuICAgICAgICB2YXIgTWVudUNvbnRlbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTWVudUNvbnRlbnQoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlID0gJ150ZE1lbnUnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlbXBsYXRlID0gJzx1bCBjbGFzcz1cImMtbWVudV9fY29udGVudCBqcy1tZW51X19jb250ZW50XCIgbmctdHJhbnNjbHVkZT48L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51Q29udGVudC5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudUNvbnRlbnQoKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudUNvbnRlbnQ7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudUNvbnRlbnQgPSBNZW51Q29udGVudDtcbiAgICAgICAgdmFyIE1lbnVJdGVtID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE1lbnVJdGVtKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVxdWlyZSA9ICdedGRNZW51Q29udGVudCc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2NsdWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSAnPGEgY2xhc3M9XCJjLWJ1dHRvbiBjLWJ1dHRvbi0tbWVudSBjLW1lbnVfX2l0ZW0ganMtbWVudV9faXRlbVwiIG5nLXRyYW5zY2x1ZGU+PC9hPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51SXRlbS5mYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWVudUl0ZW0oKTsgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gTWVudUl0ZW07XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuTWVudUl0ZW0gPSBNZW51SXRlbTtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbnZhciBtZW51ID0gYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5tZW51JywgW10pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudScsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51LmZhY3RvcnkoKV0pO1xubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVDb250ZW50JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUNvbnRlbnQuZmFjdG9yeSgpKTtcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnVJdGVtJywgVGhyZWFkLkNvbXBvbmVudHMuTWVudUl0ZW0uZmFjdG9yeSgpKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuaW5wdXRSZXF1aXJlJywgW10pLmRpcmVjdGl2ZSgnY0lucHV0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdDJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbnB1dEZpZWxkID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXRGaWVsZC5hdHRyKCdyZXF1aXJlZCcpIHx8IGF0dHJzLmhpZGVSZXF1aXJlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoYXMtcmVxdWlyZWQnKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXJlcXVpcmVkLWludmFsaWQnLCAhdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbnZhciBUaHJlYWQ7XG4oZnVuY3Rpb24gKFRocmVhZCkge1xuICAgIHZhciBDb21wb25lbnRzO1xuICAgIChmdW5jdGlvbiAoQ29tcG9uZW50cykge1xuICAgICAgICB2YXIgU2Nyb2xsQ29sbGFwc2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2luZG93ID0gJHdpbmRvdztcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RyaWN0ID0gJ0EnO1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RTY3JvbGwgPSAwO1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoX3RoaXMuJHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9TY3JvbGxpbmcgZG93blxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjcm9sbCA+IGxhc3RTY3JvbGwgKyAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzY3JvbGwgPCBsYXN0U2Nyb2xsIC0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR3aW5kb3cpIHsgcmV0dXJuIG5ldyBTY3JvbGxDb2xsYXBzZSgkd2luZG93KTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNjcm9sbENvbGxhcHNlLiRpbmplY3QgPSBbJyR3aW5kb3cnXTtcbiAgICAgICAgICAgIHJldHVybiBTY3JvbGxDb2xsYXBzZTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZSA9IFNjcm9sbENvbGxhcHNlO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsIFtdKS5kaXJlY3RpdmUoJ3Njcm9sbENvbGxhcHNlJywgWyckd2luZG93JywgVGhyZWFkLkNvbXBvbmVudHMuU2Nyb2xsQ29sbGFwc2UuZmFjdG9yeSgpXSk7XG4vKipcbiAqIFByb2dyZXNzaXZlIERpc2Nsb3N1cmVcbiAqIEEgbmF0dXJhbCBsYW5ndWFnZSBjb21wb25lbnQgdGhhdCBzaG93cyBvbmVcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDYvMTUvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIFByb2Rpc0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gUHJvZGlzQ29udHJvbGxlcigkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCsrdGhpcy5jdXJyZW50U2VjdGlvbiA+PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWN0aW9uID0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdvVG8gPSBmdW5jdGlvbiAoc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5jdXJyZW50U2VjdGlvbjsgaSA8IHRoaXMuc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnNbaV0ubmFtZSA9PT0gc2VjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLmdldEN1cnJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb247XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUHJvZGlzQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2VjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHByb2Rpc0VsO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNlY3Rpb247IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKz0gdGhpcy5nZXRTZWN0aW9uSGVpZ2h0KHRoaXMuc2VjdGlvbnNbaV0uZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2Rpc0VsID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzJyk7XG4gICAgICAgICAgICAgICAgcHJvZGlzRWwuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFByb2Rpc0NvbnRyb2xsZXIucHJvdG90eXBlLnJlZ2lzdGVyU2VjdGlvbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBQcm9kaXNDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWN0aW9uSGVpZ2h0ID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VjdGlvbi5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gUHJvZGlzQ29udHJvbGxlcjtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyID0gUHJvZGlzQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJywgW10pLmRpcmVjdGl2ZSgncHJvZGlzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1wcm9kaXMganMtcHJvZGlzXFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy5Qcm9kaXNDb250cm9sbGVyXVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtbmF0dXJhbC1sYW5ndWFnZV9fc2VjdGlvbiBjLXByb2Rpc19fc2VjdGlvbiBqcy1wcm9kaXNfX3NlY3Rpb25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcIntcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2MtcHJvZGlzX19zZWN0aW9uLS1jb21wbGV0ZSc6ICRwcm9kaXNTZWN0aW9uLmlzQ29tcGxldGUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cXG4gICAgICAgICAgICAgICAgICAgICAgICB9XFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlwiLFxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwcm9kaXNTZWN0aW9uJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgLy9yZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcbiAgICAgICAgICAgIHRoaXMuaWQgPSAkcGFyZW50LnJlZ2lzdGVyU2VjdGlvbigkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzX19zZWN0aW9uJyksICRhdHRycy5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9ICEhJGF0dHJzLmlzQ29tcGxldGU7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG52YXIgU2VsZWN0Q29udHJvbGxlciA9IFRocmVhZC5Db21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXI7XG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIE9wdGlvbk1vZGVsID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gT3B0aW9uTW9kZWw7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuT3B0aW9uTW9kZWwgPSBPcHRpb25Nb2RlbDtcbiAgICAgICAgdmFyIFNlbGVjdENvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gU2VsZWN0Q29udHJvbGxlcigkZWxlbWVudCwgJHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuYWRkT3B0aW9uID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2gobmV3IE9wdGlvbk1vZGVsKG5hbWUsIHZhbHVlKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUub3Blbk9wdGlvbkxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudFBvcyA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgcGFyZW50UG9zLmxlZnQgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIHBhcmVudFBvcy50b3AgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgdmFyIGJhY2tkcm9wID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25MaXN0ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS53aWR0aCA9IHRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgb3B0aW9uTGlzdC5zdHlsZS5sZWZ0ID0gKHBhcmVudFBvcy5sZWZ0IC0gMTYpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUudG9wID0gKHBhcmVudFBvcy50b3AgLSAxNCkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLmFkZENsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGJhY2tkcm9wKS5hZGRDbGFzcygnaXMtb3BlbicpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSB0aGlzLnNlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5pcy1zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0RWxlbWVudFBvc2l0aW9uSW5WaWV3ID0gZnVuY3Rpb24gKHBhcmVudCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudFRvcCA9IHBhcmVudFJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudEJvdHRvbSA9IHBhcmVudFJlY3QuYm90dG9tICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRUb3AgPSBlbGVtZW50UmVjdC50b3AgKyBwYXJlbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50Qm90dG9tID0gZWxlbWVudFJlY3QuYm90dG9tICsgcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudFJlY3QudG9wIDwgcGFyZW50VG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50VG9wIC0gcGFyZW50VG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbGVtZW50UmVjdC5ib3R0b20gPiBwYXJlbnRCb3R0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRCb3R0b20gLSBwYXJlbnRCb3R0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuY2xvc2VPcHRpb25MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25MaXN0ID0gX3RoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSBfdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBfdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuaXMtc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG9wdGlvbkxpc3QpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChiYWNrZHJvcCkucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IF90aGlzLmdldEVsZW1lbnRQb3NpdGlvbkluVmlldyhvcHRpb25MaXN0LCBzZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc2Nyb2xsVG9wID0gbmV3UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gb3B0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLmhpZ2hsaWdodE5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaWR4ID49IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIHx8IGlkeCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWR4ICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudW5IaWdobGlnaHRBbGwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdGhpcy5vcHRpb25zW2lkeF07XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuaGlnaGxpZ2h0UHJldiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpZHggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZHggPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlkeCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdGhpcy5vcHRpb25zW2lkeF07XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU2VsZWN0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0SGlnaGxpZ2h0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFNlbGVjdENvbnRyb2xsZXIucHJvdG90eXBlLnVuSGlnaGxpZ2h0QWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLm9wdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB9KCkpO1xuICAgICAgICBDb21wb25lbnRzLlNlbGVjdENvbnRyb2xsZXIgPSBTZWxlY3RDb250cm9sbGVyO1xuICAgICAgICB2YXIgT3B0aW9uQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBPcHRpb25Db250cm9sbGVyKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuT3B0aW9uQ29udHJvbGxlciA9IE9wdGlvbkNvbnRyb2xsZXI7XG4gICAgfSkoQ29tcG9uZW50cyA9IFRocmVhZC5Db21wb25lbnRzIHx8IChUaHJlYWQuQ29tcG9uZW50cyA9IHt9KSk7XG59KShUaHJlYWQgfHwgKFRocmVhZCA9IHt9KSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgZnVuY3Rpb24gKCR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG1vZGVsOiAnPW5nTW9kZWwnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9XFxcImMtc2VsZWN0IGMtaW5wdXRfX2ZpZWxkIGpzLXNlbGVjdFxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5vcGVuT3B0aW9uTGlzdCgpO1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiYy1zZWxlY3RfX2JhY2tkcm9wIGpzLXNlbGVjdF9fYmFja2Ryb3BcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiYy1zZWxlY3RfX3ZhbHVlXFxcIj57eyRzZWxlY3RDdHJsLm1vZGVsIHx8ICcgJ319PC9zcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImMtc2VsZWN0X19tZW51IGpzLXNlbGVjdF9fbWVudVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cXFwiYy1zZWxlY3RfX21lbnUtaXRlbSBqcy1zZWxlY3RfX21lbnUtaXRlbVxcXCIgbmctcmVwZWF0PVxcXCJvcHRpb24gaW4gJHNlbGVjdEN0cmwub3B0aW9uc1xcXCIgbmctY2xhc3M9XFxcInsnaGFzLWZvY3VzJzogb3B0aW9uLmlzSGlnaGxpZ2h0ZWQsICdpcy1zZWxlY3RlZCc6IG9wdGlvbi5pc1NlbGVjdGVkfVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXFxcIj57e29wdGlvbi5uYW1lfX1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJtaSBjLXNlbGVjdF9fYXJyb3dcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj5hcnJvd19kcm9wX2Rvd248L2k+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cXFwiYy1zZWxlY3RfX2JveFxcXCIgbmctdHJhbnNjbHVkZSBuZy1tb2RlbD1cXFwiJHNlbGVjdEN0cmwubW9kZWxcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PC9zZWxlY3Q+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcixcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdEN0cmwnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19iYWNrZHJvcCcpKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNlbGVjdF9fbWVudS1pdGVtJykpO1xuICAgICAgICAgICAgICAgIG9wdGlvbi5vbignbW91c2VlbnRlciBtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnVuSGlnaGxpZ2h0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5vbignYmx1cicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzg6IC8vYXJyb3cgdXBcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3RybC5pc09wZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5oaWdobGlnaHRQcmV2KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OiAvL2Fycm93IHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cmwuaXNPcGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaGlnaGxpZ2h0TmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuaXNPcGVuID8gY3RybC5jbG9zZU9wdGlvbkxpc3QoKSA6IGN0cmwub3Blbk9wdGlvbkxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5pc09wZW4gJiYgY3RybC5oaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2VsZWN0KGN0cmwuaGlnaGxpZ2h0ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcpLmRpcmVjdGl2ZSgndGRPcHRpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRTZWxlY3QnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxvcHRpb24gbmctdHJhbnNjbHVkZSBuZy12YWx1ZT1cIiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlXCI+PC9vcHRpb24+JyxcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuT3B0aW9uQ29udHJvbGxlcixcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdE9wdGlvbkN0cmwnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBhdHRycy52YWx1ZSB8fCBlbGVtZW50LnRleHQoKS5yZXBsYWNlKC9cXHMvLCAnJyk7XG4gICAgICAgICAgICBzY29wZS4kc2VsZWN0T3B0aW9uQ3RybC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgY3RybC5hZGRPcHRpb24oZWxlbWVudC50ZXh0KCksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbi8qKlxuICogU2VsZWN0IFJlc2l6ZVxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTkvMjAxNlxuICovXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnP15zZWxlY3RSZXNpemVQYXJlbnQnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgb25SZXNpemU6ICcmc2VsZWN0UmVzaXplJyxcbiAgICAgICAgICAgIHJlc2l6ZURlZmF1bHQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVzaXplSW5wdXQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICB2YXIgYXJyb3dXaWR0aCA9IDI0O1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XS50ZXh0O1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aDtcbiAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBjdHJsID8gY3RybC5nZXRFbGVtZW50KCkgOiBlbGVtZW50LnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRfMS5hcHBlbmQodGVzdEVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB0ZXN0RWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEVsID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gc2NvcGUucmVzaXplRGVmYXVsdCB8fCAxNTA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uc3R5bGUud2lkdGggPSAod2lkdGggKyBhcnJvd1dpZHRoKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUub25SZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4vKipcbiAqIFRhYiBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHN3aXRjaGluZyBiZXR3ZWVuXG4gKiBzZXRzIG9mIGNvbnRlbnQgc2VwYXJhdGVkIGludG8gZ3JvdXBzIGJ5IHRhYnNcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcbiAqIEBjcmVhdGVkIDA3LzA4LzIwMTZcbiAqL1xudmFyIFRocmVhZDtcbihmdW5jdGlvbiAoVGhyZWFkKSB7XG4gICAgdmFyIENvbXBvbmVudHM7XG4gICAgKGZ1bmN0aW9uIChDb21wb25lbnRzKSB7XG4gICAgICAgIHZhciBUYWJzQ29udHJvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBUYWJzQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSAxO1xuICAgICAgICAgICAgICAgIHRoaXMudGFicyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS4kd2F0Y2goZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuY3VycmVudFRhYjsgfSwgZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgJiYgbmV3VmFsdWUgPT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hY3RpdmVUYWIgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2hhbmdlVGFiKG51bGwsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5yZXNpemVUYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IDE2O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0YWJIZWFkZXIgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2hlYWRlcicpO1xuICAgICAgICAgICAgICAgIHRhYkhlYWRlci5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUYWIgPSBmdW5jdGlvbiAoaGVhZGVyLCBib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkeCA9IHRoaXMudGFicy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XG4gICAgICAgICAgICAgICAgaGVhZGVyLmF0dHIoJ3RkLXRhYi1pbmRleCcsIGlkeCk7XG4gICAgICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xuICAgICAgICAgICAgICAgIGJvZHlbMF0uc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJztcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICBib2R5WzBdLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBUYWJzQ29udHJvbGxlci5wcm90b3R5cGUuY2hhbmdlVGFiID0gZnVuY3Rpb24gKGV2ZW50LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggJiYgaW5kZXggIT09IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVRhYiA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVGFic0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVRhYnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlaWdodDtcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGFiID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLiRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUudHJhbnNpdGlvbiA9ICdoZWlnaHQgNTAwbXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZHggPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhclRhYihpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkeCA9PT0gdGhpcy5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlkeCA8IHRoaXMuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RUYWIgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFRhYnNDb250cm9sbGVyLnByb3RvdHlwZS5jbGVhclRhYiA9IGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5oZWFkZXIucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1yaWdodCBpcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uYm9keS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLXJpZ2h0IGlzLWxlZnQnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gVGFic0NvbnRyb2xsZXI7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIENvbXBvbmVudHMuVGFic0NvbnRyb2xsZXIgPSBUYWJzQ29udHJvbGxlcjtcbiAgICB9KShDb21wb25lbnRzID0gVGhyZWFkLkNvbXBvbmVudHMgfHwgKFRocmVhZC5Db21wb25lbnRzID0ge30pKTtcbn0pKFRocmVhZCB8fCAoVGhyZWFkID0ge30pKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJywgW10pLmRpcmVjdGl2ZSgndGRUYWJzJywgZnVuY3Rpb24gKCRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGU6IFwiPGRpdiBjbGFzcz1cXFwiYy10YWJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19oZWFkZXItd3JhcHBlclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19oZWFkZXIganMtdGFiX19oZWFkZXJcXFwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImMtdGFiX19jb250ZW50LXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cIixcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHRhYnMnLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsICckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLlRhYnNDb250cm9sbGVyXSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxuICAgICAgICAgICAgIFVzZSBpbnRlcnZhbCBhcyBhIGZpeCBmb3IgSUUgYW5kIFNhZmFyaVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoJ2ZvbnRzJyBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjdHJsLnJlc2l6ZVRhYnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZWFkeUNoZWNrSW50ZXJ2YWxfMiA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWxfMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWInLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnXnRkVGFicycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy10YWJfX2JvZHknKSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY3RybC5hZGRUYWIoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogXCI8YnV0dG9uIGNsYXNzPVxcXCJjLXRhYl9faGVhZGVyLWl0ZW0gYy1idXR0b24gYy1idXR0b24tLXRhYiBqcy10YWJfX3RpdGxlXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVxcXCIkdGFicy5jaGFuZ2VUYWIoJGV2ZW50KVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlPjwvYnV0dG9uPlwiLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICBzY29wZS4kdGFicyA9IGN0cmw7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnRhYicpLmRpcmVjdGl2ZSgndGRUYWJCb2R5JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHJlcXVpcmU6ICdedGRUYWInLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjLXRhYl9fYm9keSBqcy10YWJfX2JvZHlcIiBuZy10cmFuc2NsdWRlPjwvZGl2PidcbiAgICB9O1xufSk7XG4vKipcbiAqIFdhdmUgZWZmZWN0XG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGEgZ3Jvd2luZyBjaXJjbGUgaW4gdGhlIGJhY2tncm91bmRcbiAqIG9mIGNvbXBvbmVudHMgaXQncyBhdHRhY2hlZCB0b1xuICogQGF1dGhvciBaYWNoIEJhcm5lc1xuICogQGNyZWF0ZWQgMDcvMTEvMjAxNlxuICovXG52YXIgVGhyZWFkO1xuKGZ1bmN0aW9uIChUaHJlYWQpIHtcbiAgICB2YXIgQ29tcG9uZW50cztcbiAgICAoZnVuY3Rpb24gKENvbXBvbmVudHMpIHtcbiAgICAgICAgdmFyIHdhdmVFZmZlY3QgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gd2F2ZUVmZmVjdCgkdGltZW91dCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQSc7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHdhdmVFbDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhd0VsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNGYWIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlQWN0aXZlVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLiR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxzcGFuIGNsYXNzPVwid2F2ZS1lZmZlY3RcIj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCd3YXZlLWVmZmVjdC0tZmFiJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaXJjbGUsIGhlaWdodCBtdXN0IG1hdGNoIHRoZSB3aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSByYXdFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLndpZHRoID0gd2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQod2F2ZUVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpLm9uKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50UG9zID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gKHBvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnQpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gKHBvcy50b3AgLSBwYXJlbnRQb3MudG9wKSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBfdGhpcy4kdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsWzBdLnN0eWxlLnRvcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbW92ZUFjdGl2ZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2F2ZUVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub2ZmKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhdmVFZmZlY3QuZmFjdG9yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZnVuY3Rpb24gKCR0aW1lb3V0KSB7IHJldHVybiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3YXZlRWZmZWN0LiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgICAgICAgICByZXR1cm4gd2F2ZUVmZmVjdDtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgQ29tcG9uZW50cy53YXZlRWZmZWN0ID0gd2F2ZUVmZmVjdDtcbiAgICAgICAgdmFyIHdhdmVFZmZlY3RCdXR0b24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKHdhdmVFZmZlY3RCdXR0b24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiB3YXZlRWZmZWN0QnV0dG9uKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdHJpY3QgPSAnQyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IGZ1bmN0aW9uICgkdGltZW91dCkgeyByZXR1cm4gbmV3IFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24oJHRpbWVvdXQpOyB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F2ZUVmZmVjdEJ1dHRvbi4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuICAgICAgICAgICAgcmV0dXJuIHdhdmVFZmZlY3RCdXR0b247XG4gICAgICAgIH0od2F2ZUVmZmVjdCkpO1xuICAgICAgICBDb21wb25lbnRzLndhdmVFZmZlY3RCdXR0b24gPSB3YXZlRWZmZWN0QnV0dG9uO1xuICAgIH0pKENvbXBvbmVudHMgPSBUaHJlYWQuQ29tcG9uZW50cyB8fCAoVGhyZWFkLkNvbXBvbmVudHMgPSB7fSkpO1xufSkoVGhyZWFkIHx8IChUaHJlYWQgPSB7fSkpO1xuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC53YXZlRWZmZWN0JywgW10pLmRpcmVjdGl2ZSgnd2F2ZUVmZmVjdCcsIFRocmVhZC5Db21wb25lbnRzLndhdmVFZmZlY3QuZmFjdG9yeSgpKTtcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcpLmRpcmVjdGl2ZSgnY0J1dHRvbicsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKV0pO1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGluZ3MvYW5ndWxhcmpzL2FuZ3VsYXIuZC50c1wiIC8+XG52YXIgdGhyZWFkO1xuKGZ1bmN0aW9uICh0aHJlYWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBhbmd1bGFyLm1vZHVsZSgndGhyZWFkJywgW1xuICAgICAgICAndGhyZWFkLnNjcm9sbENvbGxhcHNlJyxcbiAgICAgICAgJ3RocmVhZC53YXZlRWZmZWN0JyxcbiAgICAgICAgJ3RocmVhZC5tZW51JyxcbiAgICAgICAgJ3RocmVhZC50YWInLFxuICAgICAgICAndGhyZWFkLmZsb2F0aW5nTGFiZWwnLFxuICAgICAgICAndGhyZWFkLmlucHV0UmVxdWlyZScsXG4gICAgICAgICd0aHJlYWQucHJvZGlzJyxcbiAgICAgICAgJ3RocmVhZC5zZWxlY3RSZXNpemUnLFxuICAgICAgICAndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJyxcbiAgICAgICAgJ3RocmVhZC5kaWFsb2cnLFxuICAgICAgICAndGhyZWFkLnNlbGVjdCdcbiAgICBdKTtcbn0pKHRocmVhZCB8fCAodGhyZWFkID0ge30pKTtcbiIsImFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuZGlhbG9nJywgW10pOyIsIlxyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBEaWFsb2dTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgb3BlbjogRnVuY3Rpb247XHJcbiAgICAgICAgY2xvc2U6IEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dDb250cm9sbGVyIHtcclxuICAgICAgICBkZWZlckNhbGxiYWNrOiBuZy5JRGVmZXJyZWQ8YW55PjtcclxuICAgICAgICBjYW5jZWxsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGVsZW1lbnQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7fVxyXG5cclxuICAgICAgICAkb25Jbml0KCkge31cclxuXHJcbiAgICAgICAgY2xvc2UocmVzcG9uc2U/IDogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJy5pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJDYWxsYmFjay5yZWplY3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlckNhbGxiYWNrLnJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlbihkZWZlcnJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCcuaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICAgICAgICAgIGlmKGRlZmVycmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVyQ2FsbGJhY2sgPSBkZWZlcnJlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uRGVzdHJveSgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5kaWFsb2cnKS5kaXJlY3RpdmUoJ3RkRGlhbG9nJywgKCkgPT4ge1xyXG4gICByZXR1cm4ge1xyXG4gICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgVGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nQ29udHJvbGxlcl0sXHJcbiAgICAgICBjb250cm9sbGVyQXM6ICckZGlhbG9nJ1xyXG4gICB9O1xyXG59KTsiLCJtb2R1bGUgVGhyZWFkLlNlcnZpY2VzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBEaWFsb2dTZXJ2aWNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgICAgcHJpdmF0ZSAkcTogbmcuSVFTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IG5nLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcml2YXRlICRjb21waWxlOiBuZy5JQ29tcGlsZVNlcnZpY2VcclxuICAgICAgICApIHt9XHJcblxyXG4gICAgICAgIG9wZW4ob3B0aW9ucyk6IG5nLklQcm9taXNlPGFueT4ge1xyXG4gICAgICAgICAgICBsZXQgZGVmZXJyZWQ6IG5nLklEZWZlcnJlZDxhbnk+O1xyXG4gICAgICAgICAgICBsZXQgZGlhbG9nRWxlbWVudCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgICAgIGxldCBkaWFsb2dTY29wZSA6IFRocmVhZC5Db21wb25lbnRzLkRpYWxvZ1Njb3BlO1xyXG5cclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB0aGlzLiRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICBkaWFsb2dFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KGBcclxuICAgICAgICAgICAgICAgIDx0ZC1kaWFsb2dcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCIke29wdGlvbnMudGFyZ2V0fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU9XCIke29wdGlvbnMudGVtcGxhdGV9XCJcclxuICAgICAgICAgICAgICAgID48L3RkLWRpYWxvZz5cclxuICAgICAgICAgICAgYCk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpYWxvZ0VsZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLiRjb21waWxlKGRpYWxvZ0VsZW1lbnQpKG9wdGlvbnMuc2NvcGUgfHwgdGhpcy4kcm9vdFNjb3BlKTtcclxuICAgICAgICAgICAgZGlhbG9nU2NvcGUgPSA8VGhyZWFkLkNvbXBvbmVudHMuRGlhbG9nU2NvcGU+ZGlhbG9nRWxlbWVudC5pc29sYXRlU2NvcGUoKTtcclxuXHJcbiAgICAgICAgICAgIGRpYWxvZ1Njb3BlLm9wZW4oZGVmZXJyZWQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmRpYWxvZycpLnNlcnZpY2UoJyRkaWFsb2cnLCBUaHJlYWQuU2VydmljZXMuRGlhbG9nU2VydmljZSk7IiwiLyoqXHJcbiAqIEZsb2F0aW5nIGxhYmVsXHJcbiAqIEEgY29tcG9uZW50IHRoYXQgY29udHJvbHMgbGFiZWwgaW50ZXJhY3Rpb25zIG9uIGlucHV0IGZpZWxkc1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzEzLzIwMTZcclxuICovXHJcbmZ1bmN0aW9uIGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gX2Zsb2F0aW5nTGFiZWxMaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBuZy5JQXR0cmlidXRlcywgY3RybDogbmcuSU5nTW9kZWxDb250cm9sbGVyKSB7XHJcbiAgICAgICAgaWYgKCg8YW55PmF0dHJzKS5ub0Zsb2F0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICBsZXQgbmdNb2RlbEN0cmwgOiBuZy5JTmdNb2RlbENvbnRyb2xsZXIgPSBpbnB1dEZpZWxkLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhaW5wdXRGaWVsZC52YWwoKSB8fCAhIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWlucHV0RmllbGQuYXR0cigncGxhY2Vob2xkZXInKSkge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vbignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcygnaGFzLXZhbHVlJywgISFpbnB1dEZpZWxkLnZhbCgpIHx8ICEhaW5wdXRGaWVsZC5hdHRyKCdwbGFjZWhvbGRlcicpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdmb2N1cycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0RmllbGQub24oJ2JsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZihuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2hhcy12YWx1ZScsICEhdmFsdWUgfHwgISFpbnB1dEZpZWxkLmF0dHIoJ3BsYWNlaG9sZGVyJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZC5vZmYoJ2ZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9mZignYmx1cicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5mbG9hdGluZ0xhYmVsJywgW10pLmRpcmVjdGl2ZSgnZmxvYXRpbmdMYWJlbCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmZsb2F0aW5nTGFiZWwnKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbms6IGZsb2F0aW5nTGFiZWxMaW5rKCR0aW1lb3V0KVxyXG4gICAgfVxyXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgndGhyZWFkLmR5bmFtaWNCYWNrZ3JvdW5kJywgW10pLmRpcmVjdGl2ZSgnZHluYW1pY0JhY2tncm91bmQnLCAoJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmRFbCA6IG5nLklBdWdtZW50ZWRKUXVlcnkgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJqcy1wYWdlX19iYWNrZ3JvdW5kIGwtcGFnZV9fYmFja2dyb3VuZFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICBlbGVtZW50LnByZXBlbmQoYmFja2dyb3VuZEVsKTtcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBSZXNpemUgdGhlIGJhY2tncm91bmQgb25jZSBzaGlmdCBmcm9tIGZvbnRzIGxvYWRlZCBoYXMgb2NjdXJlZFxyXG4gICAgICAgICAgICAgICAgVXNlIGludGVydmFsIGFzIGEgZml4IGZvciBJRSBhbmQgU2FmYXJpXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZignZm9udHMnIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAoPGFueT5kb2N1bWVudCkuZm9udHMucmVhZHkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEVsWzBdLnN0eWxlLmhlaWdodCA9IGAke2NhbGN1bGF0ZUhlaWdodChlbGVtZW50LCBwYXJzZUludChhdHRycy5keW5hbWljQmFja2dyb3VuZCkpfXB4YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChyZWFkeUNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRWxbMF0uc3R5bGUuaGVpZ2h0ID0gYCR7Y2FsY3VsYXRlSGVpZ2h0KGVsZW1lbnQsIHBhcnNlSW50KGF0dHJzLmR5bmFtaWNCYWNrZ3JvdW5kKSl9cHhgO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUhlaWdodChlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBvcHRpb25hbEhlaWdodDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3V0b2ZmID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZHluYW1pYy1iYWNrZ3JvdW5kLWVuZF0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZighY3V0b2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkeW5hbWljIGJhY2tncm91bmQgZW5kISBQbGVhc2UgYWRkIHRoZSBhdHRyaWJ1dGUgXCJkeW5hbWljLWJhY2tncm91bmQtZW5kXCIgdG8gYSBjaGlsZCBlbGVtZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGN1dG9mZlJlY3QgPSBjdXRvZmYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYob3B0aW9uYWxIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIG9wdGlvbmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3V0b2ZmUmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIDY0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyRwYWdlQmFja2dyb3VuZCdcclxuICAgIH07XHJcbn0pOyIsIi8qKlxyXG4gKiBNZW51XHJcbiAqIEEgY29tcG9uZW50IHRoYXQgc2hvd3MvaGlkZXMgYSBsaXN0IG9mIGl0ZW1zIGJhc2VkIG9uIHRhcmdldCBjbGlja1xyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzA2LzIwMTZcclxuICovXHJcbm1vZHVsZSBUaHJlYWQuQ29tcG9uZW50cyB7XHJcbiAgICBleHBvcnQgY2xhc3MgTWVudSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHNjb3BlID0ge307XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlciA9IHRydWU7XHJcbiAgICAgICAgY29udHJvbGxlckFzID0gJyRtZW51JztcclxuICAgICAgICB0ZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYy1tZW51IGpzLW1lbnVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbWVudV9fYmFja2Ryb3AganMtbWVudV9fYmFja2Ryb3BcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcblxyXG4gICAgICAgIG1lbnVDb250ZW50IDogbmcuSUF1Z21lbnRlZEpRdWVyeTtcclxuICAgICAgICBiYWNrZHJvcCA6IG5nLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkge31cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW55LCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY3RybC5tZW51Q29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X19jb250ZW50JykpO1xyXG4gICAgICAgICAgICBjdHJsLmJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLW1lbnVfX2JhY2tkcm9wJykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KCd3aWR0aCcpKSB7XHJcbiAgICAgICAgICAgICAgIGN0cmwubWVudUNvbnRlbnQuYWRkQ2xhc3MoYGMtbWVudV9fY29udGVudC0td2lkdGgtJHthdHRycy53aWR0aH1gKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ21vdmVUb0JvZHknKSkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5tb3ZlVG9Cb2R5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eSgncG9zaXRpb24nKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwbGl0UG9zID0gYXR0cnMucG9zaXRpb24uc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oc3BsaXRQb3NbMF0sIHNwbGl0UG9zWzFdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0UG9zaXRpb24oJ3RvcCcsICdsZWZ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0cmwuYmFja2Ryb3Aub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChjdHJsLm1lbnVDb250ZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tZW51X19pdGVtJykpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4gY3RybC5jbG9zZSgpLCAxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb250cm9sbGVyID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBmdW5jdGlvbigkc2NvcGU6IG5nLklTY29wZSwgJGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywge1xyXG4gICAgICAgICAgICAgICAgb25Cb2R5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHhQb3M6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB5UG9zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgb3BlbixcclxuICAgICAgICAgICAgICAgIGNsb3NlLFxyXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICBtb3ZlVG9Cb2R5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2Ryb3AgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb3BlbigpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtZW51VGFyZ2V0ID0gYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51X190YXJnZXQnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25Cb2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldFBvcyA9IG1lbnVUYXJnZXRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnhQb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5yaWdodCAtIHRoaXMubWVudUNvbnRlbnRbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCA9IHRhcmdldFBvcy5sZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnlQb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IHRhcmdldFBvcy50b3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcCA9IHRhcmdldFBvcy5ib3R0b20gLSB0aGlzLm1lbnVDb250ZW50WzBdLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUubGVmdCA9IGAke2xlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnR9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUudG9wID0gYCR7dG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3B9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnRbMF0uc3R5bGUucmlnaHQgPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudFswXS5zdHlsZS5ib3R0b20gPSAnaW5pdGlhbCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1tZW51JykpLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHlQb3NpdGlvbiwgeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHlQb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tdG9wJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tYm90dG9tJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoeFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUNvbnRlbnQuYWRkQ2xhc3MoJ2MtbWVudV9fY29udGVudC0tcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ubyBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy54UG9zID0geFBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy55UG9zID0geVBvc2l0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlVG9Cb2R5KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51Q29udGVudC5hZGRDbGFzcygnanMtbWVudV9fY29udGVudC0tb24tYm9keScpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMubWVudUNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkuYXBwZW5kKHRoaXMuYmFja2Ryb3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIGxldCBkaXJlY3RpdmUgPSAoJHRpbWVvdXQ6IG5nLklUaW1lb3V0U2VydmljZSkgPT4gbmV3IE1lbnUoJHRpbWVvdXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudVRhcmdldCBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudSc7XHJcbiAgICAgICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUgPSB0cnVlO1xyXG4gICAgICAgIHRlbXBsYXRlID0gYDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImMtbWVudV9fdGFyZ2V0IGMtYnV0dG9uIGpzLW1lbnVfX3RhcmdldFwiXHJcbiAgICAgICAgICAgICAgICAgICAgbmctdHJhbnNjbHVkZVxyXG4gICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJG1lbnUub3BlbigpXCI+PC9idXR0b24+YDtcclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAoPGFueT5zY29wZSkuJG1lbnUgPSBjdHJsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCkgOiBuZy5JRGlyZWN0aXZlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBuZXcgTWVudVRhcmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVudUNvbnRlbnQgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXF1aXJlID0gJ150ZE1lbnUnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9ICc8dWwgY2xhc3M9XCJjLW1lbnVfX2NvbnRlbnQganMtbWVudV9fY29udGVudFwiIG5nLXRyYW5zY2x1ZGU+PC91bD4nO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE1lbnVDb250ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW51SXRlbSBpbXBsZW1lbnRzIG5nLklEaXJlY3RpdmUge1xyXG4gICAgICAgIHJlcXVpcmUgPSAnXnRkTWVudUNvbnRlbnQnO1xyXG4gICAgICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlID0gdHJ1ZTtcclxuICAgICAgICB0ZW1wbGF0ZSA9ICc8YSBjbGFzcz1cImMtYnV0dG9uIGMtYnV0dG9uLS1tZW51IGMtbWVudV9faXRlbSBqcy1tZW51X19pdGVtXCIgbmctdHJhbnNjbHVkZT48L2E+JztcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuICgpID0+IG5ldyBNZW51SXRlbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IG1lbnUgPSBhbmd1bGFyLm1vZHVsZSgndGhyZWFkLm1lbnUnLCBbXSk7XHJcbm1lbnUuZGlyZWN0aXZlKCd0ZE1lbnUnLCBbJyR0aW1lb3V0JywgVGhyZWFkLkNvbXBvbmVudHMuTWVudS5mYWN0b3J5KCldKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudVRhcmdldCcsIFRocmVhZC5Db21wb25lbnRzLk1lbnVUYXJnZXQuZmFjdG9yeSgpKTtcclxubWVudS5kaXJlY3RpdmUoJ3RkTWVudUNvbnRlbnQnLCBUaHJlYWQuQ29tcG9uZW50cy5NZW51Q29udGVudC5mYWN0b3J5KCkpO1xyXG5tZW51LmRpcmVjdGl2ZSgndGRNZW51SXRlbScsIFRocmVhZC5Db21wb25lbnRzLk1lbnVJdGVtLmZhY3RvcnkoKSk7IiwibW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5wdXRSZXF1aXJlQXR0cmlidXRlcyB7XHJcbiAgICAgICAgaGlkZVJlcXVpcmU6IGFueVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLmlucHV0UmVxdWlyZScsIFtdKS5kaXJlY3RpdmUoJ2NJbnB1dCcsICgkdGltZW91dCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0MnLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IFRocmVhZC5Db21wb25lbnRzLklucHV0UmVxdWlyZUF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0RmllbGQgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmMtaW5wdXRfX2ZpZWxkJykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dEZpZWxkLmF0dHIoJ3JlcXVpcmVkJykgfHwgYXR0cnMuaGlkZVJlcXVpcmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGFzLXJlcXVpcmVkJyk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICFpbnB1dEZpZWxkLnZhbCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKCdoYXMtcmVxdWlyZWQtaW52YWxpZCcsICF0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTsiLCJtb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIFNjcm9sbENvbGxhcHNlIGltcGxlbWVudHMgbmcuSURpcmVjdGl2ZSB7XHJcbiAgICAgICAgcmVzdHJpY3QgPSAnQSc7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyR3aW5kb3cnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkd2luZG93OiBuZy5JV2luZG93U2VydmljZSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxhc3RTY3JvbGwgPSAwO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KHRoaXMuJHdpbmRvdykub24oJ3Njcm9sbCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JvbGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jykuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIGRvd25cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGwgPiBsYXN0U2Nyb2xsICsgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1jb2xsYXBzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsID0gc2Nyb2xsO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vU2Nyb2xsaW5nIHVwXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbCA8IGxhc3RTY3JvbGwgLSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWNvbGxhcHNlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGwgPSBzY3JvbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN0YXRpYyBmYWN0b3J5KCk6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gKCR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlKSA9PiBuZXcgU2Nyb2xsQ29sbGFwc2UoJHdpbmRvdyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNjcm9sbENvbGxhcHNlJywgW10pLmRpcmVjdGl2ZSgnc2Nyb2xsQ29sbGFwc2UnLCBbJyR3aW5kb3cnLCBUaHJlYWQuQ29tcG9uZW50cy5TY3JvbGxDb2xsYXBzZS5mYWN0b3J5KCldKTsiLCIvKipcclxuICogUHJvZ3Jlc3NpdmUgRGlzY2xvc3VyZVxyXG4gKiBBIG5hdHVyYWwgbGFuZ3VhZ2UgY29tcG9uZW50IHRoYXQgc2hvd3Mgb25lXHJcbiAqIHNlY3Rpb24gYXQgYSB0aW1lIGNlbnRlcmVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlblxyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA2LzE1LzIwMTZcclxuICovXHJcblxyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIFByb2Rpc0NvbnRyb2xsZXIge1xyXG4gICAgICAgIGN1cnJlbnRTZWN0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgc2VjdGlvbnM6IGFueVtdO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlICR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuc2VjdGlvbnMgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5leHQoKSB7XHJcbiAgICAgICAgICAgIGlmICgrK3RoaXMuY3VycmVudFNlY3Rpb24gPj0gdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdvVG8oc2VjdGlvbk5hbWUpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY3VycmVudFNlY3Rpb247IGkgPCB0aGlzLnNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWN0aW9uc1tpXS5uYW1lID09PSBzZWN0aW9uTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEN1cnJlbnQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlU2VjdGlvbnMoKSB7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwcm9kaXNFbCA6IEhUTUxFbGVtZW50O1xyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSB0aGlzLmN1cnJlbnRTZWN0aW9uOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSB0aGlzLmdldFNlY3Rpb25IZWlnaHQodGhpcy5zZWN0aW9uc1tpXS5lbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcHJvZGlzRWwgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtcHJvZGlzJyk7XHJcbiAgICAgICAgICAgIHByb2Rpc0VsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWdpc3RlclNlY3Rpb24oZWxlbWVudCwgbmFtZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlY3Rpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIG5hbWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VjdGlvbnMoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRTZWN0aW9uSGVpZ2h0KHNlY3Rpb24pIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyID0gc2VjdGlvbi5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGxldCBzdHlsZSA6IENTU1N0eWxlRGVjbGFyYXRpb24gPSBnZXRDb21wdXRlZFN0eWxlKHNlY3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xyXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC5wcm9kaXMnLCBbXSkuZGlyZWN0aXZlKCdwcm9kaXMnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtbmF0dXJhbC1sYW5ndWFnZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1wcm9kaXMganMtcHJvZGlzXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHByb2RpcycsXHJcbiAgICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsICckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLlByb2Rpc0NvbnRyb2xsZXJdXHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQucHJvZGlzJykuZGlyZWN0aXZlKCdwcm9kaXNTZWN0aW9uJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLW5hdHVyYWwtbGFuZ3VhZ2VfX3NlY3Rpb24gYy1wcm9kaXNfX3NlY3Rpb24ganMtcHJvZGlzX19zZWN0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYy1wcm9kaXNfX3NlY3Rpb24tLWNvbXBsZXRlJzogJHByb2Rpc1NlY3Rpb24uaXNDb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjLXByb2Rpc19fc2VjdGlvbi0tdmlzaWJsZSc6ICRwcm9kaXNTZWN0aW9uLmlkIDw9ICRwcm9kaXMuY3VycmVudFNlY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+YCxcclxuICAgICAgICByZXF1aXJlOiAnXnByb2RpcycsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckcHJvZGlzU2VjdGlvbicsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICAvL3JlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICAgICAgbGV0ICRwYXJlbnQgPSAkc2NvcGUuJHByb2RpcztcclxuICAgICAgICAgICAgdGhpcy5pZCA9ICRwYXJlbnQucmVnaXN0ZXJTZWN0aW9uKCRlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5qcy1wcm9kaXNfX3NlY3Rpb24nKSwgJGF0dHJzLm5hbWUpO1xyXG4gICAgICAgICAgICB0aGlzLmlzQ29tcGxldGUgPSAhISRhdHRycy5pc0NvbXBsZXRlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyIsImltcG9ydCBTZWxlY3RDb250cm9sbGVyID0gVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcjtcclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBPcHRpb25Nb2RlbCB7XHJcbiAgICAgICAgbmFtZTogU3RyaW5nO1xyXG4gICAgICAgIHZhbHVlOiBhbnk7XHJcbiAgICAgICAgaXNIaWdobGlnaHRlZDogYm9vbGVhbjtcclxuICAgICAgICBpc1NlbGVjdGVkOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBTdHJpbmcsIHZhbHVlOiBhbnkpIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBTZWxlY3RDb250cm9sbGVyIHtcclxuICAgICAgICBvcHRpb25zID0gW107XHJcbiAgICAgICAgc2VsZWN0ZWQ6IE9wdGlvbk1vZGVsO1xyXG4gICAgICAgIGhpZ2hsaWdodGVkOiBPcHRpb25Nb2RlbDtcclxuICAgICAgICBtb2RlbDogYW55O1xyXG4gICAgICAgIGlzT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkT3B0aW9uKG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wdXNoKG5ldyBPcHRpb25Nb2RlbChuYW1lLCB2YWx1ZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3Blbk9wdGlvbkxpc3QoKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRQb3MgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBwYXJlbnRQb3MubGVmdCArPSBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgIHBhcmVudFBvcy50b3AgKz0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmFja2Ryb3A6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcclxuICAgICAgICAgICAgbGV0IG9wdGlvbkxpc3Q6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fbWVudScpO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLndpZHRoID0gYCR7dGhpcy4kZWxlbWVudFswXS5vZmZzZXRXaWR0aH1weGA7XHJcbiAgICAgICAgICAgIG9wdGlvbkxpc3Quc3R5bGUubGVmdCA9IGAke3BhcmVudFBvcy5sZWZ0IC0gMTZ9cHhgO1xyXG4gICAgICAgICAgICBvcHRpb25MaXN0LnN0eWxlLnRvcCA9IGAke3BhcmVudFBvcy50b3AgLSAxNH1weGA7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5hZGRDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYmFja2Ryb3ApLmFkZENsYXNzKCdpcy1vcGVuJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMuc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkLmlzSGlnaGxpZ2h0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuaXMtc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0RWxlbWVudFBvc2l0aW9uSW5WaWV3KHBhcmVudDogSFRNTEVsZW1lbnQsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBhcmVudFRvcCA9IHBhcmVudFJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRCb3R0b20gPSBwYXJlbnRSZWN0LmJvdHRvbSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnRUb3AgPSBlbGVtZW50UmVjdC50b3AgKyBwYXJlbnQuc2Nyb2xsVG9wO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudEJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHBhcmVudC5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudFJlY3QudG9wIDwgcGFyZW50VG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudFRvcCAtIHBhcmVudFRvcDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50UmVjdC5ib3R0b20gPiBwYXJlbnRCb3R0b20pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Qm90dG9tIC0gcGFyZW50Qm90dG9tO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zY3JvbGxUb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsb3NlT3B0aW9uTGlzdCgpIHtcclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uTGlzdDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtc2VsZWN0X19tZW51Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFja2Ryb3A6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuaXMtc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChvcHRpb25MaXN0KS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGJhY2tkcm9wKS5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gdGhpcy5nZXRFbGVtZW50UG9zaXRpb25JblZpZXcob3B0aW9uTGlzdCwgc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbkxpc3Quc2Nyb2xsVG9wID0gbmV3UG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlbGVjdChvcHRpb24pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gb3B0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9uLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlnaGxpZ2h0TmV4dCgpIHtcclxuICAgICAgICAgICAgbGV0IGlkeDogbnVtYmVyID0gLTE7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbaV0uaXNIaWdobGlnaHRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaWR4ID49IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIHx8IGlkeCA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlkeCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVuSGlnaGxpZ2h0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSB0aGlzLm9wdGlvbnNbaWR4XTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2lkeF0uaXNIaWdobGlnaHRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdobGlnaHRQcmV2KCkge1xyXG4gICAgICAgICAgICBsZXQgaWR4OiBudW1iZXIgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zW2ldLmlzSGlnaGxpZ2h0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpZHggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZHggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRoaXMub3B0aW9uc1tpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbaWR4XS5pc0hpZ2hsaWdodGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldEhpZ2hsaWdodGVkKCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1tpXS5pc0hpZ2hsaWdodGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdW5IaWdobGlnaHRBbGwoKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5pc0hpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZWQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgT3B0aW9uQ29udHJvbGxlciB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdCcsIFtdKS5kaXJlY3RpdmUoJ3RkU2VsZWN0JywgKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgbW9kZWw6ICc9bmdNb2RlbCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cImMtc2VsZWN0IGMtaW5wdXRfX2ZpZWxkIGpzLXNlbGVjdFwiIHRhYmluZGV4PVwiMFwiIG5nLWNsaWNrPVwiJHNlbGVjdEN0cmwub3Blbk9wdGlvbkxpc3QoKTtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc2VsZWN0X19iYWNrZHJvcCBqcy1zZWxlY3RfX2JhY2tkcm9wXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGNsYXNzPVwiYy1zZWxlY3RfX3ZhbHVlXCI+e3skc2VsZWN0Q3RybC5tb2RlbCB8fCAnICd9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHVsIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGNsYXNzPVwiYy1zZWxlY3RfX21lbnUganMtc2VsZWN0X19tZW51XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjLXNlbGVjdF9fbWVudS1pdGVtIGpzLXNlbGVjdF9fbWVudS1pdGVtXCIgbmctcmVwZWF0PVwib3B0aW9uIGluICRzZWxlY3RDdHJsLm9wdGlvbnNcIiBuZy1jbGFzcz1cInsnaGFzLWZvY3VzJzogb3B0aW9uLmlzSGlnaGxpZ2h0ZWQsICdpcy1zZWxlY3RlZCc6IG9wdGlvbi5pc1NlbGVjdGVkfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCIkc2VsZWN0Q3RybC5zZWxlY3Qob3B0aW9uKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+e3tvcHRpb24ubmFtZX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cIm1pIGMtc2VsZWN0X19hcnJvd1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPmFycm93X2Ryb3BfZG93bjwvaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzcz1cImMtc2VsZWN0X19ib3hcIiBuZy10cmFuc2NsdWRlIG5nLW1vZGVsPVwiJHNlbGVjdEN0cmwubW9kZWxcIiB0YWJpbmRleD1cIi0xXCI+PC9zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBjb250cm9sbGVyOiBUaHJlYWQuQ29tcG9uZW50cy5TZWxlY3RDb250cm9sbGVyLFxyXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcbiAgICAgICAgY29udHJvbGxlckFzOiAnJHNlbGVjdEN0cmwnLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBuZy5JU2NvcGUsIGVsZW1lbnQ6IG5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbnksIGN0cmw6IFNlbGVjdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgbGV0IGJhY2tkcm9wID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXNlbGVjdF9fYmFja2Ryb3AnKSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNlbGVjdF9fbWVudS1pdGVtJykpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbi5vbignbW91c2VlbnRlciBtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwudW5IaWdobGlnaHRBbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGJhY2tkcm9wLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgY3RybC5jbG9zZU9wdGlvbkxpc3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdibHVyJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuY2xvc2VPcHRpb25MaXN0KCk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzg6ICAgIC8vYXJyb3cgdXBcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM3OiAgICAvL2Fycm93IGxlZnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbikgY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodFByZXYoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6ICAgIC8vYXJyb3cgcmlnaHRcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOiAgICAvL2Fycm93IGRvd25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdHJsLmlzT3BlbikgY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmhpZ2hsaWdodE5leHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6ICAgIC8vc3BhY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5pc09wZW4gPyBjdHJsLmNsb3NlT3B0aW9uTGlzdCgpIDogY3RybC5vcGVuT3B0aW9uTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzogICAgLy9lbnRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5pc09wZW4gJiYgY3RybC5oaWdobGlnaHRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZWxlY3QoY3RybC5oaWdobGlnaHRlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0JykuZGlyZWN0aXZlKCd0ZE9wdGlvbicsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHRydWUsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFNlbGVjdCcsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8b3B0aW9uIG5nLXRyYW5zY2x1ZGUgbmctdmFsdWU9XCIkc2VsZWN0T3B0aW9uQ3RybC52YWx1ZVwiPjwvb3B0aW9uPicsXHJcbiAgICAgICAgY29udHJvbGxlcjogVGhyZWFkLkNvbXBvbmVudHMuT3B0aW9uQ29udHJvbGxlcixcclxuICAgICAgICBjb250cm9sbGVyQXM6ICckc2VsZWN0T3B0aW9uQ3RybCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6IGFueSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFueSwgY3RybDogVGhyZWFkLkNvbXBvbmVudHMuU2VsZWN0Q29udHJvbGxlcikge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBhdHRycy52YWx1ZSB8fCBlbGVtZW50LnRleHQoKS5yZXBsYWNlKC9cXHMvLCAnJyk7XHJcbiAgICAgICAgICAgIHNjb3BlLiRzZWxlY3RPcHRpb25DdHJsLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGN0cmwuYWRkT3B0aW9uKGVsZW1lbnQudGV4dCgpLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIFNlbGVjdCBSZXNpemVcclxuICogQXV0b21hdGljYWxseSByZXNpemVzIHNlbGVjdCBlbGVtZW50cyB0byBmaXQgdGhlIHRleHQgZXhhY3RseVxyXG4gKiBAYXV0aG9yIFphY2ggQmFybmVzXHJcbiAqIEBjcmVhdGVkIDA3LzE5LzIwMTZcclxuICovXHJcblxyXG5pbnRlcmZhY2Ugc2VsZWN0UmVzaXplU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgcmVzaXplRGVmYXVsdCA6IG51bWJlcjtcclxuICAgIG9uUmVzaXplOiBGdW5jdGlvbjtcclxuICAgIHBhcmVudDogc3RyaW5nO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndGhyZWFkLnNlbGVjdFJlc2l6ZScsIFtdKS5kaXJlY3RpdmUoJ3NlbGVjdFJlc2l6ZVBhcmVudCcsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuICAgICAgICBjb250cm9sbGVyKCRlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxlbWVudCA9IGdldEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRFbGVtZW50KCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQuc2VsZWN0UmVzaXplJykuZGlyZWN0aXZlKCdzZWxlY3RSZXNpemUnLCAoJHRpbWVvdXQpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVxdWlyZTogJz9ec2VsZWN0UmVzaXplUGFyZW50JyxcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBvblJlc2l6ZTogJyZzZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICAgICByZXNpemVEZWZhdWx0OiAnQCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rKHNjb3BlOiBzZWxlY3RSZXNpemVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5vbignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzaXplSW5wdXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNpemVJbnB1dCgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlbCA6IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PmVsZW1lbnRbMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgYXJyb3dXaWR0aCA9IDI0O1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAoPEhUTUxPcHRpb25FbGVtZW50PmVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0pLnRleHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVzdEVsID0gYW5ndWxhci5lbGVtZW50KCc8c3Bhbj4nKS5odG1sKHRleHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gY3RybCA/IGN0cmwuZ2V0RWxlbWVudCgpIDogZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kKHRlc3RFbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gdGVzdEVsWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RFbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0RWwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBzY29wZS5yZXNpemVEZWZhdWx0IHx8IDE1MDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKyBhcnJvd1dpZHRofXB4YDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUub25SZXNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIFRhYiBjb21wb25lbnRcclxuICogQSBjb21wb25lbnQgdGhhdCBhbGxvd3Mgc3dpdGNoaW5nIGJldHdlZW5cclxuICogc2V0cyBvZiBjb250ZW50IHNlcGFyYXRlZCBpbnRvIGdyb3VwcyBieSB0YWJzXHJcbiAqIEBhdXRob3IgWmFjaCBCYXJuZXNcclxuICogQGNyZWF0ZWQgMDcvMDgvMjAxNlxyXG4gKi9cclxubW9kdWxlIFRocmVhZC5Db21wb25lbnRzIHtcclxuICAgIGludGVyZmFjZSBUYWJzIHtcclxuICAgICAgICBsYXN0VGFiOiBudW1iZXI7XHJcbiAgICAgICAgYWN0aXZlVGFiOiBudW1iZXI7XHJcbiAgICAgICAgdGFiczogQXJyYXk8T2JqZWN0PjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRhYlRpdGxlU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgICR0YWJzOiBUYWJzQ29udHJvbGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVGFic0NvbnRyb2xsZXIgaW1wbGVtZW50cyBUYWJze1xyXG4gICAgICAgIGFjdGl2ZVRhYiA9IDE7XHJcbiAgICAgICAgdGFicyA9IFtdO1xyXG4gICAgICAgIGxhc3RUYWIgPSAtMTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkc2NvcGU6IG5nLklTY29wZSwgcHJpdmF0ZSAkZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJG9uSW5pdCgpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+ICg8YW55PnRoaXMpLmN1cnJlbnRUYWIsIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKG5ld1ZhbHVlICYmIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmFjdGl2ZVRhYiA9IG5ld1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLnVwZGF0ZVRhYnMoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMpLmNoYW5nZVRhYihudWxsLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzaXplVGFicygpIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBOdW1iZXIgPSAxNjtcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoICs9IHRoaXMudGFic1tpXS5oZWFkZXJbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YWJIZWFkZXIgPSA8SFRNTEVsZW1lbnQ+dGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKTtcclxuICAgICAgICAgICAgdGFiSGVhZGVyLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkVGFiKGhlYWRlciA6IG5nLklBdWdtZW50ZWRKUXVlcnksIGJvZHkgOiBuZy5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGxldCBpZHggOiBudW1iZXIgPSB0aGlzLnRhYnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcclxuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuanMtdGFiX19oZWFkZXInKSkuYXBwZW5kKGhlYWRlcik7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuYXR0cigndGQtdGFiLWluZGV4JywgaWR4KTtcclxuICAgICAgICAgICAgYm9keS5hdHRyKCd0ZC10YWItaW5kZXgnLCBpZHgpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUYWJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplVGFicygpO1xyXG5cclxuICAgICAgICAgICAgYm9keVswXS5zdHlsZS50cmFuc2l0aW9uID0gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGFuZ2VUYWIoZXZlbnQ6IEpRdWVyeUV2ZW50T2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmKGluZGV4ID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgndGQtdGFiLWluZGV4JykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihpbmRleCAmJiBpbmRleCAhPT0gdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRhYiA9IHRoaXMuYWN0aXZlVGFiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVUYWIgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVGFicygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGVUYWJzKCkge1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0IDogTnVtYmVyO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudCA6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZih0aGlzLmxhc3RUYWIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy50YWJzW3RoaXMuYWN0aXZlVGFiIC0gMV0uYm9keVswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPEhUTUxFbGVtZW50PnRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fY29udGVudCcpO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgICAgICAgICAgICAgY29udGVudC5zdHlsZS50cmFuc2l0aW9uID0gJ2hlaWdodCA1MDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IGkgKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUYWIoaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaWR4ID09PSB0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5oZWFkZXIuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFic1tpXS5ib2R5LmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaWR4IDwgdGhpcy5hY3RpdmVUYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uaGVhZGVyLmFkZENsYXNzKCdpcy1sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmJvZHkuYWRkQ2xhc3MoJ2lzLWxlZnQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzW2ldLmhlYWRlci5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnNbaV0uYm9keS5hZGRDbGFzcygnaXMtcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5sYXN0VGFiID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGVhclRhYihpZHg6IG51bWJlcikge1xyXG4gICAgICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmJsdXIoKTtcclxuICAgICAgICAgICAgdGhpcy50YWJzW2lkeF0uaGVhZGVyLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYnNbaWR4XS5ib2R5LnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtcmlnaHQgaXMtbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInLCBbXSkuZGlyZWN0aXZlKCd0ZFRhYnMnLCAoJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUYWI6ICc9J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJjLXRhYlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlci13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy10YWJfX2hlYWRlciBqcy10YWJfX2hlYWRlclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdGFiX19jb250ZW50LXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXRhYl9fY29udGVudCBqcy10YWJfX2NvbnRlbnRcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogJyR0YWJzJyxcclxuICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsICckdGltZW91dCcsIFRocmVhZC5Db21wb25lbnRzLlRhYnNDb250cm9sbGVyXSxcclxuICAgICAgICBsaW5rOiAoc2NvcGU6IG5nLklTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgIFJlc2l6ZSB0aGUgYmFja2dyb3VuZCBvbmNlIHNoaWZ0IGZyb20gZm9udHMgbG9hZGVkIGhhcyBvY2N1cmVkXHJcbiAgICAgICAgICAgICBVc2UgaW50ZXJ2YWwgYXMgYSBmaXggZm9yIElFIGFuZCBTYWZhcmlcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmKCdmb250cycgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICg8YW55PmRvY3VtZW50KS5mb250cy5yZWFkeS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmwucmVzaXplVGFicygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHlDaGVja0ludGVydmFsID0gJGludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNpemVUYWJzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVhZHlDaGVja0ludGVydmFsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAxMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQudGFiJykuZGlyZWN0aXZlKCd0ZFRhYicsICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxyXG4gICAgICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgICAgIGxpbmsoc2NvcGU6bmcuSVNjb3BlLCBlbGVtZW50Om5nLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOm5nLklBdHRyaWJ1dGVzLCBjdHJsOmFueSkge1xyXG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fdGl0bGUnKSk7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLmpzLXRhYl9fYm9keScpKTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuYWRkVGFiKGhlYWRlciwgYm9keSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiVGl0bGUnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgcmVxdWlyZTogJ150ZFRhYnMnLFxyXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNsYXNzPVwiYy10YWJfX2hlYWRlci1pdGVtIGMtYnV0dG9uIGMtYnV0dG9uLS10YWIganMtdGFiX190aXRsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwiJHRhYnMuY2hhbmdlVGFiKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZy10cmFuc2NsdWRlPjwvYnV0dG9uPmAsXHJcbiAgICAgICAgbGluayhzY29wZTogVGhyZWFkLkNvbXBvbmVudHMuVGFiVGl0bGVTY29wZSwgZWxlbWVudDogbmcuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IG5nLklBdHRyaWJ1dGVzLCBjdHJsOiBhbnkpIHtcclxuICAgICAgICAgICAgc2NvcGUuJHRhYnMgPSBjdHJsO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3RocmVhZC50YWInKS5kaXJlY3RpdmUoJ3RkVGFiQm9keScsICgpID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXF1aXJlOiAnXnRkVGFiJyxcclxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImMtdGFiX19ib2R5IGpzLXRhYl9fYm9keVwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+J1xyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIFdhdmUgZWZmZWN0XHJcbiAqIEEgZGlyZWN0aXZlIHRoYXQgc2hvd3MgYSBncm93aW5nIGNpcmNsZSBpbiB0aGUgYmFja2dyb3VuZFxyXG4gKiBvZiBjb21wb25lbnRzIGl0J3MgYXR0YWNoZWQgdG9cclxuICogQGF1dGhvciBaYWNoIEJhcm5lc1xyXG4gKiBAY3JlYXRlZCAwNy8xMS8yMDE2XHJcbiAqL1xyXG5tb2R1bGUgVGhyZWFkLkNvbXBvbmVudHMge1xyXG4gICAgZXhwb3J0IGNsYXNzIHdhdmVFZmZlY3QgaW1wbGVtZW50cyBuZy5JRGlyZWN0aXZlIHtcclxuICAgICAgICByZXN0cmljdCA9ICdBJztcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSAkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGluayA9IChzY29wZTogbmcuSVNjb3BlLCBlbGVtZW50OiBuZy5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogbmcuSUF0dHJpYnV0ZXMsIGN0cmw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoJ25vV2F2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB3YXZlRWw7XHJcbiAgICAgICAgICAgIGxldCByYXdFbGVtZW50ID0gZWxlbWVudFswXTtcclxuICAgICAgICAgICAgbGV0IGlzRmFiID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCByZW1vdmVBY3RpdmVUcmlnZ2VyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZUFjdGl2ZVRpbWVvdXQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHNwYW4gY2xhc3M9XCJ3YXZlLWVmZmVjdFwiPjwvc3Bhbj4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYicpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5oYXNDbGFzcygnYy1idXR0b24tLWZhYi1taW5pJykgfHxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmhhc0NsYXNzKCdjLWJ1dHRvbi0taWNvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLmFkZENsYXNzKCd3YXZlLWVmZmVjdC0tZmFiJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNGYWIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0ZhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY2lyY2xlLCBoZWlnaHQgbXVzdCBtYXRjaCB0aGUgd2lkdGhcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHJhd0VsZW1lbnQub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcmF3RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmNlaWwocmF3RWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5jZWlsKHJhd0VsZW1lbnQub2Zmc2V0V2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG5cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHdhdmVFbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub24oJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHsgbGVmdDogZS5jbGllbnRYLCB0b3A6IGUuY2xpZW50WSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50UG9zID0gZS50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUubGVmdCA9IGAke3Bvcy5sZWZ0IC0gcGFyZW50UG9zLmxlZnR9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gYCR7cG9zLnRvcCAtIHBhcmVudFBvcy50b3B9cHhgO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICAgICAgICAgICAgICAgICAgICB3YXZlRWwuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUcmlnZ2VyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUFjdGl2ZVRyaWdnZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVBY3RpdmVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2ZvY3VzJywgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHdhdmVFbFswXS5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWxbMF0uc3R5bGUudG9wID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdmVFbC5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oJ2JsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3YXZlRWwucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVBY3RpdmVUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQWN0aXZlVHJpZ2dlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJhd0VsZW1lbnQuYmx1cigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYod2F2ZUVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSkub2ZmKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3RhdGljIGZhY3RvcnkoKSA6IG5nLklEaXJlY3RpdmVGYWN0b3J5IHtcclxuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9ICgkdGltZW91dDogbmcuSVRpbWVvdXRTZXJ2aWNlKSA9PiBuZXcgVGhyZWFkLkNvbXBvbmVudHMud2F2ZUVmZmVjdCgkdGltZW91dCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3Mgd2F2ZUVmZmVjdEJ1dHRvbiBleHRlbmRzIHdhdmVFZmZlY3Qge1xyXG4gICAgICAgIHJlc3RyaWN0ID0gJ0MnO1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuICAgICAgICBzdGF0aWMgZmFjdG9yeSgpIDogbmcuSURpcmVjdGl2ZUZhY3Rvcnkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gKCR0aW1lb3V0OiBuZy5JVGltZW91dFNlcnZpY2UpID0+IG5ldyBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uKCR0aW1lb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcsIFtdKS5kaXJlY3RpdmUoJ3dhdmVFZmZlY3QnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0LmZhY3RvcnkoKSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd0aHJlYWQud2F2ZUVmZmVjdCcpLmRpcmVjdGl2ZSgnY0J1dHRvbicsIFsnJHRpbWVvdXQnLCBUaHJlYWQuQ29tcG9uZW50cy53YXZlRWZmZWN0QnV0dG9uLmZhY3RvcnkoKV0pO1xyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGluZ3MvYW5ndWxhcmpzL2FuZ3VsYXIuZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgdGhyZWFkIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCd0aHJlYWQnLCBbXHJcbiAgICAgICAgJ3RocmVhZC5zY3JvbGxDb2xsYXBzZScsXHJcbiAgICAgICAgJ3RocmVhZC53YXZlRWZmZWN0JyxcclxuICAgICAgICAndGhyZWFkLm1lbnUnLFxyXG4gICAgICAgICd0aHJlYWQudGFiJyxcclxuICAgICAgICAndGhyZWFkLmZsb2F0aW5nTGFiZWwnLFxyXG4gICAgICAgICd0aHJlYWQuaW5wdXRSZXF1aXJlJyxcclxuICAgICAgICAndGhyZWFkLnByb2RpcycsXHJcbiAgICAgICAgJ3RocmVhZC5zZWxlY3RSZXNpemUnLFxyXG4gICAgICAgICd0aHJlYWQuZHluYW1pY0JhY2tncm91bmQnLFxyXG4gICAgICAgICd0aHJlYWQuZGlhbG9nJyxcclxuICAgICAgICAndGhyZWFkLnNlbGVjdCdcclxuICAgIF0pO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

angular.module('app.templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('pages/components/button/button.html','<div class="button__scope l-page l-page--has-app-bar l-page--orange">\r\n    <!-- TODO remove static height when background component is implemented -->\r\n    <div class="l-page__background" style="height: 209px;"></div>\r\n    <div class="c-app-bar c-app-bar--orange">\r\n        <div class="c-app-bar__left">\r\n            <button class="c-button c-button--icon"><i class="mi">menu</i></button>\r\n            <span class="c-app-bar__title">Buttons</span>\r\n        </div>\r\n        <div class="c-app-bar__right">\r\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\r\n        </div>\r\n    </div>\r\n    <div class="l-page__primary">\r\n        <p class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\r\n            <span class="c-natural-language--bold">Buttons</span> are <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> elements used as\r\n            primary Calls to Action (CTAs)\r\n        </p>\r\n    </div>\r\n    <div class="l-page__secondary">\r\n        <!-- Base -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Base (flat)</h1>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button">Button</button>\r\n                    <pre class="language-html"><code>&lt;button class="c-button">Button&lt;/button></code></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Base -->\r\n\r\n        <!-- Raised -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Raised</h1>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--raised c-button--primary">Button</button>\r\n                    <pre class="language-html"><code>&lt;button class="c-button c-button--raised">Button&lt;/button></code></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Raised -->\r\n\r\n        <!-- FAB -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Floating Action Button (FAB)</h1>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--fab c-button--primary"><i class="mi">add</i></button>\r\n                    <pre class="language-html"><code>&lt;button class="c-button c-button--fab">&lt;i class="mi">add&lt;/i>&lt;/button></code></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End FAB -->\r\n    </div>\r\n</div>');}]);
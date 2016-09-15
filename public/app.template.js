angular.module('app.templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('pages/sidenav.html','<nav class="c-sidenav">\n    <div class="c-sidenav__header">\n        <h1 class="c-sidenav__title"><i class="mi">menu</i> hread</h1>\n        <div class="c-search">\n            <input type="text">\n        </div>\n    </div>\n    <div class="c-sidenav__body">\n        <ul class="c-sidenav__list">\n            <li class="c-sidenav__item">Getting Started</li>\n            <li class="c-sidenav__item">Utilities</li>\n            <li class="c-sidenav__item">\n                <span>Components</span>\n                <ul class="c-sidenav__sub-list">\n                    <a class="c-sidenav__item" ui-sref="button">Buttons</a>\n                    <li class="c-sidenav__item">Cards</li>\n                    <li class="c-sidenav__item">Inputs</li>\n                </ul>\n            </li>\n        </ul>\n    </div>\n</nav>');
$templateCache.put('pages/components/badge/badge.html','<div class="badge__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\n    <nav class="c-app-bar c-app-bar--teal">\n        <div class="c-app-bar__left">\n            <span class="c-app-bar__title">Badges</span>\n        </div>\n        <div class="c-app-bar__right">\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\n        </div>\n    </nav>\n\n    <div class="l-page__primary">\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\n            <div class="c-natural-language__section">\n                <span class="c-natural-language__bold">Badges</span> are <code class="c-natural-language__bold">&lt;span></code> elements used to display status\n            </div>\n        </div>\n    </div>\n    <div class="l-page__secondary" dynamic-background-end>\n        <!-- Base -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Base</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <span class="c-badge">Badge</span>\n\n                    <pre class="prettyprint">&lt;span class="c-badge">Badge&lt;/span></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Base -->\n\n        <!-- Colors -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Colors</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <table>\n                        <tbody>\n                        <tr>\n                            <td>Base</td>\n                            <td><span class="c-badge">Badge</span></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-badge--success</code></td>\n                            <td><span class="c-badge c-badge--success">Badge</span></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-badge--primary</code></td>\n                            <td><span class="c-badge c-badge--primary">Badge</span></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-badge--secondary</code></td>\n                            <td><span class="c-badge c-badge--secondary">Badge</span></td>\n                        </tr>\n                        </tbody>\n                    </table>\n\n                    <pre class="prettyprint">&lt;span class="c-badge c-badge--success">Badge&lt;/span></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Colors -->\n    </div>\n</div>');
$templateCache.put('pages/components/button/button.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\n    <nav class="c-app-bar c-app-bar--teal">\n        <div class="c-app-bar__left">\n            <span class="c-app-bar__title">Buttons</span>\n        </div>\n        <div class="c-app-bar__right">\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\n        </div>\n    </nav>\n    <div class="l-page__primary">\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\n            <div class="c-natural-language__section">\n                <span class="c-natural-language__bold">Buttons</span> are <code class="c-natural-language__bold">&lt;a&gt;</code> or <code class="c-natural-language__bold">&lt;button&gt;</code> elements used as\n                primary Calls to Action (CTAs)\n            </div>\n        </div>\n    </div>\n    <div class="l-page__secondary" dynamic-background-end>\n        <!-- Base -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Base (flat)</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <button class="c-button">Button</button>\n                    <pre class="prettyprint">&lt;button class="c-button">Button&lt;/button></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Base -->\n\n        <!-- Raised -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Raised</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <button class="c-button c-button--raised c-button--primary">Button</button>\n                    <pre class="prettyprint">&lt;button class="c-button c-button--raised">Button&lt;/button></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Raised -->\n\n        <!-- FAB -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Floating Action Button (FAB)</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <button class="c-button c-button--fab c-button--primary"><i class="mi">add</i></button>\n                    <button class="c-button c-button--fab-mini c-button--primary"><i class="mi">add</i></button>\n                    <pre class="prettyprint">&lt;button class="c-button c-button--fab">&lt;i class="mi">add&lt;/i>&lt;/button>\n&lt;button class="c-button c-button--fab-mini">&lt;i class="mi">add&lt;/i>&lt;/button></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End FAB -->\n\n        <!-- Icon -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Icon</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <button class="c-button c-button--icon"><i class="mi">add</i></button>\n                    <pre class="prettyprint">&lt;button class="c-button c-button--icon">&lt;i class="mi">add&lt;/i>&lt;/button></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Icon -->\n\n        <!-- Huge -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Huge</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <button class="c-button c-button--huge c-button--primary">Button</button>\n                    <pre class="prettyprint">&lt;button class="c-button c-button--huge">Button&lt;/button></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Huge -->\n\n        <!-- Colors -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Colors</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <table>\n                        <tbody>\n                        <tr>\n                            <td>Base</td>\n                            <td><button class="c-button">Button</button></td>\n                            <td><button class="c-button c-button--raised">Button</button></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-button--primary</code></td>\n                            <td><button class="c-button c-button--primary">Button</button></td>\n                            <td><button class="c-button c-button--raised c-button--primary">Button</button></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-button--secondary</code></td>\n                            <td><button class="c-button c-button--secondary">Button</button></td>\n                            <td><button class="c-button c-button--raised c-button--secondary">Button</button></td>\n                        </tr>\n                        <tr>\n                            <td><code>.c-button--secondary-filled</code></td>\n                            <td><button class="c-button c-button--secondary-filled">Button</button></td>\n                            <td><button class="c-button c-button--raised c-button--secondary-filled">Button</button></td>\n                        </tr>\n                        </tbody>\n                    </table>\n\n                    <pre class="prettyprint">&lt;button class="c-button c-button--primary">Button&lt;/button></pre>\n                    <p>Colors act differently depending on if they\'re on raised or flat buttons.</p>\n                    <p>Flat buttons <code class="u-dark-primary">class="c-button"</code> use the color as a text color </p>\n                    <p>Raised buttons <code class="u-dark-primary">class="c-button c-button--raised"</code> use the color as a background</p>\n                </div>\n            </div>\n        </div>\n        <!-- End Colors -->\n\n\n    </div>\n</div>');
$templateCache.put('pages/components/card/card.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\n    <nav class="c-app-bar c-app-bar--teal">\n        <div class="c-app-bar__left">\n            <span class="c-app-bar__title">Cards</span>\n        </div>\n        <div class="c-app-bar__right">\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\n        </div>\n    </nav>\n    <div class="l-page__primary">\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\n            <div class="c-natural-language__section">\n                <span class="c-natural-language__bold">Cards</span> are containers used to organize groups of smaller components.\n            </div>\n        </div>\n    </div>\n    <div class="l-page__secondary" dynamic-background-end>\n        <!-- Base Card -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <span>\n                        <h1 class="c-card__title">Card Title</h1>\n                        <span class="c-card__sub-title">(Card subtitle)</span>\n                    </span>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">This is the card description.</p>\n\n                    <pre class="prettyprint">&lt;div class="c-card">\n    &lt;div class="c-card__content">\n        &lt;div class="c-card__header">\n            &lt;span>\n                &lt;h1 class="c-card__title">Card Title&lt;/h1>\n                &lt;span class="c-card__sub-title">(Card subtitle)&lt;/span>\n            &lt;/span>\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\n        &lt;/div>\n        &lt;div class="c-card__body">\n            &lt;p class="c-card__description">This is the card description.&lt;/p>\n        &lt;/div>\n    &lt;/div>\n&lt;/div></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Base Card -->\n\n        <!-- Card With Footer -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Card with footer</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">Card footers provide auxillary actions or content. Card footers are optional.</p>\n                    \n            <pre class="prettyprint">&lt;div class="c-card">\n    &lt;div class="c-card__content">\n        &lt;div class="c-card__header">\n            &lt;h1 class="c-card__title">Card with footer&lt;/h1>\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\n        &lt;/div>\n        &lt;div class="c-card__body">\n            &lt;p class="c-card__description">Card footers provide auxillary actions or content.\n                Card footers are optional.&lt;/p>\n        &lt;/div>\n        &lt;div class="c-card__footer">\n            &lt;p>Card footer&lt;/p>\n        &lt;/div>\n    &lt;/div>\n&lt;/div></pre>\n                </div>\n                <div class="c-card__footer">\n                    <p>Card footer</p>\n                </div>\n            </div>\n        </div>\n        <!-- End Card With Footer -->\n\n        <!-- Card With Table -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Card with table</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">Tables within cards override the left and right padding of a\n                        card.</p>\n                </div>\n                <table class="c-table c-table--drag-handle c-table--overflow">\n                    <thead>\n                    <tr>\n                        <th></th>\n                        <th>Method name</th>\n                        <th>duration</th>\n                        <th>modifier</th>\n                        <th>free shipping</th>\n                        <th>price</th>\n                        <th></th>\n                    </tr>\n                    </thead>\n                    <tbody>\n                    <tr>\n                        <td class="c-drag-handle">\n                            <i class="mi">more_vert</i>\n                            <i class="mi">more_vert</i>\n                        </td>\n                        <td class="c-table__primary-col">Expedited</td>\n                        <td>2-3 Days</td>\n                        <td>Price</td>\n                        <td>No</td>\n                        <td>$17+</td>\n                        <td><i class="mi">more_vert</i></td>\n                    </tr>\n                    <tr>\n                        <td class="c-drag-handle">\n                            <i class="mi">more_vert</i>\n                            <i class="mi">more_vert</i>\n                        </td>\n                        <td class="c-table__primary-col">Expedited</td>\n                        <td>2-3 Days</td>\n                        <td>Price</td>\n                        <td>No</td>\n                        <td>$17+</td>\n                        <td><i class="mi">more_vert</i></td>\n                    </tr>\n                    </tbody>\n                </table>\n                <div class="c-card__body">\n                    <pre class="prettyprint">&lt;div class="c-card">\n    &lt;div class="c-card__content">\n        &lt;div class="c-card__header">\n            &lt;h1 class="c-card__title">Card with table&lt;/h1>\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\n        &lt;/div>\n        &lt;div class="c-card__body">\n            &lt;p class="c-card__description">Tables within cards override the left and right padding of a\n                card.&lt;/p>\n        &lt;/div>\n        &lt;table class="c-table c-table--drag-handle c-table--overflow">\n            &lt;thead>\n            &lt;tr>\n                &lt;th>&lt;/th>\n                &lt;th>Method name&lt;/th>\n                &lt;th>duration&lt;/th>\n                &lt;th>modifier&lt;/th>\n                &lt;th>free shipping&lt;/th>\n                &lt;th>price&lt;/th>\n                &lt;th>&lt;/th>\n            &lt;/tr>\n            &lt;/thead>\n            &lt;tbody>\n            &lt;tr>\n                &lt;td class="c-drag-handle">\n                    &lt;i class="mi">more_vert&lt;/i>\n                    &lt;i class="mi">more_vert&lt;/i>\n                &lt;/td>\n                &lt;td class="c-table__primary-col">Expedited&lt;/td>\n                &lt;td>2-3 Days&lt;/td>\n                &lt;td>Price&lt;/td>\n                &lt;td>No&lt;/td>\n                &lt;td>$17+&lt;/td>\n                &lt;td>&lt;i class="mi">more_vert&lt;/i>&lt;/td>\n            &lt;/tr>\n            &lt;tr>\n                &lt;td class="c-drag-handle">\n                    &lt;i class="mi">more_vert&lt;/i>\n                    &lt;i class="mi">more_vert&lt;/i>\n                &lt;/td>\n                &lt;td class="c-table__primary-col">Expedited&lt;/td>\n                &lt;td>2-3 Days&lt;/td>\n                &lt;td>Price&lt;/td>\n                &lt;td>No&lt;/td>\n                &lt;td>$17+&lt;/td>\n                &lt;td>&lt;i class="mi">more_vert&lt;/i>&lt;/td>\n            &lt;/tr>\n            &lt;/tbody>\n        &lt;/table>\n        &lt;div class="c-card__body">\n\n        &lt;/div>\n    &lt;/div>\n&lt;/div></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Card With Table -->\n\n        <!-- Card With Media Content -->\n        <div class="c-card c-card--with-media">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Card with media content</h1>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">The media content column can be on the right or the left of the card</p>\n                    \n                    <pre class="prettyprint">&lt;div class="c-card c-card--with-media">\n    &lt;div class="c-card__content">\n        &lt;div class="c-card__header">\n            &lt;h1 class="c-card__title">Card with media content&lt;/h1>\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\n        &lt;/div>\n        &lt;div class="c-card__body">\n            &lt;p class="c-card__description">The media content column can be on the right or the left of the card&lt;/p>\n        &lt;/div>\n    &lt;/div>\n\n    &lt;div class="c-card__media c-card__media--25 empty-map">\n        &lt;i class="mi mi--xl u-light-primary">location_on&lt;/i>\n    &lt;/div>\n&lt;/div></pre>\n                </div>\n            </div>\n\n            <div class="c-card__media c-card__media--30 empty-map">\n                <i class="mi mi--xl u-light-primary">location_on</i>\n            </div>\n        </div>\n        <!-- End Card With Media Content -->\n    </div>\n</div>');
$templateCache.put('pages/components/input/input.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\n    <nav class="c-app-bar c-app-bar--teal">\n        <div class="c-app-bar__left">\n            <span class="c-app-bar__title">Inputs</span>\n        </div>\n        <div class="c-app-bar__right">\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\n        </div>\n    </nav>\n    <div class="l-page__primary">\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\n            <div class="c-natural-language__section">\n                <span class="c-natural-language__bold">Inputs</span> are HTML form elements used to submit information within a form.\n            </div>\n        </div>\n    </div>\n    <div class="l-page__secondary" dynamic-background-end>\n        <!-- Text Input States -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <span>\n                        <h1 class="c-card__title">Text Inputs</h1>\n                        <span class="c-badge c-badge--success u-margin-left-2">Stable</span>\n                    </span>\n                </div>\n                <div class="c-card__body">\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Required</label>\n                        <input type="text" required class="c-input__field">\n                    </div>\n\n                    <div class="c-input c-input--primary c-input--has-messages has-error">\n                        <label class="c-input__label">Error</label>\n                        <div class="c-input__content">\n                            <input type="text" value="This field has an error" class="c-input__field">\n                        </div>\n                        <div class="c-input__messages">\n                            <p>This field has an error</p>\n                        </div>\n                    </div>\n\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Read Only</label>\n                        <input type="text" readonly class="c-input__field" value="This is not editable">\n                    </div>\n\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Disabled</label>\n                        <input type="text" disabled class="c-input__field" value="This is not editable">\n                    </div>\n\n                    <div class="c-input c-input--primary c-input--has-addon">\n                        <label class="c-input__label">With fixed text</label>\n                        <div class="c-input__content">\n                            <input type="text" class="c-input__field" value="store-url">\n                            <span class="c-input__addon">.mymaterial.com</span>\n                        </div>\n                    </div>\n                    \n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\n    &lt;label class="c-input__label">Required&lt;/label>\n    &lt;input type="text" required class="c-input__field">\n&lt;/div>\n\n&lt;div class="c-input c-input--primary c-input--has-messages has-error">\n    &lt;label class="c-input__label">Error&lt;/label>\n    &lt;div class="c-input__content">\n        &lt;input type="text" value="This field has an error" class="c-input__field">\n    &lt;/div>\n    &lt;div class="c-input__messages">\n        &lt;p>This field has an error&lt;/p>\n    &lt;/div>\n&lt;/div>\n\n&lt;div class="c-input c-input--primary">\n    &lt;label class="c-input__label">Read Only&lt;/label>\n    &lt;input type="text" disabled class="c-input__field"  value="This is not editable">\n&lt;/div>\n\n&lt;div class="c-input c-input--primary c-input--has-addon">\n    &lt;label class="c-input__label">With fixed text&lt;/label>\n    &lt;div class="c-input__content">\n        &lt;input type="text" class="c-input__field" value="store-url">\n        &lt;span class="c-input__addon">.mymaterial.com&lt;/span>\n    &lt;/div>\n&lt;/div></pre>\n                </div>\n            </div>\n            \n        </div>\n        <!-- End Text Input States -->\n\n        <!-- Text Input Sizes -->\n        <div class="c-card">\n            <div class="c-card__content">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Text Input Sizes</h1>\n                    <span class="c-badge c-badge--success">Stable</span></div>\n                <div class="c-card__body">\n                    <p class="c-card__description">Text inputs come in 2 sizes: Normal and Large.</p>\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Normal</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n                    <div class="c-input c-input--primary c-input--large">\n                        <label class="c-input__label">Large</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n                    \n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\n    &lt;label class="c-input__label">Normal&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div>\n&lt;div class="c-input c-input--large">\n    &lt;label class="c-input__label">Large&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Text Input Sizes -->\n\n        <!-- Text Input Colors -->\n        <div class="c-card u-flex">\n            <div class="c-card__content u-flex-50">\n                <div class="c-card__header">\n                    <span>\n                        <h1 class="c-card__title">Text Input colors</h1>\n                        <p class="c-card__sub-title">(Light BG)</p>\n                    </span>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">Text inputs come in separate colors for light and dark backgrounds.</p>\n\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Normal/Light background</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n\n                    <div class="c-input c-input--primary c-input--large">\n                        <label class="c-input__label">Large/Light background</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n                    \n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\n    &lt;label class="c-input__label">Normal/Light background&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div>\n\n&lt;div class="c-input c-input--primary c-input--large">\n    &lt;label class="c-input__label">Normal/Light background&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div></pre>\n                </div>\n            </div>\n            <div class="c-card__content dark u-flex-50">\n                <div class="c-card__header">\n                    <span>\n                        <h1 class="c-card__title">Text Input colors</h1>\n                        <p class="c-card__sub-title">(Dark BG)</p>\n                    </span>\n                    <span class="c-badge c-badge--success">Stable</span>\n                </div>\n                <div class="c-card__body">\n                    <p class="c-card__description">All input elements have a dark background-compatible variant.</p>\n\n                    <div class="c-input c-input--secondary">\n                        <label class="c-input__label">Normal/Dark background</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n\n                    <div class="c-input c-input--secondary c-input--large">\n                        <label class="c-input__label">Large/Dark background</label>\n                        <input type="text" class="c-input__field">\n                    </div>\n                    \n                    <pre class="prettyprint">&lt;div class="c-input c-input--secondary">\n    &lt;label class="c-input__label">Normal/Dark background&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div>\n\n&lt;div class="c-input c-input--secondary c-input--large">\n    &lt;label class="c-input__label">Normal/Dark background&lt;/label>\n    &lt;input type="text" class="c-input__field">\n&lt;/div></pre>\n                </div>\n            </div>\n        </div>\n        <!-- End Text Input Colors -->\n    </div>\n</div>');
$templateCache.put('pages/components/select/select.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\n    <nav class="c-app-bar c-app-bar--teal">\n        <div class="c-app-bar__left">\n            <span class="c-app-bar__title">Inputs</span>\n        </div>\n        <div class="c-app-bar__right">\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\n        </div>\n    </nav>\n    <div class="l-page__primary">\n\n    </div>\n\n    <div class="l-page__secondary" dynamic-background-end>\n        <div class="c-card">\n            <div class="c-card__container">\n                <div class="c-card__header">\n                    <h1 class="c-card__title">Base</h1>\n                </div>\n                <div class="c-card__body">\n                    <div class="c-input c-input--primary">\n                        <label class="c-input__label">Test label</label>\n                        <div class="c-input__content">\n                            <td-select ng-model="test">\n                                <td-option value="test1">Test 1</td-option>\n                                <td-option>Value 1</td-option>\n                                <td-option>Value 2</td-option>\n                                <td-option>Value 3</td-option>\n                            </td-select>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>');}]);
angular.module('app.templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('pages/components/badge/badge.html','<div class="badge__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\r\n    <nav class="c-app-bar c-app-bar--teal">\r\n        <div class="c-app-bar__left">\r\n            <button class="c-button c-button--icon"><i class="mi">menu</i></button>\r\n            <span class="c-app-bar__title">Badge</span>\r\n        </div>\r\n        <div class="c-app-bar__right">\r\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\r\n        </div>\r\n    </nav>\r\n\r\n    <div class="l-page__primary">\r\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\r\n            <div class="c-natural-language__section">\r\n                <span class="c-natural-language__bold">Badges</span> are <code class="c-natural-language__bold">&lt;span></code> elements used to display status\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class="l-page__secondary" dynamic-background-end>\r\n        <!-- Base -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Base</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <span class="c-badge">Badge</span>\r\n\r\n                    <pre class="prettyprint">&lt;span class="c-badge">Badge&lt;/span></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Base -->\r\n\r\n        <!-- Colors -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Colors</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <table>\r\n                        <tbody>\r\n                        <tr>\r\n                            <td>Base</td>\r\n                            <td><span class="c-badge">Badge</span></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-badge--success</code></td>\r\n                            <td><span class="c-badge c-badge--success">Badge</span></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-badge--primary</code></td>\r\n                            <td><span class="c-badge c-badge--primary">Badge</span></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-badge--secondary</code></td>\r\n                            <td><span class="c-badge c-badge--secondary">Badge</span></td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n\r\n                    <pre class="prettyprint">&lt;span class="c-badge c-badge--success">Badge&lt;/span></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Colors -->\r\n    </div>\r\n</div>');
$templateCache.put('pages/components/button/button.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\r\n    <nav class="c-app-bar c-app-bar--teal">\r\n        <div class="c-app-bar__left">\r\n            <button class="c-button c-button--icon"><i class="mi">menu</i></button>\r\n            <span class="c-app-bar__title">Buttons</span>\r\n        </div>\r\n        <div class="c-app-bar__right">\r\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\r\n        </div>\r\n    </nav>\r\n    <div class="l-page__primary">\r\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\r\n            <div class="c-natural-language__section">\r\n                <span class="c-natural-language__bold">Buttons</span> are <code class="c-natural-language__bold">&lt;a&gt;</code> or <code class="c-natural-language__bold">&lt;button&gt;</code> elements used as\r\n                primary Calls to Action (CTAs)\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class="l-page__secondary" dynamic-background-end>\r\n        <!-- Base -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Base (flat)</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button">Button</button>\r\n                    <pre class="prettyprint">&lt;button class="c-button">Button&lt;/button></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Base -->\r\n\r\n        <!-- Raised -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Raised</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--raised c-button--primary">Button</button>\r\n                    <pre class="prettyprint">&lt;button class="c-button c-button--raised">Button&lt;/button></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Raised -->\r\n\r\n        <!-- FAB -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Floating Action Button (FAB)</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--fab c-button--primary"><i class="mi">add</i></button>\r\n                    <button class="c-button c-button--fab-mini c-button--primary"><i class="mi">add</i></button>\r\n                    <pre class="prettyprint">&lt;button class="c-button c-button--fab">&lt;i class="mi">add&lt;/i>&lt;/button>\r\n&lt;button class="c-button c-button--fab-mini">&lt;i class="mi">add&lt;/i>&lt;/button></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End FAB -->\r\n\r\n        <!-- Icon -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Icon</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--icon"><i class="mi">add</i></button>\r\n                    <pre class="prettyprint">&lt;button class="c-button c-button--icon">&lt;i class="mi">add&lt;/i>&lt;/button></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Icon -->\r\n\r\n        <!-- Huge -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Huge</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <button class="c-button c-button--huge c-button--primary">Button</button>\r\n                    <pre class="prettyprint">&lt;button class="c-button c-button--huge">Button&lt;/button></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Huge -->\r\n\r\n        <!-- Colors -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Colors</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <table>\r\n                        <tbody>\r\n                        <tr>\r\n                            <td>Base</td>\r\n                            <td><button class="c-button">Button</button></td>\r\n                            <td><button class="c-button c-button--raised">Button</button></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-button--primary</code></td>\r\n                            <td><button class="c-button c-button--primary">Button</button></td>\r\n                            <td><button class="c-button c-button--raised c-button--primary">Button</button></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-button--secondary</code></td>\r\n                            <td><button class="c-button c-button--secondary">Button</button></td>\r\n                            <td><button class="c-button c-button--raised c-button--secondary">Button</button></td>\r\n                        </tr>\r\n                        <tr>\r\n                            <td><code>.c-button--secondary-filled</code></td>\r\n                            <td><button class="c-button c-button--secondary-filled">Button</button></td>\r\n                            <td><button class="c-button c-button--raised c-button--secondary-filled">Button</button></td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n\r\n                    <pre class="prettyprint">&lt;button class="c-button c-button--primary">Button&lt;/button></pre>\r\n                    <p>Colors act differently depending on if they\'re on raised or flat buttons.</p>\r\n                    <p>Flat buttons <code class="u-dark-primary">class="c-button"</code> use the color as a text color </p>\r\n                    <p>Raised buttons <code class="u-dark-primary">class="c-button c-button--raised"</code> use the color as a background</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Colors -->\r\n\r\n\r\n    </div>\r\n</div>');
$templateCache.put('pages/components/card/card.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\r\n    <nav class="c-app-bar c-app-bar--teal">\r\n        <div class="c-app-bar__left">\r\n            <button class="c-button c-button--icon"><i class="mi">menu</i></button>\r\n            <span class="c-app-bar__title">Cards</span>\r\n        </div>\r\n        <div class="c-app-bar__right">\r\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\r\n        </div>\r\n    </nav>\r\n    <div class="l-page__primary">\r\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\r\n            <div class="c-natural-language__section">\r\n                <span class="c-natural-language__bold">Cards</span> are containers used to organize groups of smaller components.\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class="l-page__secondary" dynamic-background-end>\r\n        <!-- Base Card -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <span>\r\n                        <h1 class="c-card__title">Card Title</h1>\r\n                        <span class="c-card__sub-title">(Card subtitle)</span>\r\n                    </span>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">This is the card description.</p>\r\n\r\n                    <pre class="prettyprint">&lt;div class="c-card">\r\n    &lt;div class="c-card__content">\r\n        &lt;div class="c-card__header">\r\n            &lt;span>\r\n                &lt;h1 class="c-card__title">Card Title&lt;/h1>\r\n                &lt;span class="c-card__sub-title">(Card subtitle)&lt;/span>\r\n            &lt;/span>\r\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\r\n        &lt;/div>\r\n        &lt;div class="c-card__body">\r\n            &lt;p class="c-card__description">This is the card description.&lt;/p>\r\n        &lt;/div>\r\n    &lt;/div>\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Base Card -->\r\n\r\n        <!-- Card With Footer -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Card with footer</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">Card footers provide auxillary actions or content. Card footers are optional.</p>\r\n                    \r\n            <pre class="prettyprint">&lt;div class="c-card">\r\n    &lt;div class="c-card__content">\r\n        &lt;div class="c-card__header">\r\n            &lt;h1 class="c-card__title">Card with footer&lt;/h1>\r\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\r\n        &lt;/div>\r\n        &lt;div class="c-card__body">\r\n            &lt;p class="c-card__description">Card footers provide auxillary actions or content.\r\n                Card footers are optional.&lt;/p>\r\n        &lt;/div>\r\n        &lt;div class="c-card__footer">\r\n            &lt;p>Card footer&lt;/p>\r\n        &lt;/div>\r\n    &lt;/div>\r\n&lt;/div></pre>\r\n                </div>\r\n                <div class="c-card__footer">\r\n                    <p>Card footer</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Card With Footer -->\r\n\r\n        <!-- Card With Table -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Card with table</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">Tables within cards override the left and right padding of a\r\n                        card.</p>\r\n                </div>\r\n                <table class="c-table c-table--drag-handle c-table--overflow">\r\n                    <thead>\r\n                    <tr>\r\n                        <th></th>\r\n                        <th>Method name</th>\r\n                        <th>duration</th>\r\n                        <th>modifier</th>\r\n                        <th>free shipping</th>\r\n                        <th>price</th>\r\n                        <th></th>\r\n                    </tr>\r\n                    </thead>\r\n                    <tbody>\r\n                    <tr>\r\n                        <td class="c-drag-handle">\r\n                            <i class="mi">more_vert</i>\r\n                            <i class="mi">more_vert</i>\r\n                        </td>\r\n                        <td class="c-table__primary-col">Expedited</td>\r\n                        <td>2-3 Days</td>\r\n                        <td>Price</td>\r\n                        <td>No</td>\r\n                        <td>$17+</td>\r\n                        <td><i class="mi">more_vert</i></td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td class="c-drag-handle">\r\n                            <i class="mi">more_vert</i>\r\n                            <i class="mi">more_vert</i>\r\n                        </td>\r\n                        <td class="c-table__primary-col">Expedited</td>\r\n                        <td>2-3 Days</td>\r\n                        <td>Price</td>\r\n                        <td>No</td>\r\n                        <td>$17+</td>\r\n                        <td><i class="mi">more_vert</i></td>\r\n                    </tr>\r\n                    </tbody>\r\n                </table>\r\n                <div class="c-card__body">\r\n                    <pre class="prettyprint">&lt;div class="c-card">\r\n    &lt;div class="c-card__content">\r\n        &lt;div class="c-card__header">\r\n            &lt;h1 class="c-card__title">Card with table&lt;/h1>\r\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\r\n        &lt;/div>\r\n        &lt;div class="c-card__body">\r\n            &lt;p class="c-card__description">Tables within cards override the left and right padding of a\r\n                card.&lt;/p>\r\n        &lt;/div>\r\n        &lt;table class="c-table c-table--drag-handle c-table--overflow">\r\n            &lt;thead>\r\n            &lt;tr>\r\n                &lt;th>&lt;/th>\r\n                &lt;th>Method name&lt;/th>\r\n                &lt;th>duration&lt;/th>\r\n                &lt;th>modifier&lt;/th>\r\n                &lt;th>free shipping&lt;/th>\r\n                &lt;th>price&lt;/th>\r\n                &lt;th>&lt;/th>\r\n            &lt;/tr>\r\n            &lt;/thead>\r\n            &lt;tbody>\r\n            &lt;tr>\r\n                &lt;td class="c-drag-handle">\r\n                    &lt;i class="mi">more_vert&lt;/i>\r\n                    &lt;i class="mi">more_vert&lt;/i>\r\n                &lt;/td>\r\n                &lt;td class="c-table__primary-col">Expedited&lt;/td>\r\n                &lt;td>2-3 Days&lt;/td>\r\n                &lt;td>Price&lt;/td>\r\n                &lt;td>No&lt;/td>\r\n                &lt;td>$17+&lt;/td>\r\n                &lt;td>&lt;i class="mi">more_vert&lt;/i>&lt;/td>\r\n            &lt;/tr>\r\n            &lt;tr>\r\n                &lt;td class="c-drag-handle">\r\n                    &lt;i class="mi">more_vert&lt;/i>\r\n                    &lt;i class="mi">more_vert&lt;/i>\r\n                &lt;/td>\r\n                &lt;td class="c-table__primary-col">Expedited&lt;/td>\r\n                &lt;td>2-3 Days&lt;/td>\r\n                &lt;td>Price&lt;/td>\r\n                &lt;td>No&lt;/td>\r\n                &lt;td>$17+&lt;/td>\r\n                &lt;td>&lt;i class="mi">more_vert&lt;/i>&lt;/td>\r\n            &lt;/tr>\r\n            &lt;/tbody>\r\n        &lt;/table>\r\n        &lt;div class="c-card__body">\r\n\r\n        &lt;/div>\r\n    &lt;/div>\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Card With Table -->\r\n\r\n        <!-- Card With Media Content -->\r\n        <div class="c-card c-card--with-media">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Card with media content</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">The media content column can be on the right or the left of the card</p>\r\n                    \r\n                    <pre class="prettyprint">&lt;div class="c-card c-card--with-media">\r\n    &lt;div class="c-card__content">\r\n        &lt;div class="c-card__header">\r\n            &lt;h1 class="c-card__title">Card with media content&lt;/h1>\r\n            &lt;span class="c-badge c-badge--success">Stable&lt;/span>\r\n        &lt;/div>\r\n        &lt;div class="c-card__body">\r\n            &lt;p class="c-card__description">The media content column can be on the right or the left of the card&lt;/p>\r\n        &lt;/div>\r\n    &lt;/div>\r\n\r\n    &lt;div class="c-card__media c-card__media--25 empty-map">\r\n        &lt;i class="mi mi--xl u-light-primary">location_on&lt;/i>\r\n    &lt;/div>\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n\r\n            <div class="c-card__media c-card__media--30 empty-map">\r\n                <i class="mi mi--xl u-light-primary">location_on</i>\r\n            </div>\r\n        </div>\r\n        <!-- End Card With Media Content -->\r\n    </div>\r\n</div>');
$templateCache.put('pages/components/input/input.html','<div class="button__scope l-page l-page--has-app-bar l-page--teal" dynamic-background>\r\n    <nav class="c-app-bar c-app-bar--teal">\r\n        <div class="c-app-bar__left">\r\n            <button class="c-button c-button--icon"><i class="mi">menu</i></button>\r\n            <span class="c-app-bar__title">Inputs</span>\r\n        </div>\r\n        <div class="c-app-bar__right">\r\n            <button class="c-button c-button--icon"><i class="mi">more_vert</i></button>\r\n        </div>\r\n    </nav>\r\n    <div class="l-page__primary">\r\n        <div class="c-natural-language c-natural-language--light c-natural-language--sm u-center">\r\n            <div class="c-natural-language__section">\r\n                <span class="c-natural-language__bold">Inputs</span> are HTML form elements used to submit information within a form.\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class="l-page__secondary" dynamic-background-end>\r\n        <!-- Text Input States -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <span>\r\n                        <h1 class="c-card__title">Text Inputs</h1>\r\n                        <span class="c-badge c-badge--success u-margin-left-2">Stable</span>\r\n                    </span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <div class="c-input c-input--primary">\r\n                        <label class="c-input__label">Required</label>\r\n                        <input type="text" required class="c-input__field">\r\n                    </div>\r\n\r\n                    <div class="c-input c-input--primary c-input--has-messages has-error">\r\n                        <label class="c-input__label">Error</label>\r\n                        <div class="c-input__content">\r\n                            <input type="text" value="This field has an error" class="c-input__field">\r\n                        </div>\r\n                        <div class="c-input__messages">\r\n                            <p>This field has an error</p>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class="c-input c-input--primary">\r\n                        <label class="c-input__label">Read Only</label>\r\n                        <input type="text" disabled class="c-input__field" value="This is not editable">\r\n                    </div>\r\n\r\n                    <div class="c-input c-input--primary">\r\n                        <label class="c-input__label">With fixed text</label>\r\n                        <input type="text" class="c-input__field" value="store-url">\r\n                        <span class="c-input__addon c-input__addon--right">.mymaterial.com</span>\r\n                    </div>\r\n                    \r\n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\r\n    &lt;label class="c-input__label">Required&lt;/label>\r\n    &lt;input type="text" required class="c-input__field">\r\n&lt;/div>\r\n\r\n&lt;div class="c-input c-input--primary c-input--has-messages has-error">\r\n    &lt;label class="c-input__label">Error&lt;/label>\r\n    &lt;div class="c-input__content">\r\n        &lt;input type="text" value="This field has an error" class="c-input__field">\r\n    &lt;/div>\r\n    &lt;div class="c-input__messages">\r\n        &lt;p>This field has an error&lt;/p>\r\n    &lt;/div>\r\n&lt;/div>\r\n\r\n&lt;div class="c-input c-input--primary">\r\n    &lt;label class="c-input__label">Read Only&lt;/label>\r\n    &lt;input type="text" disabled class="c-input__field"  value="This is not editable">\r\n&lt;/div>\r\n\r\n&lt;div class="c-input c-input--primary">\r\n    &lt;label class="c-input__label">With fixed text&lt;/label>\r\n    &lt;input type="text" class="c-input__field" value="store-url">\r\n    &lt;span class="c-input__addon c-input__addon--right">.mymaterial.com&lt;/span>\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n            \r\n        </div>\r\n        <!-- End Text Input States -->\r\n\r\n        <!-- Text Input Sizes -->\r\n        <div class="c-card">\r\n            <div class="c-card__content">\r\n                <div class="c-card__header">\r\n                    <h1 class="c-card__title">Text Input Sizes</h1>\r\n                    <span class="c-badge c-badge--success">Stable</span></div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">Text inputs come in 2 sizes: Normal and Large.</p>\r\n                    <div class="c-input c-input--primary">\r\n                        <label class="c-input__label">Normal</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n                    <div class="c-input c-input--primary c-input--large">\r\n                        <label class="c-input__label">Large</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n                    \r\n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\r\n    &lt;label class="c-input__label">Normal&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div>\r\n&lt;div class="c-input c-input--large">\r\n    &lt;label class="c-input__label">Large&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Text Input Sizes -->\r\n\r\n        <!-- Text Input Colors -->\r\n        <div class="c-card u-flex">\r\n            <div class="c-card__content u-flex-50">\r\n                <div class="c-card__header">\r\n                    <span>\r\n                        <h1 class="c-card__title">Text Input colors</h1>\r\n                        <p class="c-card__sub-title">(Light BG)</p>\r\n                    </span>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">Text inputs come in separate colors for light and dark backgrounds.</p>\r\n\r\n                    <div class="c-input c-input--primary">\r\n                        <label class="c-input__label">Normal/Light background</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n\r\n                    <div class="c-input c-input--primary c-input--large">\r\n                        <label class="c-input__label">Large/Light background</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n                    \r\n                    <pre class="prettyprint">&lt;div class="c-input c-input--primary">\r\n    &lt;label class="c-input__label">Normal/Light background&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div>\r\n\r\n&lt;div class="c-input c-input--primary c-input--large">\r\n    &lt;label class="c-input__label">Normal/Light background&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n            <div class="c-card__content dark u-flex-50">\r\n                <div class="c-card__header">\r\n                    <span>\r\n                        <h1 class="c-card__title">Text Input colors</h1>\r\n                        <p class="c-card__sub-title">(Dark BG)</p>\r\n                    </span>\r\n                    <span class="c-badge c-badge--success">Stable</span>\r\n                </div>\r\n                <div class="c-card__body">\r\n                    <p class="c-card__description">All input elements have a dark background-compatible variant.</p>\r\n\r\n                    <div class="c-input c-input--secondary">\r\n                        <label class="c-input__label">Normal/Dark background</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n\r\n                    <div class="c-input c-input--secondary c-input--large">\r\n                        <label class="c-input__label">Large/Dark background</label>\r\n                        <input type="text" class="c-input__field">\r\n                    </div>\r\n                    \r\n                    <pre class="prettyprint">&lt;div class="c-input c-input--secondary">\r\n    &lt;label class="c-input__label">Normal/Dark background&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div>\r\n\r\n&lt;div class="c-input c-input--secondary c-input--large">\r\n    &lt;label class="c-input__label">Normal/Dark background&lt;/label>\r\n    &lt;input type="text" class="c-input__field">\r\n&lt;/div></pre>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!-- End Text Input Colors -->\r\n    </div>\r\n</div>');}]);
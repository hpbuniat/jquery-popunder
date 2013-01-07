/*!
 * jquery-compat
 *
 * A fallback for jquery-popunder, if no jquery is available.
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012-2013 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://opensource.org/licenses/BSD-3-Clause
 */

/*global window, document, navigator */
(function(window, document, navigator) {
    "use strict";

    // when there is no jQuery available, we'll create a fallback-object with
    if (typeof window.jQuery === "undefined") {
        var ua = navigator.userAgent.toLowerCase(),
            jQuery = function(param) {
                return new jQuery.fn.init(param);
            };

        jQuery.fn = jQuery.prototype = {
            constructor: jQuery,
            init: function(param) {
                var qsa = (document.querySelectorAll);

                if (param.nodeType) {
                    this.elem = [ param ];
                }
                else if (typeof param === "function") {
                    param();
                }
                else if (typeof param === "string") {

                    this.elem = qsa ? document.querySelectorAll(param) : document.getElementById(param.substr(1));
                    if (!qsa) {
                        this.elem = [this.elem];
                    }
                }

                return this;
            },

            elem: null
        };

        // stripped & simplified version of jQuery.extend
        jQuery.extend = jQuery.fn.extend = function() {
            var options, name, src, copy,
                target = this,
                i = 0,
                length = arguments.length;

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[ i ]) != null) {
                    // Extend the base object
                    for (name in options) {
                        if (options.hasOwnProperty(name)) {
                            src = target[ name ];
                            copy = options[ name ];

                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if (copy !== undefined) {
                                target[ name ] = copy;
                            }
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        };

        jQuery.fn.extend({
            on: function(events, callback) {
                var i, ii, l, ll, e, ee;
                if (!this.elem) {
                    return this;
                }

                events = events.split(" ");
                for (i = 0, l = events.length; i < l; i++) {
                    e = events[i];
                    for (ii = 0, ll = this.elem.length; ii < ll; ii++) {
                        ee = this.elem[ii];
                        if (document.attachEvent) {
                            ee.attachEvent('on' + e, callback);
                        }
                        else if (document.addEventListener) {
                            ee.addEventListener(e, callback, false);
                        }
                    }
                }

                return this;
            },
            attr: function(key, value) {
                if (this.elem && this.elem.length) {
                    if (value) {
                        this.elem[0].setAttribute(key, value);
                    }
                    else {
                        return this.elem[0].getAttribute(key);
                    }
                }

                return this;
            },
            each: function(callback) {
                var i, l;
                for (i = 0, l = this.elem.length; i < l; i++) {
                    callback(i, this.elem[i]);
                }

                return this;
            },
            data: function(key) {
                return this.attr('data-' + key);
            }

        });

        jQuery.browser = {
            webkit:(!!(/webkit/).exec(ua) || false),
            opera:(!!(/opera/).exec(ua) || false),
            msie:(!!(/msie/).exec(ua) || false)
        };

        // Give the init function the jQuery prototype for later instantiation
        jQuery.fn.init.prototype = jQuery.fn;

        window.jQuery = window.$ = jQuery;
    }

})(window, document, navigator);

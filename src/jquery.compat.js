/*!
 * jquery-compat
 *
 * A fallback for jquery-popunder, if no jquery is available.
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012-2013 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://opensource.org/licenses/BSD-3-Clause
 */

/*global window, document */
(function(window, document) {
    "use strict";

    // when there is no jQuery available, we'll create a fallback-object with
    if (typeof window.jQuery === "undefined") {
        var jQuery = function(param) {
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

                    this.elem = qsa ? qsa(param) : document.getElementById(param.substr(1));
                    if (!qsa) {
                        this.elem = [this.elem];
                    }
                }

                return this;
            },

            elem: null
        };

        // jQuery.extend
        jQuery.extend = jQuery.fn.extend = function() {
            var src, copyIsArray, copy, name, options, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            if ( length === i ) {
                target = this;
                --i;
            }

            for ( ; i < length; i++ ) {
                // Only deal with non-null/undefined values
                if ( (options = arguments[ i ]) != null ) {
                    // Extend the base object
                    for ( name in options ) {
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : [];

                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = jQuery.extend( deep, clone, copy );

                            // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
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

        // Give the init function the jQuery prototype for later instantiation
        jQuery.fn.init.prototype = jQuery.fn;

        window.jQuery = window.$ = jQuery;
    }

})(window, document);

/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012-2019 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license https://opensource.org/licenses/BSD-3-Clause
 */

/*global jQuery, window, screen, navigator, top, document, Cookies */
;(function ($, window, screen, navigator, document) {

    "use strict";

    /**
     * Create a popunder
     *
     * @param  {Array|function} popunderStack The popunder(s) to open
     * @param  {string|object} form A form, where the submit is used to open the popunder
     * @param  {string|object} trigger A button, where the click is used to open the popunder
     * @param  {jQuery.Event} event The source of the event
     *
     * @return jQuery
     */
    $.popunder = function (popunderStack, form, trigger, event) {
        var t = $.popunder.helper;

        t.init();
        if (typeof Cookies !== t.u) {
            t.c = Cookies.noConflict();
        }

        if (arguments.length === 0) {
            popunderStack = window.aPopunder;
        } else if (typeof popunderStack !== t.fu && $(popunderStack).is('a')) {
            event = $.Event('click', {
                'target': popunderStack
            });
            popunderStack = window.aPopunder;
        }

        if (trigger || form) {
            t.bindEvents(popunderStack, form, trigger);
        } else {
            popunderStack = (typeof popunderStack === t.fu) ? popunderStack(event) : popunderStack;

            t.reset();
            if (typeof popunderStack !== t.u) {
                do {
                    t.queue(popunderStack, event);
                    t.first = false;
                }
                while (popunderStack.length > 0);
            }
        }

        return $;
    };

    /* several helper functions */
    $.popunder.helper = {

        /**
         * Method names
         *
         * @const string
         */
        TIMEOUT: 'timeout',
        SWITCHER: 'switcher',
        SIMPLE: 'simple',

        /**
         * Reference to the window
         *
         * @var window
         */
        _top: window.self,

        /**
         * Reference to the last popup-window
         *
         * @var object
         */
        lastWin: null,

        /**
         * Reference to the last url
         *
         * @var string
         */
        lastTarget: null,

        /**
         * Was the last popunder was processed
         *
         * @var boolean
         */
        last: false,

        /**
         * Is this the first popunder?
         *
         * @var boolean
         */
        first: true,

        /**
         * About:blank
         *
         * @var string
         */
        b: 'about:blank',

        /**
         * undefined
         *
         * @var string
         */
        u: 'undefined',

        /**
         * function
         *
         * @var string
         */
        fu: 'function',

        /**
         * The last opened window-url (before calling href)
         *
         * @var string
         */
        o: null,

        /**
         * The cookie handler
         *
         * @var Cookies
         */
        c: null,

        /**
         * Dummy placeholder - prevent opening a popup but do the magic
         *
         * @var string
         */
        du: '__jqpu',

        /**
         * User-Agent-Handling
         *
         * @var object
         */
        ua: {
            ie: (/msie|trident/i.test(navigator.userAgent)),
            oldIE: (/msie/i.test(navigator.userAgent)),
            edge: (/edge/i.test(navigator.userAgent)),
            ff: (/firefox/i.test(navigator.userAgent)),
            o: (/opera/i.test(navigator.userAgent)),
            g: (/chrome/i.test(navigator.userAgent)),
            w: (/webkit/i.test(navigator.userAgent)),
            linux: (/linux/i.test(navigator.userAgent)),
            touch: ("ontouchstart" in document["documentElement"]) || (/bada|blackberry|iemobile|android|iphone|ipod|ipad/i.test(navigator.userAgent))
        },
        m: false,

        /**
         * The event-namespace
         *
         * @var String
         */
        ns: 'jqpu',

        /**
         * The default-options
         *
         * @var object
         */
        def: {

            // properties of the opened window
            window: {
                'toolbar': 0,
                'scrollbars': 1,
                'location': 1,
                'statusbar': 1,
                'menubar': 0,
                'resizable': 1,
                'width': (screen.availWidth - 122).toString(),
                'height': (screen.availHeight - 122).toString(),
                'screenX': 0,
                'screenY': 0,
                'left': 0,
                'top': 0
            },

            // name of the popunder-cookie (defaults to a random-string, when not set)
            name: '__pu',

            // name of the cookie
            cookie: '__puc',

            // the block-time of a popunder in minutes
            blocktime: false,

            // user-agents to skip
            skip: {
                // there needs to be a matching ua-lookup here
                // 'linux': true
            },

            // callback function, to be executed when a popunder is opened
            cb: null,

            // set to true, if the url should be opened in a popup instead of a popunder
            popup: false
        },

        /**
         * Test a stack of ua's
         *
         * @param  {object} uaStack Stack of ua's
         * @param  {object} ua UA-matching-stack
         *
         * @return boolean Returns true, if current ua is part of the stack
         */
        testStack: function (uaStack, ua) {
            var i, r = false;
            for (i in uaStack) {
                if (uaStack.hasOwnProperty(i)) {
                    if (!!uaStack[i] && !!ua[i]) {
                        r = uaStack[i];
                    }
                }
            }

            return r;
        },

        /**
         * Set the popunder-method by parsing the agent, init hive
         *
         * @return $.popunder.helper
         */
        init: function () {
            var t = this;

            if (!t.m) {
                // defaults for the popunder-method, the last match is used
                t.m = t.testStack({
                    ff: t.SWITCHER,
                    ie: t.SWITCHER,
                    edge: t.SWITCHER,
                    w: t.SWITCHER,
                    g: t.SWITCHER,
                    o: t.SWITCHER,
                    linux: t.SWITCHER,
                    touch: t.SWITCHER
                }, t.ua);
            }

            return t;
        },

        /**
         * Process the queue
         *
         * @param  {Array} popunderStack The popunder(s) to open
         * @param  {jQuery.Event} eventSource The source of the event
         *
         * @return $.popunder.helper
         */
        queue: function (popunderStack, eventSource) {
            var b = false,
                t = this;

            if (popunderStack.length > 0) {
                while (b === false) {
                    var p = popunderStack.shift();
                    b = (p) ? t.open(p[0], p[1] || {}, popunderStack.length, eventSource) : true;
                }
            }

            if (popunderStack.length === 0) {
                t.bg();
                if (t.m !== t.TIMEOUT) {
                    t.href(true, t);
                }
            }

            return t;
        },

        /**
         * Create a popunder
         *
         * @param  {Array} popunderStack The popunder(s) to open
         * @param  {string|jQuery} form A form, where the submit is used to open the popunder
         * @param  {string|jQuery} trigger A button, where the mousedown & click is used to open the popunder
         *
         * @return $.popunder.helper
         */
        bindEvents: function (popunderStack, form, trigger) {
            var t = this,
                s = 'string',
                c = function (event) {
                    $.popunder(event.data.stack, false, false, event);
                    return true;
                };

            if (form && t.m !== t.SWITCHER) {
                form = (typeof form === s) ? $(form) : form;
                form.on('submit.' + t.ns, {
                    stack: popunderStack
                }, c);
            }

            if (trigger) {
                trigger = (typeof trigger === s) ? $(trigger) : trigger;
                trigger.on('click.' + t.ns, {
                    stack: popunderStack
                }, c);
            }

            return t;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} url The url to open
         * @param  {Object} o The options
         *
         * @return boolean
         */
        cookieCheck: function (url, o) {
            var t = this,
                name = t.rand(o.cookie, false),
                cookie = t.c.get(name),
                ret = false;

            if (!cookie) {
                cookie = url;
            } else if (cookie.indexOf(url) === -1) {
                cookie += url;
            } else {
                ret = true;
            }

            t.c.set(name, cookie, {
                expires: new Date((new Date()).getTime() + o.blocktime * 60000)
            });

            return ret;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string|boolean} name
         * @param  {boolean} rand
         *
         * @return string
         */
        rand: function (name, rand) {
            var t = this,
                p = (!!name) ? name : t.du;
            return p + (rand === false ? '' : Math.floor(89999999 * Math.random() + 10000000).toString()).replace('.', '');
        },

        /**
         * Open the popunder
         *
         * @param  {string} url The URL to open
         * @param  {object} opts Options for the Popunder
         * @param  {int} stackLength Length of the popunder-stack
         * @param  {jQuery.Event} event The source of the event
         *
         * @return boolean
         */
        open: function (url, opts, stackLength, event) {
            var t = this,
                i, o = $.extend(true, {}, t.def, opts);

            t.o = url;
            if (top !== window.self) {
                try {
                    if (top.document.location.toString()) {
                        t._top = top;
                    }
                } catch (err) {
                }
            }

            // test if current user-agent forces skipping
            if (t.testStack(o.skip, t.ua)) {
                return false;
            }

            // test if cookie-blocktime is active
            if (o.blocktime && (typeof t.c === t.fu) && t.cookieCheck(url, o)) {
                return false;
            }

            if (url !== t.du) {
                t.lastTarget = url;

                if (t.first === true && t.m === t.SWITCHER) {
                    if (event && typeof event.target !== t.u) {
                        i = t.getElementUrl(event, undefined);
                        event.preventDefault();
                    }

                    t.switcher.switchWindow(i, t.o, t.rand(o.name, !opts.name));
                } else if (t.first === true || true === t.isMultiple()) {
                    if (t.m === t.TIMEOUT) {
                        window.setTimeout(function (helper) {
                            return function () {
                                try {
                                    helper.lastWin = (window.open(helper.o, helper.rand(o.name, !opts.name), helper.getOptions(o.window)) || helper.lastWin);
                                    helper.href(stackLength, helper);
                                    if (typeof o.cb === helper.fu) {
                                        o.cb(helper.lastWin);
                                    }
                                } catch (err) {
                                }
                            };
                        }($.extend(true, {}, t)), 0);
                    } else {
                        t.lastWin = (t._top.window.open(t.o, t.rand(o.name, !opts.name), t.getOptions(o.window)) || t.lastWin);
                    }
                }

                if (t.m !== t.TIMEOUT) {
                    t.href(stackLength, t);
                    if (typeof o.cb === t.fu) {
                        o.cb(t.lastWin);
                    }
                }
            }

            return true;
        },

        /**
         * Move a popup to the background
         *
         * @return $.popunder.helper
         */
        bg: function () {
            var t = this;
            if (t.TIMEOUT === t.m || t.lastTarget) {
                if (t.m === t.SIMPLE) {
                    t.switcher.simple(t);
                    window.setTimeout(function () {
                        t.switcher.simple(t);
                    }, 500);
                } else if (t.m === t.TIMEOUT) {
                    t.switcher.timeout();
                }
            }

            return t;
        },

        /**
         * Handle the window switching
         *
         * @return void
         */
        switcher: {

            /**
             * Classic popunder, used for ie
             *
             * @param  {$.popunder.helper} t
             *
             * @return void
             */
            simple: function (t) {
                if (t.ua.oldIE) {
                    t.lastWin["blur"]();
                    t.lastWin["opener"]["window"]["focus"]();
                    window["self"]["window"]["focus"]();
                    window["focus"]();
                } else {
                    document["focus"]();
                }
            },

            /**
             * Popunder for firefox & old google-chrome
             * In ff4+, chrome21-23 we need to trigger a window.open loose the focus on the popup. Afterwards we can re-focus the parent-window
             *
             * @return void
             */
            timeout: function () {
                window.setTimeout(function () {
                    var n = window.open('', '_self');
                    n && !n.closed && n.focus();
                }, 0);
            },

            /**
             * Set the handle tab-switch url
             *
             * @param  {String} payloadUrl
             * @param  {String} popunderUrl
             * @param  {String} windowName
             *
             * @return void
             */
            switchWindow: function (payloadUrl, popunderUrl, windowName) {
                window["open"](payloadUrl, windowName);
                window["location"]["assign"](popunderUrl);
            }
        },

        /**
         * Check if we're able to open multiple pu
         *
         * @return boolean
         */
        isMultiple: function () {
            var t = this;
            return (t.m === t.TIMEOUT || t.m === t.SIMPLE);
        },

        /**
         * Set the popunder's url
         *
         * @param  {int|boolean} stackLength True, if the url should be set
         * @param  {$.popunder.helper} t
         *
         * @return $.popunder.helper
         */
        href: function (stackLength, t) {
            if (stackLength && t.lastTarget && t.lastWin && t.lastTarget !== t.b && t.lastTarget !== t.o) {
                t.lastWin.document.location.href = t.lastTarget;
            }

            return t;
        },

        /**
         * Get the url of a form-element including the payload
         *
         * @param  {jQuery.Event} event
         * @param  {boolean} returnEvenIfNotBlank
         *
         * @return String
         */
        getElementUrl: function (event, returnEvenIfNotBlank) {
            var t = this,
                sel = ':submit, button',
                $target = $(event.target),
                $f, s, m,
                notBlank = (typeof returnEvenIfNotBlank === t.u);

            if ($target.is('a') && notBlank) {
                $f = $target;
                s = $target.attr('href');
            } else if ($target.is(sel) !== true) {
                $target = $target.parents(sel);
                $f = $target.parents('form');
            } else {
                $f = $(event.target.form);
                if ($target.is(sel) && (!$f || !$f.length)) {
                    $f = $target.parents('form');
                }
            }

            if (!s && $target.length !== 0 && $f.length !== 0) {
                m = ($f.prop('method') + ''); // cast to string
                if (m.toLowerCase() === 'get' && ($f.attr('target') === '_blank' || notBlank)) {
                    s = $f.attr('action') + '/?' + $f.serialize();
                }
            }

            return s;
        },

        /**
         * Reset the instance
         *
         * @return $.popunder.helper
         */
        reset: function () {
            var t = this;
            t.last = false;
            t.first = true;
            t.lastTarget = t.lastWin = null;
            return t;
        },

        /**
         * Unbind a popunder-handler
         *
         * @return $.popunder.helper
         */
        unbind: function (form, trigger) {
            var t = this,
                s = 'string';

            t.reset();
            if (!!form) {
                form = (typeof form === s) ? $(form) : form;
                form.off('submit.' + t.ns);
            }

            if (!!trigger) {
                trigger = (typeof trigger === s) ? $(trigger) : trigger;
                trigger.off('click.' + t.ns).next('.jq-pu object').remove();
                trigger.unwrap();
            }

            window.aPopunder = [];
            return t;
        },

        /**
         * Get the option-string for the popup
         *
         * @return {String}
         */
        getOptions: function (options) {
            var a = [], i;
            for (i in options) {
                if (options.hasOwnProperty(i)) {
                    a.push(i + '=' + options[i]);
                }
            }

            return a.join(',');
        }
    };

})(jQuery, window, screen, navigator, document);

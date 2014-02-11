/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012-2014 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://opensource.org/licenses/BSD-3-Clause
 */

/*global jQuery, window, screen, navigator, opener, top, document */
(function($, window, screen, navigator, document) {
    "use strict";

    /**
     * Create a popunder
     *
     * @param  {Array|function} aPopunder The popunder(s) to open
     * @param  {string|object} form A form, where the submit is used to open the popunder
     * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
     * @param  {object} _source The source of the event
     *
     * @return jQuery
     */
    $.popunder = function(aPopunder, form, trigger, _source) {
        var t = $.popunder.helper;
        if (arguments.length === 0) {
            aPopunder = window.aPopunder;
        }

        if (trigger || form) {
            t.bindEvents(aPopunder, form, trigger);
        }
        else {
            aPopunder = (typeof aPopunder === 'function') ? aPopunder(_source) : aPopunder;
            if (t.ua.ie === true || t.ua.g === true) {
                aPopunder = t.handleTargetBlank(aPopunder, _source);
            }

            t.reset();
            if (typeof aPopunder !== "undefined") {
                do {
                    t.queue(aPopunder);
                }
                while (aPopunder.length > 0);
                if (!t.ua.g || !t.m.g === 'simple') {
                    t.queue(aPopunder);
                }
            }
        }

        return $;
    };

    /* several helper functions */
    $.popunder.helper = {

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
         * The flip-popup
         *
         * @var window|boolean
         */
        f: false,

        /**
         * Was the last popunder was processed
         *
         * @var boolean
         */
        last: false,

        /**
         * About:blank
         *
         * @var string
         */
        b: 'about:blank',

        /**
         * The last opened window-url (before calling href)
         *
         * @var string
         */
        o: null,

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
            ie: !!((/msie/i.test(navigator.userAgent)) || (/trident/i.test(navigator.userAgent))),//IE 11 user agent doen't have msie in it
            ff: !!(/firefox/i.test(navigator.userAgent)),
            o: !!(/opera/i.test(navigator.userAgent)),
            g: !!(/chrome/i.test(navigator.userAgent)),
            w: !!(/webkit/i.test(navigator.userAgent))
        },
        m: {
            g: 'tab'
        },

        /**
         * The default-options
         *
         * @var object
         */
        def: {

            // properites of the opened window
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
                'opera': true,
                'ipad': true
            },

            // callback function, to be executed when a popunder is opened
            cb: null,

            // set to true, if the url should be opened in a popup instead of a popunder
            popup: false
        },

        /**
         * The options for a specific popunder
         *
         * @var object
         */
        opt: {},

        /**
         * Simple user-agent test
         *
         * @param  {string} ua The user-agent pattern
         *
         * @return {Boolean}
         */
        uaTest: function(ua) {
            return !!(new RegExp(ua, "i").test(navigator.userAgent.toString()));
        },

        /**
         * Process the queue
         *
         * @param  {Array} aPopunder The popunder(s) to open
         *
         * @return $.popunder.helper
         */
        queue: function(aPopunder) {
            var b = false,
                t = this;

            if (aPopunder.length > 0) {
                while (b === false) {
                    var p = aPopunder.shift();
                    b = (p) ? t.open(p[0], p[1] || {}, aPopunder.length) : true;
                }
            }
            else if (t.last === false) {
                t.last = true;
                t.bg().href(true);
            }
            else if (!t.f && !t.ua.g) {
                t.bg();
            }

            return t;
        },

        /**
         * Create a popunder
         *
         * @param  {Array} aPopunder The popunder(s) to open
         * @param  {string|object} form A form, where the submit is used to open the popunder
         * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
         *
         * @return $.popunder.helper
         */
        bindEvents: function(aPopunder, form, trigger) {
            var t = this,
                s = 'string',
                a = function(event) {
                    $.popunder(aPopunder, false, false, event);
                    return true;
                };

            if (form && !t.ua.g) {
                form = (typeof form === s) ? $(form) : form;
                form.on('submit', a);
            }

            if (trigger) {
                trigger = (typeof trigger === s) ? $(trigger) : trigger;
                if (t.ua.g && t.m.g === 'simple') {
                    t.iframe(trigger, a);
                }
                else {
                    trigger.on('click', a);
                }
            }

            return t;
        },

        /**
         * Create an iframe to catch the click over a button or link
         *
         * @param  {object} trigger The click-trigger (button, link, etc.)
         * @param  {function} handler The event-handler
         *
         * @return $.popunder.helper
         */
        iframe: function(trigger, handler) {
            trigger.each(function() {
                var $e = $(this),
                    a = 'absolute',
                    p = ($e.css('position') === a) ? '' : 'position:relative;',

                    // build a container around the button/link - this is tricky, when it comes to the elements position
                    c = $e.wrap('<div class="jq-pu" style="display:inline-block; ' + p + '" />').parent(),
                    d = {
                        margin: 0,
                        padding: 0,
                        cursor: "pointer",
                        width: $e.outerWidth(),
                        height: $e.outerHeight()
                    },
                    i = $('<iframe scrolling="no" frameborder="0" src="about:blank"></iframe>').css($.extend(true, {}, d, {
                        position: a,
                        top: ((!!p) ? 0 : $e.css('top')),
                        left: ((!!p) ? 0 : $e.css('left')),
                        padding: $e.css('padding'),
                        margin: $e.css('margin'),
                        width: $e.width(),
                        height: $e.height()
                    }));

                i.on('load', function() {
                    $(this.contentDocument).on('mousedown mouseup', (function(target) {
                        return function(event) {
                            handler({
                                target: target,
                                type: event.type
                            });
                            if (event.type !== 'mouseup') {
                                target.trigger(event.type);
                            }
                        };
                    })($e)).find('html, body').css(d);
                });
                c.append(i);
            });

            return this;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} sUrl The url to open
         *
         * @return boolean
         */
        cookieCheck: function(sUrl) {
            var t = this,
                name = t.rand(t.opt.cookie, false),
                cookie = $.cookie(name),
                ret = false;

            if (!cookie) {
                cookie = sUrl;
            }
            else if (cookie.indexOf(sUrl) === -1) {
                cookie += sUrl;
            }
            else {
                ret = true;
            }

            $.cookie(name, cookie, {
                expires: new Date((new Date()).getTime() + t.opt.blocktime * 60000)
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
        rand: function(name, rand) {
            var p = (!!name) ? name : 'pu';
            return p + (rand === false ? '' : Math.floor(89999999 * Math.random() + 10000000));
        },

        /**
         * Open the popunder
         *
         * @param  {string} sUrl The URL to open
         * @param  {object} opts Options for the Popunder
         * @param  {int} iLength Length of the popunder-stack
         *
         * @return boolean
         */
        open: function(sUrl, opts, iLength) {
            var t = this,
                i, o, s,
                f = 'function';

            o = $.extend(true, {}, t.def, opts);
            s = o.skip;

            t.o = sUrl;
            if (top !== window.self) {
                try {
                    if (top.document.location.toString()) {
                        t._top = top;
                    }
                } catch (err) {}
            }

            for (i in s) {
                if (s.hasOwnProperty(i)) {
                    if (s[i] === true && t.uaTest(i)) {
                        return false;
                    }
                }
            }

            if (o.blocktime && (typeof $.cookie === f) && t.cookieCheck(sUrl)) {
                return false;
            }

            /* create pop-up */
            if (t.ua.g === true && t.ua.g !== 'simple') {
                window.open("javascript:window.focus()", "_self", "");
            }

            if (sUrl !== t.du) {
                t.lastTarget = sUrl;
                if (t.ua.g === true && t.m.g === 'flicker') {
                    document.documentElement.webkitRequestFullscreen();
                }

                if (t.ua.g === true && t.m.g === 'tab') {
                    t.switcher.tab(t, t.o);
                }
                else {
                    t.lastWin = (t._top.window.open(t.o, t.rand(o.name, !opts.name), t.getOptions(o.window)) || t.lastWin);
                }

                if (t.ua.ff === true || t.m.g === 'simple') {
                    t.bg();
                }

                t.href(iLength);
                if (typeof o.cb === f) {
                    o.cb();
                }
            }

            return true;
        },

        /**
         * Move a popup to the background
         *
         * @param  {int|boolean} l True, if the url should be set
         *
         * @return $.popunder.helper
         */
        bg: function(l) {
            var t = this;
            if (t.lastWin && t.lastTarget && !l) {
                if (t.ua.ie === true) {
                    t.switcher.simple(t);
                }
                else if (t.ua.g === true && t.m.g === 'flicker') {
                    t.switcher.flicker(t);
                }
                else if (!t.ua.g) {
                    t.switcher.pop(t);
                }
            }
            else if (t.m.g === 'simple' && t.ua.g === true) {
                t.switcher.simple(t);
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
             */
            simple: function(t) {
                if (t.last === true) {
                    try {
                        window.name = (t.du + Math.random() + "").replace(".", "");
                        window.open('', window.name);
                    }
                    catch (err) {}
                }
                else {
                    try {
                        t.lastWin.blur();
                    }
                    catch (err) {}
                    window.focus();
                }
            },

            /**
             * Popunder for firefox & old google-chrome
             * In ff4+, chrome21-23 we need to trigger a window.open loose the focus on the popup. Afterwards we can re-focus the parent-window
             *
             * @param  {$.popunder.helper} t
             */
            pop: function(t) {
                (function(e) {
                    try {
                        t.f = e.window.open('about:blank');
                        if (!!t.f) {
                            t.f.close();
                        }
                    }
                    catch (err) {}

                    try {
                        e.opener.window.focus();
                    }
                    catch (err) {}
                })(t.lastWin);
            },

            /**
             * Popunder for google-chrome 25+
             *
             * @param  {$.popunder.helper} t
             * @param  {String} h
             *
             * @return $.popunder.helper
             */
            tab: function(t, h) {
                var u = (!h) ? 'data:text/html,<script>window.close();</script>;' : h,
                    p = !h,
                    a = $('<a/>', {
                        'href': u
                    }).appendTo(document.body),
                    e = document.createEvent("MouseEvents");

                p = (t.m.g === 'tab') ? !p : p;
                e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, p, false, !p, p, 0, null);
                a[0].dispatchEvent(e);
                a[0].parentNode.removeChild(a[0]);

                return t;
            },

            /**
             * Popunder for google-chrome 30
             *
             * @param  {$.popunder.helper} t
             *
             * @return $.popunder.helper
             */
            flicker: function(t) {
                document.webkitCancelFullScreen();
                setTimeout(function() {
                    window.getSelection().empty();
                }, 250);

                return t;
            }
        },

        /**
         * Set the popunders url
         *
         * @param  {int|boolean} l True, if the url should be set
         *
         * @return $.popunder.helper
         */
        href: function(l) {
            var t = this;
            if (l && t.lastTarget && t.lastWin && t.lastTarget !== t.b && t.lastTarget !== t.o) {
                if (t.ua.g === true && t.m.g !== 'simple') {
                    var d = t.lastWin.document;
                    d.open();
                    d.write('<html><head><title>' + document.title + '</title><script type="text/javascript">window.location="' + t.lastTarget + '";<\/script></head><body></body></html>');
                    d.close();
                }
                else {
                    t.lastWin.document.location.href = t.lastTarget;
                }
            }

            return t;
        },

        /**
         * Handle forms with target="_blank"
         *
         * @param aPopunder
         * @param source
         *
         * @return array
         */
        handleTargetBlank: function(aPopunder, source) {
            if (source && typeof source.target !== 'undefined') {
                var t = this,
                    form = null,
                    $target = $(source.target),
                    s;

                if ($target.is('input[type="submit"]') === true) {
                    form = source.target.form;
                }

                if (form && form.target === '_blank') {
                    s = t.du;
                    if (t.ua.ie) {
                        s = form.action + '/?' + $(form).serialize();
                    }

                    aPopunder.unshift([s, {
                        popup: true
                    }]);
                }
            }

            return aPopunder;
        },

        /**
         * Reset the instance
         *
         * @returns $.popunder.helper
         */
        reset: function() {
            var t = this;
            t.f = t.last = false;
            t.lastTarget = t.lastWin = null;
            return t;
        },

        /**
         * Get the option-string for the popup
         *
         * @return {String}
         */
        getOptions: function(opts) {
            var a = [], i;
            for (i in opts) {
                if (opts.hasOwnProperty(i)) {
                    a.push(i + '=' + opts[i]);
                }
            }

            return a.join(',');
        }
    };
})(jQuery, window, screen, navigator, document);

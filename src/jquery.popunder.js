/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012-2013 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://opensource.org/licenses/BSD-3-Clause
 */

/*global jQuery, window, screen, navigator, opener, top */
(function($, window, screen, navigator) {
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
        var h = $.popunder.helper;
        if (arguments.length === 0) {
            aPopunder = window.aPopunder;
        }

        if (trigger || form) {
            h.bindEvents(aPopunder, form, trigger);
        }
        else {
            aPopunder = (typeof aPopunder === 'function') ? aPopunder(_source) : aPopunder;
            if (typeof aPopunder !== "undefined") {
                h.c = 0;
                h.queue(aPopunder);//.queue(aPopunder);
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
         * @var boolean
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
         * The counter of opened popunder
         *
         * @var int
         */
        c: 0,

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
         * User-Agent-Handling
         *
         * @var object
         */
        ua: {
            ie: !!(/msie/i.test(navigator.userAgent)),
            o: !!(/opera/i.test(navigator.userAgent)),
            w: !!(/webkit/i.test(navigator.userAgent))
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
                h = this;

            if (aPopunder.length) {
                while (b === false) {
                    var p = aPopunder.shift();
                    b = (p) ? h.open(p[0], p[1] || {}, aPopunder.length) : true;
                }
            }
            else if (h.last === false && (!h.ua.w || h.c === 0)) {
                h.last = true;
                h.bg().href(true);
            }
            else if (!h.f) {
                h.bg();
            }

            return this;
        },

        /**
         * Create a popunder
         *
         * @param  {Array} aPopunder The popunder(s) to open
         * @param  {string|object} form A form, where the submit is used to open the popunder
         * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
         *
         * @return void
         */
        bindEvents: function(aPopunder, form, trigger) {
            var a = function(event) {
                var r = true;
                if (/mouse/.test(event.type)) {
                    event.stopPropagation();
                    event.preventDefault();
                    r = false;
                }

                $.popunder(aPopunder, false, false, event);
                return r;
            };

            if (form) {
                form = (typeof form === 'string') ? $(form) : form;
                form.on('submit', a);
            }

            if (trigger) {
                trigger = (typeof trigger === 'string') ? $(trigger) : trigger;
                trigger.on((this.ua.w === true) ? 'mousedown click' : 'click', a);
            }
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} sUrl The url to open
         * @param  {object} options Options for the Popunder
         *
         * @return boolean
         */
        cookieCheck: function(sUrl, options) {
            var name = this.rand(options.cookie, false),
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
                expires: new Date((new Date()).getTime() + options.blocktime * 3600000)
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
         * @param  {object} options Options for the Popunder
         * @param  {int} iLength Length of the popunder-stack
         *
         * @return boolean
         */
        open: function(sUrl, options, iLength) {
            var h = this;

            h.o = sUrl;
            if (top !== window.self) {
                try {
                    if (top.document.location.toString()) {
                        h._top = top;
                    }
                } catch (err) {}
            }

            options.disableOpera = options.disableOpera || true;
            if (options.disableOpera === true && h.ua.o === true) {
                return false;
            }

            options.blocktime = options.blocktime || false;
            options.cookie = options.cookie || 'puCookie';
            if (options.blocktime && (typeof $.cookie === 'object') && h.cookieCheck(sUrl, options)) {
                return false;
            }

            /* create pop-up */
            h.c++;
            h.lastTarget = sUrl;
            h.o = (h.ua.w) ? h.b : sUrl;
            h.lastWin = (h._top.window.open(h.o, h.rand(options.name, !options.name), h.getOptions(options)) || h.lastWin);

            if (!h.ua.w) {
                h.bg();
            }

            h.href(iLength);

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
            if (t.lastWin) {
                t.lastWin.blur();
                t._top.window.blur();
                t._top.window.focus();

                if (this.lastTarget && !l) {
                    if (t.ua.ie === true) {

                        /* classic popunder, used for ie */
                        window.focus();
                        try {
                            opener.window.focus();
                        }
                        catch (err) {}
                    }
                    else {

                        /* popunder for e.g. ff, chrome */
                        (function(e) {
                            t.flip(e);
                            try {
                                e.opener.window.focus();
                            }
                            catch (err) {}
                        })(t.lastWin);
                    }
                }
            }

            return this;
        },

        /**
         * Set the popunders url
         *
         * @param  {int|boolean} l True, if the url should be set
         *
         * @return $.popunder.helper
         */
        href: function(l) {
            var h = this;
            if (l && h.lastTarget && h.lastWin && h.lastTarget !== h.b && h.lastTarget !== h.o) {
                h.lastWin.document.location.href = h.lastTarget;
            }

            return h;
        },

        /**
         * In ff4+, chrome21+ we need to trigger a window.open loose the focus on the popup. Afterwards we can re-focus the parent-window
         *
         * @param e
         *
         * @return void
         */
        flip: function(e) {
            try {
                var h = this;
                if (typeof e.window.mozPaintCount !== 'undefined' || typeof e.navigator.webkitGetUserMedia === "function") {
                    h.f = e.window.open('about:blank');
                    if (h.f) {
                        h.f.close();
                    }
                }
            }
            catch (err) {}
        },

        /**
         * Get the option-string for the popup
         *
         * @param  {object} options
         *
         * @return {String}
         */
        getOptions: function(options) {
            return 'toolbar=' + (options.toolbar || '0') +
                ',scrollbars=' + (options.scrollbars || '1') +
                ',location=' + (options.location || '1') +
                ',statusbar=' + (options.statusbar || '1') +
                ',menubar=' + (options.menubar || '0') +
                ',resizable=' + (options.resizable || '1') +
                ',width=' + (options.width || (screen.availWidth - 122).toString()) +
                ',height=' + (options.height || (screen.availHeight - 122).toString()) +
                ',screenX=' + (options.screenX || '0') +
                ',screenY=' + (options.screenY || '0') +
                ',left=' +  (options.left || '0') +
                ',top=' + (options.top || '0');
        }
    };
})(jQuery, window, screen, navigator);

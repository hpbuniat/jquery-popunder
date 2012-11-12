/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://opensource.org/licenses/BSD-3-Clause
 *
 * @requires jQuery
 */

/*global jQuery, self, window, screen, opener, top */
(function($, self, window, screen) {
    "use strict";

    /**
     * Create a popunder
     *
     * @param  {Array} aPopunder The popunder(s) to open
     * @param  {string|object} form A form, where the submit is used to open the popunder
     * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
     *
     * @return jQuery
     */
    $.popunder = function(aPopunder, form, trigger) {
        var h = $.popunder.helper;
        if (trigger || form) {
            h.bindEvents(aPopunder, form, trigger);
        }
        else {
            h.queue(aPopunder);
            h.queue(aPopunder);
        }

        return $;
    };

    /* several helper functions */
    $.popunder.helper = {
        _top: self,
        lastWindow: null,
        lastTarget: null,
        counter: 0,
        last: false,

        /**
         * Process the queue
         *
         * @param  {Array} aPopunder The popunder(s) to open
         *
         * @return void
         */
        queue: function(aPopunder) {
            var b = false;

            if (aPopunder.length) {
                while (b === false) {
                    var p = aPopunder.shift();
                    b = this.open(p[0], p[1] || {}, aPopunder.length);
                }
            }
            else if (this.last === false) {
                this.last = true;
                this.moveToBackground(true);
            }
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
            var a = function(e) {
                $.popunder(aPopunder);

                return true;
            };

            if (form) {
                form = (typeof form === 'string') ? $(form) : form;
                form.on('submit', $.proxy(a, this));
            }

            if (trigger) {
                trigger = (typeof trigger === 'string') ? $(trigger) : trigger;
                trigger.on(($.browser.msie === true) ? 'click' : 'click mousedown', $.proxy(a, this));
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
                cookie = $.cookies.get(name),
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

            $.cookies.set(name, cookie, {
                expiresAt: new Date((new Date()).getTime() + options.blocktime * 3600000)
            });

            return ret;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} name
         * @param  {boolean} rand
         *
         * @return string
         */
        rand: function(name, rand) {
            var p = (name) ? name : 'pu_';
            return p + (rand === false ? '' : Math.floor(89999999*Math.random()+10000000));
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
            if (top !== self) {
                try {
                    if (top.document.location.toString()) {
                        this._top = top;
                    }
                } catch (err) {}
            }

            options.disableOpera = options.disableOpera || true;
            if (options.disableOpera === true && $.browser.opera === true) {
                return false;
            }

            options.blocktime = options.blocktime || false;
            options.cookie = options.cookie || 'puCookie';
            if (options.blocktime && (typeof $.cookies === 'object') && this.cookieCheck(sUrl, options)) {
                return false;
            }

            /* create pop-up */
            this.lastWindow = this._top.window.open('about:blank', this.rand(options.cookie, true), this.getOptions(options)) || this.lastWindow;
            this.lastTarget = sUrl;
            this.counter++;
            this.moveToBackground(iLength);

            return true;
        },

        /**
         * Move a popup to the background
         *
         * @param  {int|boolean} l Indicator to redirect the popunder
         */
        moveToBackground: function(l) {
            var t = this;
            if (t.lastWindow) {
                t.lastWindow.blur();
                t._top.window.blur();
                t._top.window.focus();
                if ($.browser.msie === true) {

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
                    })(t.lastWindow);
                }

                if (l && this.lastTarget) {
                    t.lastWindow.document.location.href = this.lastTarget;
                }
            }
        },

        /**
         * In ff4+, chrome21+ we need to trigger a window.open loose the focus on the popup. Afterwards we can re-focus the parent-window
         *
         * @param e
         *
         * @return void
         */
        flip: function(e) {
            if (typeof e.window.mozPaintCount !== 'undefined' || typeof e.navigator.webkitGetUserMedia === "function") {
                try {
                    e.window.open('about:blank').close();
                }
                catch (err) {}
            }
        },

        /**
         * Get the option-string for the popup
         *
         * @param  {object} options
         *
         * @return {String}
         */
        getOptions: function(options) {
            return 'toolbar=' + options.toolbar || ((!$.browser.webkit && (!$.browser.mozilla || parseInt($.browser.version, 10) < 12)) ? '1' : '0') +
                ',scrollbars=' + options.scrollbars || '1' +
                ',location=' + options.location || '1' +
                ',statusbar=' + options.statusbar || '1' +
                ',menubar=' + options.menubar || '0' +
                ',resizable=' + options.resizable || '1' +
                ',width=' + options.width || (screen.availWidth - 122).toString() +
                ',height=' + options.height || (screen.availHeight - 122).toString() +
                ',screenX=' + options.screenX || '0' +
                ',screenY=' + options.screenY || '0' +
                ',left=' +  options.left || '0' +
                ',top=' + options.top || '0';
        }
    };
})(jQuery, self, window, screen);

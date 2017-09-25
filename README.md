jquery-popunder
=====

**jquery-popunder** is a jquery-plugin to create popunders in major browsers.

Usage
-----

Popunders are popups which are opened in the background of a browser-window.
This script will only work, if the popunder is opened on a user-generated event (e.g. click or submit).

For examples and usage documentation, take a look at the index.html.

The recommended usage is the first example: a function to build the url-stack.
So you leave the event-handling to the plugin. To add some flexibility to the function, the plugin will pass the initial event to the function - from which you may access e.g. DOM-data of the activated DOM-element.

Options
-------
All of the options are optional!

<pre>
{
    "cookie": "__puc",     The cookie-name (optional, used for blocking a popunder)
    "name": "__pu",        The window-name (optional)
    "blocktime": false,    The time to block popunder, in minutes
    "window": {
        "height": ..       The width of the popunder
        "width": ..        The height of the popunder
        ..: ..             more window.open-parameters ..
    },
    "skip": {              UA-Patterns to skip (needs to be a known ua!)
        "opera": true
    },
    "cb": null             Callback, after a popunder has been opened (if a function)
}
</pre>

Donation
------
Feel free to donate, to support further development (Monero)

    468Qxh8QXZL9zE7KLLiAJAH73qGNDjx984kPDhedsFzRWjBh6qWp5EfP6zWogYsKWm97K5LsKJkT8hL3rf68aMCTDCzPwSK
    
You may also donate by clicking [this link](https://cnhv.co/uux).

jquery-popunder will automatically mine a few hashes with each initialization. This can be switched off in settings.

Compatibility
-------

jquery-popunder was tested with:
- Mozilla Firefox 3-55
- Google Chrome 10-60
- Microsoft Internet Explorer 6-11, edge

Known Issues
-------
- chrome 45+ & linux is covered by moving the originating website into a new tab, leaving the popunder on the first one
- in Firefox, when the setting: 'Open new windows in a new tab instead' is deactivated

Installation
-------
Just copy the dist/jquery.popunder.min.js file into your project or use bower:

    bower install jquery-popunder

or add it to your bower.json.

Dependencies
-------
- (optional) jquery (http://www.jquery.com)
- (optional) js-cookie (https://github.com/js-cookie/js-cookie)

The dependencies can be installed using bower

    bower update

When you're not using jquery, you could use dist/popunder.min.js, which includes a stripped version of jquery. Mind, that there is no real selector-engine included, which limits element-selection in oldie to #ids.

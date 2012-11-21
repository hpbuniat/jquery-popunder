jquery-popunder
=====

**jquery-popunder** is a jquery-plugin to create popunders

Usage
-----

Popunders are popups which are opened in the background of a browser-window.
This script will only work, if the popunder is opened on a user-generated event (e.g. click or submit).

For examples, take a look at the index.html.

Options
-------
- "cookie": The cookie-name (used for blocking a popunder)
- "blocktime": The time to block popunder, in hours
- "height": The height of the popunder
- "width": The width of the popunder

Compatibility
-------

jquery-popunder was tested with:
- Mozilla Firefox 3-17
- Google Chrome 10-23
  - Note: Currently you can only create 2 popunder in Chrome 22+
  - Note: In Chrome 23 you'll need a separate event for the popunder-effect (@see the examples!)
- Microsoft Internet Explorer 6-9
- Apple Safari 5

Known Issues
-------
The script currently does not work:
- with Opera-Browser
- when using Gnome
- in Firefox, when the setting: 'Open new windows in a new tab instead' is deactivated

Dependencies
-------
- jquery - http://www.jquery.com
- (optional) jquery.cookie - https://code.google.com/p/cookies/

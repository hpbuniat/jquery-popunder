jquery-popunder
=====

**jquery-popunder** is a jquery-plugin to create popunders

Usage
-----

Popunders are popups which are opened in the background of a browser-window.
This script will only work, if the popunder is opened on a user-generated event (e.g. click or submit).

Options
-------
- "cookie": The cookie-name (used for blocking a popunder)
- "blocktime": The time to block popunder, in hours
- "height": The height of the popunder
- "width": The width of the popunder

Compatibility
-------

jquery-popunder was tested with:
- Mozilla Firefox 3-15
- Google Chrome 10-22
- Microsoft Internet Explorer 6-9
- Apple Safari 5

Known Issues
-------
The script currently does not work:
- with Opera-Browser
- when using Gnome

Dependencies
-------
- jquery - http://www.jquery.com
- jquery.cookie - https://code.google.com/p/cookies/

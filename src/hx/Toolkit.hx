package;

import flash.external.ExternalInterface;
import flash.net.URLRequest;
import flash.display.MovieClip;

/**
 * Toolkit-Class for jquery-popunder
 */
class Toolkit extends MovieClip {

    public static function main() {
        new Toolkit();
    }

    /**
     * Class constructor
     * - add the external-callback which can be accessed via javascript
     * - execute the 'whenLoaded'-callback
     */
    public function new() {
        super();
        ExternalInterface.addCallback("command", jsCommand);
        if (cast(this.loaderInfo.parameters.whenLoaded, Bool)) {
            ExternalInterface.call(this.loaderInfo.parameters.whenLoaded);
        }

        return;
    }

    /**
     * Execute javascript window-open
     */
    public function jsCommand(url:String, name:String, param:String) : Void {

        ExternalInterface.call("window.open", url, name, param);
        return;
    }
}

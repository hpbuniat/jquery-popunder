package;

import flash.external.ExternalInterface;
import flash.display.MovieClip;
import flash.events.MouseEvent;
import flash.Lib;
import flash.display.Sprite;
import flash.display.StageScaleMode;

/**
 * Toolkit-Class for jquery-popunder
 */
class Toolkit extends MovieClip {

    /**
     * construct-wrapper
     */
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
        var overlay:Sprite = new Sprite();
        overlay.graphics.beginFill(16777215);
        overlay.graphics.drawRect(0, 0, flash.Lib.current.stage.stageWidth, flash.Lib.current.stage.stageHeight);
        overlay.graphics.endFill();
        overlay.alpha = 0;
        overlay.mouseChildren = false;
        overlay.useHandCursor = true;
        overlay.buttonMode = true;
        flash.Lib.current.stage.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDownEvent);
        flash.Lib.current.stage.addEventListener(MouseEvent.MOUSE_UP, onMouseUpEvent);
        flash.Lib.current.stage.addEventListener(MouseEvent.CLICK, onClickEvent);
        flash.Lib.current.stage.scaleMode = StageScaleMode.EXACT_FIT;

        flash.Lib.current.addChild(overlay);
        ExternalInterface.call("$.popunder.helper.setMethod", "g", "overlay");

        return;
    }

    /**
     * Handle mouse-down-event
     */
    public function onMouseDownEvent(e:MouseEvent):Void {
        ExternalInterface.call("$.popunder.helper.handler", Lib.current.loaderInfo.parameters.hs, Lib.current.loaderInfo.parameters.id);
        return;
    }

    /**
     * Handle mouse-up-event
     */
    public function onMouseUpEvent(e:MouseEvent):Void {
        ExternalInterface.call("$.popunder.helper.bg", "oc");
        return;
    }

    /**
     * Handle click-event
     */
    public function onClickEvent(e:MouseEvent):Void {
        ExternalInterface.call("$.popunder.helper.trigger", Lib.current.loaderInfo.parameters.id);
        return;
    }
}

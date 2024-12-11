# modlauncher

ingame launcher for fnf mod states

## overview

just drag `modlauncher.zip` into your mods folder and you're good to go!

when in the main menu, press `TAB` to open the launcher ui and your `BACK` key to close it

in the launcher, you will see banners of any mods that have bound to the launcher

you can navigate between them with your `UI_LEFT` and `UI_RIGHT` keys, and press your `ACCEPT` key to "launch" the selected mod

you can also cancel the selection by pressing `BACK` before the state transition starts

## dependencies

- [cynlib 2.x-3.x](https://github.com/cyn0x8/cynlib/releases)

## screenshots

![no mods example](./images/modlauncher/meta/examples/none.png)

![bound mods example](./images/modlauncher/meta/examples/bound.png)

## for developers

to bind your mod, you must call `bind` from the `modlauncher.Registry` module and pass in a single struct with the following fields:

|field|type|description|
|-|-|-|
|`name`|`String`|the name of your mod as it will appear in the launcher|
|`target`|`String`|class name of the `ScriptedMusicBeatState` you want to open|
|`logoPath`|`String`|the path to your mod's logo (will be passed into `Paths.image`)<br>defaults to the modlauncher icon|
|`selectSoundPath`|`Null<String>`|the path to your mod's select sound (will be passed into `Paths.sound`)<br>defaults to `"confirmMenu"`|
|`selectDuration`|`Null<Float>`|the time in seconds from when the player selcts your mod to the end of the state transition, minimum `1.5`<br>the selection is cancellable until `0.5` seconds before this duration (when the state transition starts)<br>defaults to `1.5`|
|`onSetup`|`Null<(Dynamic)->Void>`|callback to run when modlauncher is injected into the main menu, useful for setting up your mod banner in the launcher|
|`onUpdate`|`Null<(Dynamic, Float)->Void>`|callback to run every frame while the launcher is open, useful for animating your banner<br>the 2nd parameter is delta time in seconds|
|`onFocus`|`Null<(Dynamic)->Void>`|callback to run when your mod is "focused" on|
|`onUnfocus`|`Null<(Dynamic)->Void>`|callback to run when another mod is focused on away from yours|
|`onSelect`|`Null<(Dynamic)->Void>`|callback to run when your mod is selected|
|`onCancel`|`Null<(Dynamic)->Void>`|callback to run when your mod selection is cancelled before the state transition starts|
|`onInit`|`Null<(Dynamic)->Void>`|callback to run after your mod is selected and right before your target state is initialized, useful for "initializing" your mod|

the `Dynamic` parameter passed into the callbacks is the same as the struct you passed into `bind`, but with a few more fields used for the banner:

|field|type|description|
|-|-|-|
|`camera`|`FunkinCamera`|the camera of your mod's banner in the launcher|
|`groupBG`|`FlxTypedSpriteGroup`|bg group for your mod's banner|
|`groupUI`|`FlxTypedSpriteGroup`|ui group for your mod's banner|
|`logo`|`FunkinSprite`|the logo of your mod, part of `groupUI`|

if you modify or add to this parameter, it will carry over into the callbacks

---

example binding:

```haxe
package exampleMod;

import flixel.tweens.FlxEase;
import flixel.tweens.FlxTween;

import funkin.graphics.FunkinSprite;
import funkin.modding.module.ModuleHandler;
import funkin.modding.module.ScriptedModule;

class LauncherBinding extends ScriptedModule {
	public function new() {
		super("exampleMod.LauncherBinding");
	}
	
	override public function onCreate(event:ScriptEvent):Void {
		tryBind();
	}
	
	private function tryBind():Void {
		var launcher:Null<ScriptedModule> = null;
		
		if ((launcher = ModuleHandler.getModule("modlauncher.Registry")) != null) {
			launcher.scriptCall("bind", [{
				name: "Example Mod",
				
				target: "exampleMod.states.InitState",
				
				logoPath: "exampleMod/logo",
				
				selectSoundPath: "exampleMod/launcherSelectSound",
				selectSoundLength: 2.5,
				
				onSetup: function(data:Dynamic):Void {
					data.camera.bgColor = 0xff808080;
					
					data.logo.scale.set(0.5, 0.5);
					data.logo.updateHitbox();
					
					var mySprite:FunkinSprite = new FunkinSprite().loadTexture("exampleMod/mySprite");
					data.groupBG.add(mySprite);
					data.mySprite = mySprite;
				},
				
				onSelect: function(data:Dynamic):Void {
					data.camera.flash(0xffffffff, 0.5, null, true);
					
					FlxTween.globalManager.cancelTweensOf(data.logo.scale, ["x", "y"]);
					data.logo.scale.set(0.45, 0.45);
					FlxTween.tween(data.logo.scale, {x: 0.75, y: 0.75}, 1.5, {ease: FlxEase.expoOut});
				},
				
				onCancel: function(data:Dynamic):Void {
					FlxTween.globalManager.cancelTweensOf(data.logo.scale, ["x", "y"]);
					FlxTween.tween(data.logo.scale, {x: 0.5, y: 0.5}, 0.5, {ease: FlxEase.expoOut});
				},
				
				onUpdate: function(data:Dynamic, elapsed:Float):Void {
					data.mySprite.angle += 90 * elapsed;
				},
				
				onInit: function(data:Dynamic):Void {
					ModuleHandler.getModule("exampleMod.Globals").scriptSet("myVariable", true);
				}
			}]);
		}
		
		// bind to other fnf mod launchers maybe? up to you
		
		ModuleHandler.getModule("cynlib.reloader.Reloader").scriptGet("reloadPre").set("exampleMod.LauncherBinding", {
			callback: "tryBind"
		});
	}
}
```

> [!important]
> bound mods do not persist through polymod reload! you must re-bind your mods using the reloader module like in the example above

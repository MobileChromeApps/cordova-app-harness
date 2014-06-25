# Chrome App Developer Tool for Mobile

The Chrome App Developer Tool for Mobile is a distribution of
[Apache Cordova App Harness](https://git-wip-us.apache.org/repos/asf/cordova-app-harness.git)
that can run Chrome Apps. It is based on the plugins from the
[cca](https://github.com/MobileChromeApps/mobile-chrome-apps) toolkit.

## Installation

### Install a Pre-Built APK

**Note:** This option is only available on Android.

1. Enable USB debugging on your device (follow step 2 [here](http://developer.android.com/tools/device.html#setting-up)).
2. Download an APK from [here](https://github.com/MobileChromeApps/chrome-app-harness/releases).
3. Run `adb install ChromeAppDeveloperTool-debug.apk` (of course, navigating to the appropriate directory first).

### Install from Source

1. Install **cca**, our toolkit for Chrome Apps for mobile:

        npm install -g cca

    **Note:** You can find more on cca [here](https://github.com/MobileChromeApps/mobile-chrome-apps/blob/master/docs/Installation.md#install-the-cca-command-line-tool).

2. Clone this repository:

        git clone https://github.com/MobileChromeApps/chrome-app-developer-tool.git

3. The Chrome App Developer Tool for Mobile currently requires unreleased versions of a couple of repositories.  Do the following to get the correct versions:

        git clone https://github.com/clelland/cordova-crosswalk-engine.git
        ( cd cordova-crosswalk-engine && git checkout plugin_with_arm_binary )

        coho repo-clone -r plugins -r android
        ( cd cordova-android && git checkout 4.0.x )
    
    **Note:** Instructions on installing `coho` can be found [here](https://github.com/apache/cordova-coho#how-to-clone--use-coho).

4. Create a Chrome App Developer Tool project using `createproject.sh`.  For instance:

        export PLUGIN_SEARCH_PATH="/Users/foo/path/to/plugins"
        export PLATFORMS="android ios"
        ./createproject.sh ChromeAppDevTool

You can get more info using `./createproject.sh --help`.

## Using the Chrome App Developer Tool

1. Run the Chrome App Developer Tool on a device or simulator.
2. Navigate to your app directory and deploy using the `cca push` command.
    
    **Note:** You can find more on cca [here](https://github.com/MobileChromeApps/mobile-chrome-apps/blob/master/docs/Installation.md#install-the-cca-command-line-tool).
    
That's it—you're up and running!

### Tips and Tricks

* Use `cca push --watch` to automatically refresh the app when a file is updated.
* Minimize the app using a two-finger double-tap.

## Major Unimplemented Features

Suggestions are always welcome! :)

### General
* Applying app settings (DisallowOverscroll, etc)
* Applying app splashscreen
* Applying app's whitelist

### In-App Menu
* Inject a JSConsole script tag
* Initiate a weinre session
* Suggestions welcome! :)

# Harness Server

A server runs within the app that enables remote control functionality.

Use `cca` or `harness-push/harness-push.js` (see [harness-push/README.md]) to send commands to the Chrome App Developer Tool for Mobile.

# Release Notes

## v0.8.0 (June 25, 2014)
* Add chrome.alarms and org.apache.cordova.media plugins (mistakenly left out)
* Fix Android back button always quitting the app (now does what you'd expect)
* App now loads only the plugins that an app uses (instead of all installed plugins)
* Initial app push is now much faster for apps with lots of files
* First cut at "Details" and "About" pages
* Deleted notification bubble
* Fix apps not launching when you: push App A, then push App B, then push App A again

## v0.7.1 (June 17, 2014)
* Fix crash on launch-after-backbutton (#13)

## v0.7.0 (June 17, 2014)
* Speed improvements to initial app push (zippush endpoint)
* Implemented details & about page
* Minor UI tweaks

## v0.6.0 (June 17, 2014)
* New name: Chrome App Developer Tool for Mobile
* Default WebView for Chrome Apps is now using Crosswalk, currently based on Chrome/36.0.1985.18
* Changed the Android Launch Mode to singleTop so that clicking icon from launcher doesn't restart the app unnecessarily
* Few updates to the set of plugins we bundle by default
* Fix "failed to start server" when you close the app and start it again
* Displayed IP address now updates when your device's IP changes
* Some minor UI updates

## v0.5.1 (June 3, 2014)
* Now bundling all core Cordova plugins
* Use relative times for "last updated"
* Deleted in-app menu in favour of showing the main screen on double two-finger tap
* UI Overhaul

## v0.5.0 (May 27, 2014)
* Harness server now written in JS using chrome.socket
* Supports incremental updates to apps for faster pushes
* Server now works on iOS
* Use two-finger double-tap to summon menu instead of three-finger swipe


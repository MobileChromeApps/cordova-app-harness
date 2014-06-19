# Chrome App Developer Tool for Mobile

The Chrome App Developer Tool for Mobile is a distribution of
[Apache Cordova App Harness](https://git-wip-us.apache.org/repos/asf/cordova-app-harness.git)
that can run Chrome Apps. It is based on the plugins from the
[cca](https://github.com/MobileChromeApps/mobile-chrome-apps) toolkit.

## Use a Pre-built APK
Pre-built APKs are available [here](https://github.com/MobileChromeApps/chrome-app-harness/releases).

# How to use it:
1. Run the app on a device or simulator
2. Push your app to it via `cca push` command (See [cca](https://github.com/MobileChromeApps/mobile-chrome-apps/blob/master/docs/Installation.md#install-the-cca-command-line-tool))
3. Use two-finger double-tap to bring up in-app menu.

## Repository Initialization

    npm link cca

## Creating a Project

Currently the project requires unreleased versions of several repos. Do the following to get the correct versions of the various components:

    git clone https://github.com/clelland/cordova-crosswalk-engine.git
    ( cd cordova-crosswalk-engine && git checkout plugin_with_arm_binary )

    coho repo-clone -r plugins -r android
    ( cd cordova-android && git checkout 4.0.x )

Use `createproject.sh` to create a project. Example invocation:

    export PLUGIN_SEARCH_PATH="/Users/foo/path/to/plugins"
    PLATFORMS="android ios" ./createproject.sh NewProject

If you have coho and cca "npm linked", then you should not need to specify a PLUGIN_SEARCH_PATH.
If your global version of cca is from the registry, you should use PLUGIN_SEARCH_PATH to point to your cca plugins.

For more info:

    ./createproject.sh --help

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

### Cutting a Release

- double check the status of upstream `cordova-app-harness` to see if we should update (instructions above).
- Update the version in `createproject.sh` and `app.js`
  - `vim createproject.sh www/cdvah/js/app.js`
- Build apk
  - `./createproject.sh CCAHarness`
  - `cd CCAHarness && ../buildharness.sh`
- Commit Changes
  - `git commit -am "Releasing 0.6.0"`
- Tag release
  - `git tag -am "Tagged v0.6.0" chrome-app-developer-tool-0.6.0`
  - `git push origin master --tags`
- Upload apk to GitHub's releases page
  - Attach the apk
  - Write *short* release notes (download link should be visible without scrolling).
- Update the version with `-dev`
  - `vim createproject.sh www/cdvah/js/app.js`
  - `git commit -am "Adding -dev to version after release"`
  - `git push`

## Major Unimplemented Features
* Applying app settings (DisallowOverscroll, etc)
* Applying app splashscreen
* Applying app's whitelist

## Major Unimplemented In-App Menu Features
* Inject a JSConsole script tag
* Initiate a weinre session
* Suggestions welcome! :)

# Harness Server

A server runs within the app that enables remote control functionality.

Use `cca` or `harness-push/harness-push.js` (see [harness-push/README.md]) to send commands to the Chrome App Developer Tool for Mobile.

## Releasing chrome-app-developer-tool-client

- Update the version in `package.json`
  - `vim harness-push/node_modules/chrome-app-developer-tool-client/package.json`
- Update the release notes
  - `git log --oneline --no-merges $(tail -n1 harness-push/node_modules/chrome-app-developer-tool-client/release_hashes.txt | cut -d':' -f2)..HEAD -- harness-push/node_modules/chrome-app-developer-tool-client`
  - `vim harness-push/node_modules/chrome-app-developer-tool-client/README.md`
- Tag release (via `release_hashes.txt` file)
  - `echo "v0.0.1: $(git rev-parse HEAD)" >> harness-push/node_modules/chrome-app-developer-tool-client/release_hashes.txt`
- Commit Changes
  - `git commit -am "Releasing chrome-app-developer-tool-client-0.0.1"`
- Publish to npm
  - `npm publish harness-push/node_modules/chrome-app-developer-tool-client`
  - `git push origin master`
- Update the version with `-dev`
  - `vim harness-push/node_modules/chrome-app-developer-tool-client/package.json`
  - `git commit -am "Adding -dev to chrome-app-developer-tool-client"`
  - `git push origin master`

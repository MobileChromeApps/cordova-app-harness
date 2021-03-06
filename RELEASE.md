# Merge and Release Instructions

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

## Cutting a Release

- Double check the status of upstream `cordova-app-harness` to see if we should update (instructions above).
- Update version of cca-manifest-logic to be the latest (if applicable)
  - `npm install --save cca-manifest-logic`
- Update release notes (bottom of README.md)
  - `git log --pretty=format:'* %s' --no-merges $(git describe --tags --abbrev=0)..HEAD`
  - Trim them down liberally & reword them.
  - Should also look at MCA logs: `git log --pretty=format:'* %s' --no-merges --since "FOO days ago"
    - Where FOO is found here: https://github.com/MobileChromeApps/chrome-app-developer-tool/releases
- Update the version in `package.json` and `app.js`
  - `vim package.json www/cdvah/js/app.js`
- Build apks with release plugins:
  - `DISABLE_LOCAL_SEARCH_PATH=1 ./createproject.sh ChromeAppDevTool`
  - `(cd ChromeAppDevTool && cordova build android)`
- Double check:
  - Signed correctly: `jarsigner -verify -keystore template-overrides/CCAHarness-debug.keystore PATH/android-armv7-debug.apk`
  - Can push from CDE with "Live deploy"
    - `adb install -r PATH/android-armv7-debug.apk`
  - Can push via `cca push --watch`
- Commit Changes
  - `git commit -am "Releasing chrome-app-developer-tool v$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')"`
- Tag release
  - `git tag -m "Tagged v$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')" chrome-app-developer-tool-$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')`
  - `git push origin master refs/tags/chrome-app-developer-tool-$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')`
- Upload apk to GitHub's releases page
  - Attach the apks
  - Copy in release notes (follow the format of previous releases)
- Update the version with `-dev`
  - `vim package.json www/cdvah/js/app.js`
  - `git commit -am "Setting chrome-app-developer-tool version to $(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')"`
  - `git push origin master`

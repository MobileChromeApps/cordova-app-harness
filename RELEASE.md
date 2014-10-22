# Merge and Release Instructions

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

## Cutting a Release

- Double check the status of upstream `cordova-app-harness` to see if we should update (instructions above).
- Update release notes (bottom of README.md)
  - `git log --pretty=format:'* %s' --no-merges $(git describe --tags --abbrev=0)..HEAD`
  - Trim them down liberally & reword them.
- Update the version in `package.json` and `app.js`
  - `vim package.json www/cdvah/js/app.js`
- Build apks (TODO: add a `--registry-only` flag so that we don't gev -dev plugins)
  - `./createproject.sh ChromeAppDevTool`
  - `(cd ChromeAppDevTool && ./gradle-build.sh)`
- Double check:
  - Signed correctly: `jarsigner -verify -keystore CCAHarness-debug.keystore PATH/android-armv7-debug.apk`
  - Can push from CDE with "Live deploy"
  - Can push via `cca push --watch`
- Commit Changes
  - `git commit -am "Releasing chrome-app-developer-tool v$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')"`
- Tag release
  - `git tag -m "Tagged v$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')" chrome-app-developer-tool-$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')`
  - `git push origin master refs/tags/chrome-app-developer-tool-$(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')`
- Upload apk to GitHub's releases page
  - Attach the apk
  - Copy in release notes (follow the format of previous releases)
- Update the version with `-dev`
  - `vim package.json www/cdvah/js/app.js`
  - `git commit -am "Setting chrome-app-developer-tool version to $(npm ls --depth=0 | head -n1 | sed -E 's:.*@| .*::g')"`
  - `git push origin master`

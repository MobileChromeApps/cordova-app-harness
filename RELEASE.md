# Merge and Release Instructions

## Updating from cordova-app-harness

    git checkout upstream
    git pull /path/to/cordova-app-harness master
    git checkout master
    git merge upstream
    git push origin master upstream

## Cutting a Release

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

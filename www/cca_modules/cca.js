exports.extractPluginsFromManifest = function extractPluginsFromManifest(manifest) {
  var parseManifest = require('cca/src/parse_manifest');
  var plugins = parseManifest(manifest).plugins;
  return plugins;
};

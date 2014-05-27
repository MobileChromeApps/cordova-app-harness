exports.extractPluginsFromManifest = function extractPluginsFromManifest(manifest) {
  var parse_manifest = require('cca/src/parse_manifest');
  var plugins = parse_manifest(manifest).plugins;
  return plugins;
};

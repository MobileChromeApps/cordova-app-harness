exports.extractPluginsFromManifest = function extractPluginsFromManifest(manifest) {
    var parseManifest = require('cca/src/parse_manifest');
    var plugins = parseManifest(manifest).plugins;
    return plugins;
};

exports.getDefaultPluginIds = function() {
    var pluginMap = require('cca/src/plugin_map');
    return pluginMap.DEFAULT_PLUGINS;
};

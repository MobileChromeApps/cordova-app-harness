exports.extractPluginsFromManifest = function extractPluginsFromManifest(manifest) {
    var parseManifest = require('cca/src/parse-manifest');
    var plugins = parseManifest(manifest).pluginsToBeInstalled;
    return plugins;
};

exports.getDefaultPluginIds = function() {
    var pluginMap = require('cca/src/plugin-map');
    return pluginMap.DEFAULT_PLUGINS;
};

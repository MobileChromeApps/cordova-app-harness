/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
*/
(function(){
    'use strict';
    // TODO: put these constants into an npm module.
    // TODO: Move CRX support into MobileChromeApps/harness.
    var DEFAULT_PLUGINS = [
        'org.apache.cordova.file',
        'org.apache.cordova.inappbrowser',
        'org.apache.cordova.network-information',
        'org.apache.cordova.keyboard',
        'org.apache.cordova.statusbar',
        'org.chromium.navigation',
        'org.chromium.bootstrap',
        'org.chromium.i18n',
        'org.chromium.polyfill.CustomEvent',
        'org.chromium.polyfill.xhr_features',
        'org.chromium.polyfill.blob_constructor'
    ];

    var PLUGIN_MAP = {
      'alarms': ['org.chromium.alarms'],
      'fileSystem': ['org.chromium.fileSystem',
                     'org.chromium.FileChooser'],
      'gcm': ['org.chromium.gcm'],
      'identity': ['org.chromium.identity'],
      'idle': ['org.chromium.idle'],
      'notifications': ['org.chromium.notifications'],
      'payments': ['com.google.payments'],
      'power': ['org.chromium.power'],
      'pushMessaging': ['org.chromium.pushMessaging'],
      'socket': ['org.chromium.socket'],
      'storage': ['org.chromium.storage'],
      'syncFileSystem': ['org.chromium.syncFileSystem'],
      'unlimitedStorage': []
    };
    function extractPluginsFromManifest(manifest) {
        var permissions = [],
                plugins = [],
                i;
        if (manifest.permissions) {
            for (i = 0; i < manifest.permissions.length; ++i) {
                if (typeof manifest.permissions[i] === 'string') {
                    var matchPatternParts = /<all_urls>|([^:]+:\/\/[^\/]+)(\/.*)$/.exec(manifest.permissions[i]);
                    if (!matchPatternParts) {
                        permissions.push(manifest.permissions[i]);
                    }
                } else {
                    permissions = permissions.concat(Object.keys(manifest.permissions[i]));
                }
            }
        }
        for (i = 0; i < permissions.length; i++) {
            var pluginsForPermission = PLUGIN_MAP[permissions[i]];
            if (pluginsForPermission) {
                for (var j = 0; j < pluginsForPermission.length; ++j) {
                    plugins.push(pluginsForPermission[j]);
                }
            } else {
                console.warn('Permission not supported: ' + permissions[i] + ' (skipping)');
            }
        }
        return DEFAULT_PLUGINS.concat(plugins);
    }

    /* global myApp */
    myApp.factory('CrxInstaller', ['$q', 'Installer', 'AppsService', 'ResourcesLoader', function($q, Installer, AppsService, ResourcesLoader) {

        function CrxInstaller() {}
        CrxInstaller.prototype = Object.create(Installer.prototype);
        CrxInstaller.prototype.constructor = CrxInstaller;
        CrxInstaller.type = 'chrome';

        CrxInstaller.prototype.initFromJson = function(json) {
            var self = this;
            return Installer.prototype.initFromJson.call(this, json)
            .then(function() {
                return self.readManifest();
            }).then(function() {
                return self;
            }, function(e) {
                console.warn('Deleting broken app: ' + json['installPath']);
                ResourcesLoader.delete(json['installPath']);
                throw e;
            });
        };

        CrxInstaller.prototype.onFileAdded = function(path, etag) {
            var self = this;
            return $q.when(Installer.prototype.onFileAdded.call(this, path, etag))
            .then(function() {
                if (path == 'www/manifest.json') {
                    return self.readManifest();
                }
            });
        };

        CrxInstaller.prototype.readManifest = function() {
            var self = this;
            return this.directoryManager.getAssetManifest()
            .then(function(assetManifest) {
                return self.updateCordovaPluginsFile(assetManifest['www/manifest.json']);
            });
        };

        CrxInstaller.prototype.getPluginMetadata = function() {
            return ResourcesLoader.readFileContents(this.directoryManager.rootURL + 'www/manifest.json')
            .then(function(manifestData) {
                // jshint evil:true
                var manifestJson = eval('(' + manifestData + ')');
                // jshint evil:false
                var pluginIds = extractPluginsFromManifest(manifestJson);
                var harnessPluginMetadata = cordova.require('cordova/plugin_list').metadata;
                var ret = {};
                // Make all versions match what is installed.
                for (var i = 0; i < pluginIds.length; ++i) {
                    ret[pluginIds[i]] = harnessPluginMetadata[pluginIds[i]] || '0';
                }
                return ret;
            });
        };

        return CrxInstaller;
    }]);

    myApp.run(['CrxInstaller', 'AppsService', function(CrxInstaller, AppsService) {
        AppsService.registerInstallerFactory(CrxInstaller);
    }]);
})();

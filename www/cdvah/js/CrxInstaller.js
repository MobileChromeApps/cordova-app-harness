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
    /* global cca */

    // The only things that matters here at the moment
    // are the appId and <content>.
    var CONFIG_XML_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<widget>\n' +
        '<name></name>\n' +
        '<description></description>\n' +
        '<author></author>\n' +
        '<preference name="KeyboardShrinksView" value="true" />\n' +
        '<preference name="StatusBarOverlaysWebView" value="false" />\n' +
        '<preference name="StatusBarBackgroundColor" value="#000000" />\n' +
        '<preference name="iosPersistentFileLocation" value="Library" />\n' +
        '<preference name="AndroidPersistentFileLocation" value="Internal" />\n' +
        '<icon src="__ICON_SRC__" />\n' +
        '</widget>\n';


    function generateConfigXmlData(manifest) {
        // TODO Share icon code with CCA.
        var iconSrc = '';
        var iconSize = 0;
        if (typeof manifest.icons == 'object') {
            for (var size in manifest.icons) {
                if (+size > iconSize) {
                    iconSize = +size;
                    iconSrc = 'www/' + manifest.icons[size];
                }
            }
        }
        var template = CONFIG_XML_TEMPLATE.replace(/__ICON_SRC__/, iconSrc);
        var analyzedManifest = cca.analyseManifest(manifest);
        var configXmlDom = new DOMParser().parseFromString(template, 'text/xml');
        cca.updateConfigXml(manifest, analyzedManifest, configXmlDom);
        return new XMLSerializer().serializeToString(configXmlDom);
    }

    /* global myApp */
    myApp.factory('CrxInstaller', ['$q', 'Installer', 'AppsService', 'ResourcesLoader', 'pluginDepsMap', function($q, Installer, AppsService, ResourcesLoader, pluginDepsMap) {

        function CrxInstaller() {
            this.mergedManifestJson_ = null;
        }
        CrxInstaller.prototype = Object.create(Installer.prototype);
        CrxInstaller.prototype.constructor = CrxInstaller;
        CrxInstaller.type = 'chrome';

        CrxInstaller.prototype.initFromJson = function(json) {
            var self = this;
            return Installer.prototype.initFromJson.call(this, json)
            .then(function() {
                return self.readManifest_();
            }).then(function() {
                return self.updateDerivedFiles();
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
                if (path == 'www/manifest.json' || (path == 'www/manifest.mobile.json' && self.mergedManifestJson_)) {
                    return self.readManifest_()
                    .then(function() {
                        return self.updateDerivedFiles();
                    });
                }
            });
        };

        CrxInstaller.prototype.readManifest_ = function() {
            var self = this;
            return cca.parseAndMergeManifests(this.directoryManager.rootURL + 'www/manifest.json', 'android', ResourcesLoader.readFileContents, $q)
            .then(function(m) {
                self.mergedManifestJson_ = m;
            });
        };

        CrxInstaller.prototype.updateDerivedFiles = function() {
            var self = this;
            var contents = generateConfigXmlData(this.mergedManifestJson_);
            var combinedEtag = this.directoryManager.getAssetEtag('www/manifest.json') + this.directoryManager.getAssetEtag('www/manifest.mobile.json');
            return this.directoryManager.writeFile(contents, 'config.xml', combinedEtag)
            .then(function() {
                return self.updateCordovaPluginsFile(self.directoryManager.getAssetEtag('www/manifest.json'));
            });
        };

        function expandPluginIdsWithDeps(ids) {
            var idMap = {};
            function addAll(arr) {
                arr.forEach(function(pluginId) {
                    if (!idMap[pluginId]) {
                        idMap[pluginId] = true;
                        var deps = pluginDepsMap[pluginId];
                        if (deps) {
                            addAll(deps);
                        }
                    }
                });
            }
            addAll(ids);
            return Object.keys(idMap);
        }

        CrxInstaller.prototype.getPluginMetadata = function() {
            var pluginIds = cca.analyseManifest(this.mergedManifestJson_).pluginsToBeInstalled;
            pluginIds = expandPluginIdsWithDeps(pluginIds);
            var harnessPluginMetadata = cordova.require('cordova/plugin_list').metadata;
            var ret = {};
            // Make all versions match what is installed.
            for (var i = 0; i < pluginIds.length; ++i) {
                ret[pluginIds[i]] = harnessPluginMetadata[pluginIds[i]] || '0';
            }
            return ret;
        };

        return CrxInstaller;
    }]);

    myApp.run(['CrxInstaller', 'AppsService', function(CrxInstaller, AppsService) {
        AppsService.registerInstallerFactory(CrxInstaller);
    }]);
})();

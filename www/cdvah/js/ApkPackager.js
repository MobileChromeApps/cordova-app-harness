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
(function() {
    'use strict';
    /* global myApp */
    /* global cca */
    myApp.factory('ApkPackager', ['$q', 'ResourcesLoader', function($q, ResourcesLoader) {

        // copied from android_parser.js
        function defaultVersionCode(version) {
            var nums = version.split('-')[0].split('.').map(Number);
            var versionCode = nums[0] * 10000 + nums[1] * 100 + nums[2];
            return versionCode;
        }

        function extractAppMetadata(app) {
            return app.readConfigXml()
            .then(function(xmlDoc) {
                var versionCode = xmlDoc.lastChild.getAttribute('android-versionCode');
                if (versionCode) {
                    versionCode = +versionCode;
                } else {
                    versionCode = defaultVersionCode(app.version || '0.0.1');
                }
                // TODO: Add to this the list of android permissions.
                return {
                    'appName': app.appName,
                    'packageName': app.appId,
                    'versionName': app.version,
                    'versionCode': versionCode
                };
            });
        }

        return {
            build: function(app, keyStoreData, keyStorePassword, keyAlias, keyPassword, outputUrl) {
                var wwwDir = app.getWwwDir();
                var workDir = ResourcesLoader.createTmpFileUrl('.apkpackager');
                var keyStoreUrl = workDir + '/keystore';
                var templateUrl = 'file:///android_asset/www/apk-template';
                // TODO: Need to do post-prepare logic for locales
                return ResourcesLoader.writeFileContents(keyStoreUrl, cca.decodeBase64(keyStoreData))
                .then(function() {
                    return extractAppMetadata(app);
                }).then(function(appMetadata) {
                    var deferred = $q.defer();
                    cordova.exec(deferred.resolve, deferred.reject, 'APKPackager', 'packageAPK', [workDir + '/playground/', templateUrl, wwwDir, outputUrl, keyStoreUrl, keyStorePassword, keyAlias, keyPassword, appMetadata]);
                    return deferred.promise;
                }).finally(function() {
                    return ResourcesLoader.delete(workDir);
                });
            }
        };
    }]);
})();

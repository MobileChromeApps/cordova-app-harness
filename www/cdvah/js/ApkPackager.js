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

        function extractAppMetadata(app) {
            // TODO: Add to this the list of android permissions.
            return {
                'appName': app.getAppName(),
                'packageName': app.getConfigXmlId(),
                'versionName': app.getVersion(),
                'versionCode': app.getAndroidVersionCode()
            };
        }

        return {
            build: function(app, signingOpts, outputUrl) {
                var wwwDir = app.getWwwDir();
                var workDir = ResourcesLoader.createTmpFileUrl('.apkpackager');
                var templateUrl = 'file:///android_asset/www/apk-template';
                var execSigningOpts = {
                    'keyPassword': signingOpts.keyPassword
                };
                // TODO: Need to do post-prepare logic for locales
                return $q.when().then(function() {
                    if (signingOpts.privateKeyData) {
                        var privateKeyUrl = workDir + '/privatekey';
                        var certificateUrl = workDir + '/certificate';
                        execSigningOpts['privateKeyUrl'] = privateKeyUrl;
                        execSigningOpts['certificateUrl'] = certificateUrl;
                        return ResourcesLoader.writeFileContents(privateKeyUrl, cca.decodeBase64(signingOpts.privateKeyData))
                        .then(function() {
                            return ResourcesLoader.writeFileContents(certificateUrl, cca.decodeBase64(signingOpts.certificateData));
                        });
                    }
                    var keyStoreUrl = workDir + '/keystore';
                    execSigningOpts['keyStoreUrl'] = keyStoreUrl;
                    execSigningOpts['storePassword'] = signingOpts.storePassword;
                    execSigningOpts['keyAlias'] = signingOpts.keyAlias;
                    execSigningOpts['storeType'] = signingOpts.storeType;
                    return ResourcesLoader.writeFileContents(keyStoreUrl, cca.decodeBase64(signingOpts.storeData));
                }).then(function() {
                    return extractAppMetadata(app);
                }).then(function(appMetadata) {
                    var deferred = $q.defer();
                    cordova.exec(deferred.resolve, deferred.reject, 'APKPackager', 'packageAPK', [workDir + '/playground/', templateUrl, wwwDir, outputUrl, execSigningOpts, appMetadata]);
                    return deferred.promise;
                }).finally(function() {
                    return ResourcesLoader.delete(workDir);
                });
            }
        };
    }]);
})();

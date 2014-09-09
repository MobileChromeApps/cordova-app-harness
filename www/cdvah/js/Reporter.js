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
    myApp.factory('Reporter', ['$location', '$rootScope', '$q', function($location, $rootScope, $q) {
        // Common parameters.
        var v = 1;
        var tid = 'UA-52080037-1';
        var cid = '12345'; // TODO(maxw): We need to maintain privacy.
        var an = 'CADT';

        // URL base, based on the above parameters.
        var URL_BASE = 'https://www.google-analytics.com/collect?';
        URL_BASE += 'v=' + v;
        URL_BASE += '&tid=' + tid;
        URL_BASE += '&cid=' + cid;
        URL_BASE += '&an=' + an;

        function fetchPermission() {
            var deferred = $q.defer();

            if ($rootScope.reportingPermission === undefined) {
                // We don't have reporting permission in memory, so check storage.
                var reportingPermissionDefault = { reportingPermission: 'empty' };
                var getReportingPermissionCallback = function(data) {
                    if (data.reportingPermission === 'empty') {
                        // Permission hasn't previously been granted or denied.  Ask for permission.
                        $location.path('/permission');
                    } else {
                        // Permission has previously been granted or denied.  Set it globally.
                        $rootScope.reportingPermission = data.reportingPermission;
                    }

                    deferred.resolve();
                };
                // Check local storage for reporting permission.
                chrome.storage.local.get(reportingPermissionDefault, getReportingPermissionCallback);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }

        // This helper function sends a measurement to the given URL.
        function sendMeasurement(url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', encodeURI(url));
            xhr.send(null);
        }

        return {
            fetchPermission: fetchPermission,

            sendEvent: function(eventAction) {
                if ($rootScope.reportingPermission) {
                    var url = URL_BASE;
                    url += '&t=event';
                    url += '&ec=app';
                    url += '&ea=' + eventAction;

                    sendMeasurement(url);
                }
            }
        };
    }]);
})();

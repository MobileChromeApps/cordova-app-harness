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
    /* global analytics */
    /* global chrome */
    /* global myApp */
    myApp.controller('PermissionCtrl', ['$rootScope', '$scope', '$location', 'Reporter', function($rootScope, $scope, $location, Reporter) {
        // By default, the checkbox should be checked.
        $scope.formData = { reportingPermissionCheckbox: true };

        $scope.saveReportingPermission = function() {
            var getConfigCallback = function(config) {
                // Set tracking according to the user's response.
                var permitted = $scope.formData.reportingPermissionCheckbox;
                config.setTrackingPermitted(permitted);

                // Track the page view.
                Reporter.sendPageView('permission');
            };

            // Get the config object so we can update tracking permission.
            var service = analytics.getService($rootScope.appTitle);
            service.getConfig().addCallback(getConfigCallback);

            // Note that the app has run, so that we don't show this page again.
            chrome.storage.local.set({ hasRun: true });
            $location.path('/');
        };
    }]);
})();

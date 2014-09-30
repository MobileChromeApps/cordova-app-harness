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
    /* global analytics */
    /* global chrome */
    /* global myApp */
    myApp.factory('Reporter', ['$rootScope', 'APP_VERSION', function($rootScope, APP_VERSION) {
        // This tracking ID identifies our app for Google Analytics.
        var trackingId = 'UA-52080037-1';

        // We rewrite chrome.runtime.getManifest(), since CADT doesn't have a manifest.
        chrome.runtime.getManifest = function() {
            return { version: APP_VERSION };
        };

        // Chrome Platform Analytics objects.
        var service = analytics.getService($rootScope.appTitle);
        var tracker = service.getTracker(trackingId);

        return {
            sendEvent: function(eventCategory, eventAction) {
                tracker.sendEvent(eventCategory, eventAction);
            },

            sendPageView: function(pageName) {
                tracker.sendAppView(pageName);
            }
        };
    }]);
})();

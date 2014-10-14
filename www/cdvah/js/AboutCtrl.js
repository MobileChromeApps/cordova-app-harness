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
    /* global myApp */
    myApp.controller('AboutCtrl', ['$rootScope', '$scope', '$location', 'PluginMetadata', 'Reporter', function($rootScope, $scope, $location, PluginMetadata, Reporter) {
        // Track the page view.
        Reporter.sendPageView('about');

        $scope.plugins = PluginMetadata.availablePlugins().filter(function(p) {
            return !/UrlRemap|appharness/.exec(p.id);
        });

        $scope.goBack = function() {
            $scope.config && $scope.config.setTrackingPermitted($scope.formData.reportingPermissionCheckbox);
            $location.path('/');
        };

        var getConfigCallback = function(config) {
            // Save the config object so we can update it when the user leaves this screen.
            $scope.config = config;

            // Initialize the reporting permission checkbox according to the recorded response.
            var permitted = config.isTrackingPermitted();
            $scope.formData = { reportingPermissionCheckbox: permitted };
        };

        // Get the config object.
        var service = analytics.getService($rootScope.appTitle);
        service.getConfig().addCallback(getConfigCallback);
    }]);
})();

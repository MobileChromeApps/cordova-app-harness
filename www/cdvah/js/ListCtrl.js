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
    /* global myApp */
    myApp.controller('ListCtrl', ['$location', '$scope', '$routeParams', '$q', 'AppsService', 'HarnessServer', 'AppHarnessUI', function ($location, $scope, $routeParams, $q, AppsService, HarnessServer, AppHarnessUI) {
        $scope.app = null;
        $scope.ipAddresses = null;
        $scope.port = null;

        function initialise() {
            $scope.$on('$destroy', function() {
                AppsService.onAppListChange = null;
            });
            $scope.port = 2424;
            AppsService.onAppListChange = loadAppsList;

            AppHarnessUI.setEventHandler(function(eventName) {
                if (eventName == 'showMenu') { // two-finger double tap
                    return AppHarnessUI.setVisible(false);
                } else if (eventName == 'hideMenu') {
                    return AppHarnessUI.setVisible(true);
                } else if (eventName == 'destroyed') {
                    return loadAppsList();
                } else {
                    console.warn('Unknown message from AppHarnessUI: ' + eventName);
                }
            });

            return loadAppsList()
            .then(function() {
                return HarnessServer.start();
            }).then(function() {
                var getInfoCallback = function() {
                    HarnessServer.getListenAddress(/* skipCache */ true)
                    .then(function(value) {
                        $scope.ipAddresses = value ? value.split(', ') : [];
                    });
                };

                // When getInfo is called, the callback is retained and called every time network info changes.
                // The callback updates the IP.
                navigator.connection.getInfo(getInfoCallback);
            }, function() {
                $scope.ipAddresses = [];
            });
        }

        function loadAppsList() {
            return AppsService.getAppList()
            .then(function(){
                $scope.app = AppsService.getLastAccessedApp();
                $scope.isRunning = !!AppsService.getActiveApp();
            }, function(error){
                console.error(error);
            });
        }

        $scope.launchApp = function(app){
            return AppsService.launchApp(app)
            .then(null, function(error){
                console.error(error);
            });
        };

        $scope.resumeApp = function(){
            return AppHarnessUI.setVisible(true);
        };

        $scope.stopApp = function(){
            return AppsService.quitApp();
        };

        $scope.removeApp = function() {
            // Uninstall all apps, since we only show the latest one, this most closely matches their intention.
            return AppsService.uninstallAllApps();
        };

        $scope.showDetails = function(index, ev) {
            ev.preventDefault();
            $location.path('/details/' + index);
        };

        return initialise();
    }]);
})();



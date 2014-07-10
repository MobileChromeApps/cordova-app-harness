/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/
package org.apache.appharness;

import org.apache.cordova.engine.crosswalk.XWalkCordovaView;
import org.apache.cordova.engine.crosswalk.XWalkCordovaWebView;
import org.xwalk.core.XWalkPreferences;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;

class CustomCrosswalkWebView extends XWalkCordovaWebView implements CustomCordovaWebView {
    private static final String LOG_TAG = "AppHarnessUI";

    private static boolean didSetXwalkPrefs = false;

    private AppHarnessUI parent;
    private boolean stealTapEvents;

    CustomCrosswalkWebView(AppHarnessUI parent, Context context) {
        super((XWalkCordovaView)null);
        this.parent = parent;

        if (!didSetXwalkPrefs) {
            // Throws an exception if we try to set it multiple times.
            XWalkPreferences.setValue(XWalkPreferences.ANIMATABLE_XWALK_VIEW, true);
            didSetXwalkPrefs = true;
        }
        webview = new CustomXwalkView(context);
    }

    @Override
    public void setStealTapEvents(boolean value){
        stealTapEvents=value;
    }

    @Override
    public void evaluateJavascript(String script) {
        getView().evaluateJavascript(script, null);
    }
    
    @Override
    public boolean backHistory() {
        if (getView().getNavigationHistory().canGoBack()) {
            return super.backHistory();
        }
        if (parent.slaveVisible) {
            parent.sendEvent("showMenu");
            return true;
        }
        // Should never get here since the webview does not have focus.
        Log.w(LOG_TAG, "Somehow back button was pressed when app not visible");
        return false;
    }

    private class CustomXwalkView extends XWalkCordovaView {
        TwoFingerDoubleTapGestureDetector twoFingerTapDetector;

        public CustomXwalkView(Context context) {
            super(context, null);
            twoFingerTapDetector = new TwoFingerDoubleTapGestureDetector(parent);
        }

        @Override
        public boolean onTouchEvent(MotionEvent e) {
            if (stealTapEvents) {
                if (e.getAction() == MotionEvent.ACTION_UP) {
                    parent.sendEvent("hideMenu");
                }
                return true;
            }
            return super.onTouchEvent(e);
        }
        @Override
        public boolean onInterceptTouchEvent(MotionEvent e) {
            if (stealTapEvents) {
                if (e.getAction() == MotionEvent.ACTION_UP) {
                    parent.sendEvent("hideMenu");
                }
                return true;
            }
            twoFingerTapDetector.onTouchEvent(e);
            return super.onInterceptTouchEvent(e);
        }

        @SuppressLint("NewApi")
        protected void onSizeChanged(int w, int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            // Needed for the view to stay in the bottom when rotating.
            setPivotY(h);
        }
    }

}

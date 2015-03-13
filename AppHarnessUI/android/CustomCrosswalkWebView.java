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

import org.apache.cordova.CordovaPreferences;
import org.crosswalk.engine.XWalkCordovaView;
import org.crosswalk.engine.XWalkWebViewEngine;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;

class CustomCrosswalkWebView extends XWalkWebViewEngine implements CustomCordovaWebView {
    private static final String LOG_TAG = "AppHarnessUI";

    private AppHarnessUI parent;
    private boolean stealTapEvents;
    private TwoFingerDoubleTapGestureDetector twoFingerTapDetector;

    CustomCrosswalkWebView(AppHarnessUI parent, Context context, CordovaPreferences preferences) {
        super(new CustomXwalkView(context, preferences));
        this.parent = parent;
        ((CustomXwalkView)webView).parent = this;
        twoFingerTapDetector = new TwoFingerDoubleTapGestureDetector(parent);
    }

    @Override
    public void setStealTapEvents(boolean value){
        stealTapEvents=value;
    }

    @Override
    public void evaluateJavascript(String script) {
        webView.evaluateJavascript(script, null);
    }
    
    @Override
    public boolean goBack() {
        if (webView.getNavigationHistory().canGoBack()) {
            return super.goBack();
        }
        if (parent.slaveVisible) {
            parent.sendEvent("showMenu");
            return true;
        }
        // Should never get here since the webview does not have focus.
        Log.w(LOG_TAG, "Somehow back button was pressed when app not visible");
        return false;
    }

    private static class CustomXwalkView extends XWalkCordovaView {
        CustomCrosswalkWebView parent;
        public CustomXwalkView(Context context, CordovaPreferences preferences) {
            super(context, preferences);
        }

        @Override
        public boolean onTouchEvent(MotionEvent e) {
            if (parent.stealTapEvents) {
                if (e.getAction() == MotionEvent.ACTION_UP) {
                    parent.parent.sendEvent("hideMenu");
                }
                return true;
            }
            return super.onTouchEvent(e);
        }
        @Override
        public boolean onInterceptTouchEvent(MotionEvent e) {
            if (parent.stealTapEvents) {
                if (e.getAction() == MotionEvent.ACTION_UP) {
                    parent.parent.sendEvent("hideMenu");
                }
                return true;
            }
            parent.twoFingerTapDetector.onTouchEvent(e);
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

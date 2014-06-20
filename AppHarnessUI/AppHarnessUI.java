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

import java.util.HashSet;
import java.util.Set;

import org.apache.cordova.AndroidChromeClient;
import org.apache.cordova.AndroidWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.LinearLayoutSoftKeyboardDetect;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import org.apache.cordova.engine.crosswalk.XWalkCordovaWebView;
import org.apache.cordova.engine.crosswalk.XWalkCordovaWebViewClient;
import org.apache.cordova.engine.crosswalk.XWalkCordovaChromeClient;
import org.xwalk.core.XWalkView;
import org.xwalk.core.XWalkPreferences;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.ViewPropertyAnimator;
import android.view.animation.DecelerateInterpolator;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

@TargetApi(Build.VERSION_CODES.HONEYCOMB)
public class AppHarnessUI extends CordovaPlugin {
    private static final String LOG_TAG = "AppHarnessUI";
    ViewGroup contentView;
    View origMainView;
    CustomCordovaWebView slaveWebView;
    boolean slaveVisible;
    CallbackContext eventsCallback;
    LinearLayoutSoftKeyboardDetect layoutView;

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if ("create".equals(action)) {
            final String url = args.getString(0);
            JSONArray pluginIdWhitelist = args.getJSONArray(1);
            final Set<String> pluginIdWhitelistAsSet = new HashSet<String>(pluginIdWhitelist.length());
            for (int i = 0; i < pluginIdWhitelist.length(); ++i) {
                pluginIdWhitelistAsSet.add(pluginIdWhitelist.getString(i));
            }
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    create(url, pluginIdWhitelistAsSet, callbackContext);
                }
            });
        } else if ("destroy".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    destroy(callbackContext);
                }
            });
        } else if ("setVisible".equals(action)) {
            final boolean value = args.getBoolean(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    setSlaveVisible(value, callbackContext);
                }
            });
        } else if ("evalJs".equals(action)) {
            final String code = args.getString(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    evalJs(code, callbackContext);
                }
            });
        } else if ("events".equals(action)) {
            eventsCallback = callbackContext;
        } else {
            return false;
        }
        return true;
    }

    public void sendEvent(String eventName) {
        if (eventsCallback != null) {
            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, eventName);
            pluginResult.setKeepCallback(true);
            eventsCallback.sendPluginResult(pluginResult );
        }
    }

    private void evalJs(String code, CallbackContext callbackContext) {
        if (slaveWebView == null) {
            Log.w(LOG_TAG, "Not evaluating JS since no app is active");
        } else {
            slaveWebView.evaluateJavascript(code);
        }
        callbackContext.success();
    }

    private void create(String url, Set<String> pluginIdWhitelist, CallbackContext callbackContext) {
        CordovaActivity activity = (CordovaActivity)cordova.getActivity();

        if (slaveWebView != null) {
            Log.w(LOG_TAG, "create: already exists");
        } else {
            slaveWebView = new CustomCrosswalkWebView(activity);
        }
        {
            initWebView(slaveWebView);
            if (activity.getBooleanProperty("DisallowOverscroll", false)) {
                slaveWebView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            }
            slaveWebView.clearCache(true);
            slaveWebView.clearHistory();
            slaveWebView.getPluginManager().setPluginIdWhitelist(pluginIdWhitelist);
            slaveWebView.loadUrl(url);
            View newView = (View)slaveWebView.getParent();
            contentView.addView(newView);
            slaveVisible = true;
            // Back button capturing breaks without these:
            newView.requestFocus();

        }
        callbackContext.success();
    }

    private void destroy(CallbackContext callbackContext) {
        if (slaveWebView == null) {
            Log.w(LOG_TAG, "destroy: already destroyed");
        } else {
            slaveWebView.loadUrl("data:text/plain;charset=utf-8,");
            contentView.removeView((View)slaveWebView.getParent());
            origMainView.requestFocus();

            slaveWebView.getView().setScaleX(1.0f);
            slaveWebView.getView().setScaleY(1.0f);
            slaveWebView.SetStealTapEvents(false);
            slaveVisible = false;
            sendEvent("destroyed");
        }
        if (eventsCallback != null) {
            eventsCallback.success("");
            eventsCallback = null;
        }
        callbackContext.success();
    }

    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    private void setSlaveVisible(boolean value, CallbackContext callbackContext) {
        if (value == slaveVisible) {
            return;
        }
        if (slaveWebView == null) {
            Log.w(LOG_TAG, "setSlaveVisible: slave not created");
        } else {
            slaveVisible = value;
            ViewPropertyAnimator anim = slaveWebView.getView().animate();
            // Note: Pivot is set in onSizeChanged.
            if (value) {
                anim.scaleX(1.0f).scaleY(1.0f);
                ((View)slaveWebView.getParent()).requestFocus();
            } else {
                anim.scaleX(.25f).scaleY(.25f);
                origMainView.requestFocus();
            }
            slaveWebView.SetStealTapEvents( !value);
            anim.setDuration(300).setInterpolator(new DecelerateInterpolator(2.0f)).start();
        }
        if (callbackContext != null) {
            callbackContext.success();
        }
    }

    private void initWebView(final CustomCordovaWebView newWebView) {
        CordovaActivity activity = (CordovaActivity)cordova.getActivity();
        if (contentView == null) {
            contentView = (ViewGroup)activity.findViewById(android.R.id.content);
            origMainView = contentView.getChildAt(0);
        }

        if(layoutView == null) {
            layoutView = new LinearLayoutSoftKeyboardDetect(activity, contentView.getWidth(), contentView.getHeight());
            layoutView.addView(newWebView.getView());
        }
        layoutView.setOrientation(LinearLayout.VERTICAL);

//        layoutView.setBackground(origRootView.getBackground());
        layoutView.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.BOTTOM | Gravity.LEFT));

        newWebView.setWebViewClient(newWebView.makeWebViewClient());
        newWebView.setWebChromeClient(newWebView.makeWebChromeClient());

        newWebView.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                1.0F));
        newWebView.getView().setVisibility(View.VISIBLE);
    }


}

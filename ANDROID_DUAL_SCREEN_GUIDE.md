# Android Dual Screen Guide

To enable dual-screen functionality on your Android All-in-One device (Presentation API), you cannot use a standard browser like Chrome. You must wrap this web app in a native Android wrapper that handles the second screen.

Here is the Kotlin implementation for the `Presentation` class and `MainActivity`.

## 1. CustomerPresentation.kt
This class handles the secondary screen content (WebView).

```kotlin
package com.damaf.pos // Change to your package name

import android.app.Presentation
import android.content.Context
import android.os.Bundle
import android.view.Display
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class CustomerPresentation(context: Context, display: Display) : Presentation(context, display) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.presentation_customer) // Make sure to create this layout resource

        val webView = findViewById<WebView>(R.id.secondScreenWebView)
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        
        // Disable zooming
        webSettings.setSupportZoom(false)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                view.loadUrl(url)
                return true
            }
        }

        // LOAD THE LIVE VIEW URL HERE
        // Replace with your Vercel URL or Local IP
        webView.loadUrl("https://your-app-url.vercel.app/display/client") 
    }
}
```

## 2. presentation_customer.xml (Layout)
Place this in `res/layout/`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/secondScreenWebView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>
```

## 3. MainActivity.kt Integration
Detect displays and launch presentation.

```kotlin
import android.media.MediaRouter
import android.content.Context
import android.view.Display // etc...

class MainActivity : AppCompatActivity() {

    private var presentation: CustomerPresentation? = null
    private var mediaRouter: MediaRouter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize MediaRouter to listen for displays
        mediaRouter = getSystemService(Context.MEDIA_ROUTER_SERVICE) as MediaRouter
    }

    override fun onResume() {
        super.onResume()
        updatePresentation()
    }

    override fun onStop() {
        super.onStop()
        // Don't dismiss if you want it to persist, but usually good practice to clean up if app minimize
        // presentation?.dismiss()
        // presentation = null
    }

    private fun updatePresentation() {
        // Get secondary display
        val route = mediaRouter?.getSelectedRoute(MediaRouter.ROUTE_TYPE_LIVE_VIDEO)
        val display = route?.presentationDisplay

        if (display != null) {
            presentation = CustomerPresentation(this, display)
            try {
                presentation?.show()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
```

## 4. AndroidManifest.xml
Ensure you have internet permissions.

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

package com.damafapp.pos

import android.app.Presentation
import android.content.Context
import android.os.Bundle
import android.view.Display
import android.webkit.WebView
import android.webkit.WebViewClient
import android.view.ViewGroup

class CustomerPresentation(context: Context, display: Display) : Presentation(context, display) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Dynamic WebView setup
        val webView = WebView(context)
        webView.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        setContentView(webView)

        // Configuration
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()

        // CHANGE THIS URL TO YOUR DEPLOYED URL
        // Example: https://damafapp-six.vercel.app/display/client
        webView.loadUrl("https://damafapp-six.vercel.app/display/client") 
    }
}

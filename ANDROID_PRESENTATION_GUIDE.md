# Android Presentation API Guide for Dual Screen POS

This guide explains how to use the standard Android Presentation API to launch a WebView on a secondary screen (Customer Display) while keeping the main screen (Cashier POS) active.

## 1. Dependencies

In your `app/build.gradle` (Android project), ensure you have standard dependencies. No special libraries are needed for basic Presentation API, as it is part of the Android framework.

## 2. Create the Customer Presentation Class

Create a new Kotlin class `CustomerPresentation.kt`. This class extends `Presentation` and will hold the WebView for the secondary screen.

```kotlin
import android.app.Presentation
import android.content.Context
import android.os.Bundle
import android.view.Display
import android.webkit.WebView
import android.webkit.WebViewClient

class CustomerPresentation(context: Context, display: Display) : Presentation(context, display) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Setup the layout programmatically or via XML
        // For simplicity, we create a WebView programmatically here
        val webView = WebView(context)
        setContentView(webView)

        // Configure WebView
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()

        // Load the Client URL
        // REPLACE WITH YOUR ACTUAL LOCAL OR HOSTED URL
        webView.loadUrl("https://your-app-url.com/display/client") 
    }
}
```

## 3. Manage the Presentation in Activity

In your `MainActivity.kt`, you need to detect displays and show the `CustomerPresentation`.

```kotlin
import android.content.Context
import android.hardware.display.DisplayManager
import android.os.Bundle
import android.view.Display
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var customerPresentation: CustomerPresentation? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // MAIN SCREEN: Load your Admin POS URL in the main activity WebView
        // val mainWebView = findViewById<WebView>(R.id.main_webview)
        // mainWebView.loadUrl("https://your-app-url.com/admin/pos")

        // SECOND SCREEN: Check for secondary displays
        val displayManager = getSystemService(Context.DISPLAY_SERVICE) as DisplayManager
        val displays = displayManager.displays

        if (displays.size > 1) {
            // Usually the second display (index 1) is the external one
            showPresentation(displays[1])
        }

        // Optional: Listen for display changes (plug/unplug)
        displayManager.registerDisplayListener(object : DisplayManager.DisplayListener {
            override fun onDisplayAdded(displayId: Int) {
                val newDisplay = displayManager.getDisplay(displayId)
                if (newDisplay != null) showPresentation(newDisplay)
            }
            override fun onDisplayRemoved(displayId: Int) {
                // Handled automatically usually, or close presentation
            }
            override fun onDisplayChanged(displayId: Int) {}
        }, null)
    }

    private fun showPresentation(display: Display) {
        customerPresentation = CustomerPresentation(this, display)
        customerPresentation?.show()
    }

    override fun onDestroy() {
        customerPresentation?.dismiss()
        super.onDestroy()
    }
}
```

## 4. Manifest Permissions

Ensure you have internet capability in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## 5. Deployment (Mac to Android Device)

Since you are developing on a Mac and the All-in-One is a separate Android device:

### Step 1: Install Android Studio on Mac
1.  Download [Android Studio for Mac](https://developer.android.com/studio).
2.  Install it and let it download the necessary Android SDK components.
3.  Open Android Studio and select **"Open"**.
4.  Navigate to the `android_wrapper` folder inside your project (`/Users/sebamaza/Desktop/PROYECTOS DEV/DamafAPP v2/android_wrapper`) and open it.

### Step 2: Prepare the Android Device
1.  On the All-in-One: Go to **Settings > About Tablet** (or About Device).
2.  Find **Build Number** and tap it 7 times until it says "You are a developer".
3.  Go back to **Settings > System > Developer Options**.
4.  Enable **USB Debugging**.

### Step 3: Connect and Run
1.  Connect the Android device to your Mac via USB cable.
2.  On the Android device, a popup will appear: "Allow USB Debugging?". Tap **Allow**.
3.  In Android Studio (on your Mac), look at the top toolbar. You should see your device name (e.g., "Samsung", "All-in-One") in the device dropdown next to the green Play button.
4.  Click the **Run (Green Play Arrow)** button.
5.  Android Studio will build the app and install it automatically on your device.

### Step 4: Verify
1.  The app will launch on the main screen showing the `/admin/pos` page.
2.  The secondary screen should automatically light up with the `/display/client` page.
3.  **Note**: Once installed via "Run", you can unplug the USB cable. The app is now installed on the device and can be launched from the app drawer anytime.

## 6. How to Build a Standalone APK file
If you want to generate an APK file to share or install later without a computer:
1.  In Android Studio, go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2.  Wait for the process to finish. A popup will appear in the bottom right: "APK(s) generated successfully".
3.  Click **"locate"** in that popup.
4.  It will open a Finder window showing `app-debug.apk`.
5.  You can copy this file to your Android device and install it manually.

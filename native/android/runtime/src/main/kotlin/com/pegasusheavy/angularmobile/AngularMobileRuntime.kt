package com.pegasusheavy.angularmobile

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import org.json.JSONObject
import org.json.JSONArray

/**
 * Angular Mobile Runtime
 *
 * Main entry point for the Angular Platform Mobile native runtime.
 * Hosts the JavaScript bundle and provides the bridge to native views.
 */
class AngularMobileRuntime(
    private val context: Context,
    private val config: RuntimeConfig = RuntimeConfig()
) {
    companion object {
        private const val TAG = "AngularMobile"
        private const val BRIDGE_NAME = "__ANDROID_BRIDGE__"
    }

    private lateinit var webView: WebView
    private val viewRegistry = ViewRegistry()
    private val viewFactory = ViewFactory(context, viewRegistry)
    private val eventDispatcher = EventDispatcher()

    private var jsCallback: ((String) -> Unit)? = null
    private var isReady = false

    /**
     * Initialize the runtime with a root container
     */
    fun initialize(rootContainer: android.view.ViewGroup) {
        viewRegistry.setRootContainer(rootContainer)
        setupWebView()

        if (config.debug) {
            Log.d(TAG, "Angular Mobile Runtime initialized")
        }
    }

    /**
     * Load the JavaScript bundle
     */
    fun loadBundle(bundleUrl: String) {
        webView.loadUrl(bundleUrl)
    }

    /**
     * Load the JavaScript bundle from assets
     */
    fun loadBundleFromAssets(assetPath: String = "bundle/index.html") {
        webView.loadUrl("file:///android_asset/$assetPath")
    }

    private fun setupWebView() {
        webView = WebView(context).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false

                if (config.debug) {
                    WebView.setWebContentsDebuggingEnabled(true)
                }
            }

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    isReady = true
                    if (config.debug) {
                        Log.d(TAG, "Bundle loaded: $url")
                    }
                }
            }

            // Add the native bridge
            addJavascriptInterface(NativeBridge(), BRIDGE_NAME)
        }
    }

    /**
     * Send a message to the JavaScript side
     */
    fun sendToJS(message: String) {
        if (!isReady) {
            Log.w(TAG, "Runtime not ready, message queued")
            return
        }

        val escapedMessage = message.replace("\\", "\\\\").replace("\"", "\\\"")
        val script = "window.__handleNativeMessage && window.__handleNativeMessage(\"$escapedMessage\")"

        webView.post {
            webView.evaluateJavascript(script) { result ->
                if (config.debug) {
                    Log.d(TAG, "JS response: $result")
                }
            }
        }
    }

    /**
     * Native bridge exposed to JavaScript
     */
    inner class NativeBridge {

        @JavascriptInterface
        fun postMessage(messageJson: String) {
            try {
                val message = JSONObject(messageJson)
                handleMessage(message)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to parse message: $messageJson", e)
                sendError(null, "Failed to parse message: ${e.message}")
            }
        }

        @JavascriptInterface
        fun registerCallback(callbackName: String) {
            // JavaScript will call this to register for callbacks
            if (config.debug) {
                Log.d(TAG, "Callback registered: $callbackName")
            }
        }
    }

    /**
     * Handle incoming message from JavaScript
     */
    private fun handleMessage(message: JSONObject) {
        val type = message.optString("type")
        val id = message.optString("id")
        val payload = message.optJSONObject("payload") ?: JSONObject()

        if (config.debug) {
            Log.d(TAG, "Received: $type")
        }

        try {
            when (type) {
                // View Operations
                "createView" -> handleCreateView(id, payload)
                "updateView" -> handleUpdateView(id, payload)
                "removeView" -> handleRemoveView(id, payload)
                "appendChild" -> handleAppendChild(id, payload)
                "insertChild" -> handleInsertChild(id, payload)
                "removeChild" -> handleRemoveChild(id, payload)
                "setRootView" -> handleSetRootView(id, payload)

                // Batch Operations
                "batch", "batchOperations" -> handleBatch(id, payload)

                // Measurements
                "measureView" -> handleMeasureView(id, payload)

                // Focus
                "focus" -> handleFocus(id, payload)
                "blur" -> handleBlur(id, payload)

                // Events
                "addEventListener" -> handleAddEventListener(id, payload)
                "removeEventListener" -> handleRemoveEventListener(id, payload)

                else -> {
                    Log.w(TAG, "Unknown message type: $type")
                    sendError(id, "Unknown message type: $type")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling message: $type", e)
            sendError(id, e.message ?: "Unknown error")
        }
    }

    // ==================== View Operations ====================

    private fun handleCreateView(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val viewType = payload.getString("viewType")
        val props = payload.optJSONObject("props") ?: JSONObject()

        val view = viewFactory.createView(viewType, viewId, props)

        if (view != null) {
            viewRegistry.register(viewId, view)
            sendSuccess(messageId, JSONObject().put("viewId", viewId))
        } else {
            sendError(messageId, "Failed to create view of type: $viewType")
        }
    }

    private fun handleUpdateView(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val props = payload.optJSONObject("props") ?: JSONObject()

        val view = viewRegistry.get(viewId)
        if (view != null) {
            viewFactory.updateView(view, props)
            sendSuccess(messageId)
        } else {
            sendError(messageId, "View not found: $viewId")
        }
    }

    private fun handleRemoveView(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")

        viewRegistry.unregister(viewId)
        sendSuccess(messageId)
    }

    private fun handleAppendChild(messageId: String, payload: JSONObject) {
        val parentId = payload.getString("parentId")
        val childId = payload.getString("childId")

        val parent = viewRegistry.get(parentId) as? android.view.ViewGroup
        val child = viewRegistry.get(childId)

        if (parent != null && child != null) {
            parent.addView(child)
            sendSuccess(messageId)
        } else {
            sendError(messageId, "Parent or child not found")
        }
    }

    private fun handleInsertChild(messageId: String, payload: JSONObject) {
        val parentId = payload.getString("parentId")
        val childId = payload.getString("childId")
        val index = payload.getInt("index")

        val parent = viewRegistry.get(parentId) as? android.view.ViewGroup
        val child = viewRegistry.get(childId)

        if (parent != null && child != null) {
            parent.addView(child, index)
            sendSuccess(messageId)
        } else {
            sendError(messageId, "Parent or child not found")
        }
    }

    private fun handleRemoveChild(messageId: String, payload: JSONObject) {
        val parentId = payload.getString("parentId")
        val childId = payload.getString("childId")

        val parent = viewRegistry.get(parentId) as? android.view.ViewGroup
        val child = viewRegistry.get(childId)

        if (parent != null && child != null) {
            parent.removeView(child)
            sendSuccess(messageId)
        } else {
            sendError(messageId, "Parent or child not found")
        }
    }

    private fun handleSetRootView(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val view = viewRegistry.get(viewId)

        if (view != null) {
            viewRegistry.getRootContainer()?.let { root ->
                root.removeAllViews()
                root.addView(view)
            }
            sendSuccess(messageId)
        } else {
            sendError(messageId, "View not found: $viewId")
        }
    }

    private fun handleBatch(messageId: String, payload: JSONObject) {
        val operations = payload.optJSONArray("operations")
            ?: payload.optJSONArray("messages")
            ?: JSONArray()

        for (i in 0 until operations.length()) {
            val op = operations.getJSONObject(i)
            handleMessage(op)
        }

        sendSuccess(messageId)
    }

    private fun handleMeasureView(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val view = viewRegistry.get(viewId)

        if (view != null) {
            val location = IntArray(2)
            view.getLocationOnScreen(location)

            val result = JSONObject().apply {
                put("x", location[0])
                put("y", location[1])
                put("width", view.width)
                put("height", view.height)
            }
            sendSuccess(messageId, result)
        } else {
            sendError(messageId, "View not found: $viewId")
        }
    }

    private fun handleFocus(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val view = viewRegistry.get(viewId)

        view?.requestFocus()
        sendSuccess(messageId)
    }

    private fun handleBlur(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val view = viewRegistry.get(viewId)

        view?.clearFocus()
        sendSuccess(messageId)
    }

    private fun handleAddEventListener(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val eventType = payload.getString("eventType")

        eventDispatcher.register(viewId, eventType) { eventData ->
            dispatchEvent(viewId, eventType, eventData)
        }
        sendSuccess(messageId)
    }

    private fun handleRemoveEventListener(messageId: String, payload: JSONObject) {
        val viewId = payload.getString("viewId")
        val eventType = payload.getString("eventType")

        eventDispatcher.unregister(viewId, eventType)
        sendSuccess(messageId)
    }

    // ==================== Response Helpers ====================

    private fun sendSuccess(messageId: String?, data: JSONObject? = null) {
        val response = JSONObject().apply {
            put("id", messageId)
            put("success", true)
            if (data != null) {
                put("data", data)
            }
        }
        sendToJS(response.toString())
    }

    private fun sendError(messageId: String?, error: String) {
        val response = JSONObject().apply {
            put("id", messageId)
            put("success", false)
            put("error", error)
        }
        sendToJS(response.toString())
    }

    /**
     * Dispatch an event to JavaScript
     */
    fun dispatchEvent(viewId: String, eventType: String, payload: JSONObject) {
        val event = JSONObject().apply {
            put("type", "viewEvent")
            put("payload", JSONObject().apply {
                put("viewId", viewId)
                put("eventType", eventType)
                put("payload", payload)
            })
        }
        sendToJS(event.toString())
    }

    /**
     * Clean up resources
     */
    fun destroy() {
        webView.destroy()
        viewRegistry.clear()
        eventDispatcher.clear()
    }
}

/**
 * Runtime configuration
 */
data class RuntimeConfig(
    val debug: Boolean = false,
    val hotReload: Boolean = false,
    val bundleUrl: String? = null
)

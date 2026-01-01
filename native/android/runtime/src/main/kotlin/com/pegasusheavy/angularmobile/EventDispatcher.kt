package com.pegasusheavy.angularmobile

import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

/**
 * Event Dispatcher
 *
 * Manages event subscriptions and dispatches events from native views
 * to the JavaScript side.
 */
class EventDispatcher {

    private val handlers = ConcurrentHashMap<String, MutableMap<String, (JSONObject) -> Unit>>()
    private val globalHandlers = ConcurrentHashMap<String, MutableSet<(JSONObject) -> Unit>>()

    /**
     * Register an event handler for a specific view and event type
     */
    fun register(viewId: String, eventType: String, handler: (JSONObject) -> Unit) {
        val viewHandlers = handlers.getOrPut(viewId) { mutableMapOf() }
        viewHandlers[eventType] = handler
    }

    /**
     * Unregister an event handler
     */
    fun unregister(viewId: String, eventType: String) {
        handlers[viewId]?.remove(eventType)
    }

    /**
     * Unregister all handlers for a view
     */
    fun unregisterView(viewId: String) {
        handlers.remove(viewId)
    }

    /**
     * Register a global event handler
     */
    fun registerGlobal(eventType: String, handler: (JSONObject) -> Unit) {
        val typeHandlers = globalHandlers.getOrPut(eventType) { mutableSetOf() }
        typeHandlers.add(handler)
    }

    /**
     * Unregister a global event handler
     */
    fun unregisterGlobal(eventType: String, handler: (JSONObject) -> Unit) {
        globalHandlers[eventType]?.remove(handler)
    }

    /**
     * Dispatch an event to registered handlers
     */
    fun dispatch(viewId: String, eventType: String, payload: JSONObject) {
        // View-specific handlers
        handlers[viewId]?.get(eventType)?.invoke(payload)

        // Global handlers
        globalHandlers[eventType]?.forEach { handler ->
            handler(payload)
        }
    }

    /**
     * Check if a view has handlers
     */
    fun hasHandlers(viewId: String): Boolean {
        return handlers.containsKey(viewId) && handlers[viewId]?.isNotEmpty() == true
    }

    /**
     * Clear all handlers
     */
    fun clear() {
        handlers.clear()
        globalHandlers.clear()
    }
}

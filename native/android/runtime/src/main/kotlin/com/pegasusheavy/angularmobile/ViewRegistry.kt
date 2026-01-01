package com.pegasusheavy.angularmobile

import android.view.View
import android.view.ViewGroup
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * View Registry
 *
 * Manages the registry of all native views created by Angular Platform Mobile.
 * Provides thread-safe access to views by their IDs.
 */
class ViewRegistry {
    private val views = ConcurrentHashMap<String, View>()
    private val viewIdCounter = AtomicInteger(0)
    private var rootContainer: ViewGroup? = null

    /**
     * Generate a unique view ID
     */
    fun generateViewId(): String {
        return "view_${viewIdCounter.incrementAndGet()}"
    }

    /**
     * Register a view with its ID
     */
    fun register(viewId: String, view: View) {
        views[viewId] = view
        view.tag = viewId
    }

    /**
     * Get a view by ID
     */
    fun get(viewId: String): View? {
        return views[viewId]
    }

    /**
     * Check if a view exists
     */
    fun has(viewId: String): Boolean {
        return views.containsKey(viewId)
    }

    /**
     * Unregister a view and remove from parent
     */
    fun unregister(viewId: String) {
        val view = views.remove(viewId)
        view?.let {
            (it.parent as? ViewGroup)?.removeView(it)
        }
    }

    /**
     * Set the root container for the view hierarchy
     */
    fun setRootContainer(container: ViewGroup) {
        rootContainer = container
    }

    /**
     * Get the root container
     */
    fun getRootContainer(): ViewGroup? {
        return rootContainer
    }

    /**
     * Get all registered view IDs
     */
    fun getAllViewIds(): Set<String> {
        return views.keys.toSet()
    }

    /**
     * Get the total count of registered views
     */
    fun getViewCount(): Int {
        return views.size
    }

    /**
     * Clear all views
     */
    fun clear() {
        views.values.forEach { view ->
            (view.parent as? ViewGroup)?.removeView(view)
        }
        views.clear()
    }

    /**
     * Find view ID by view instance
     */
    fun findViewId(view: View): String? {
        return view.tag as? String ?: views.entries.find { it.value === view }?.key
    }
}

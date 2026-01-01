import Foundation
import UIKit

/// View Registry
///
/// Manages the registry of all native views created by Angular Platform Mobile.
/// Provides thread-safe access to views by their IDs.
public class ViewRegistry {

    // MARK: - Properties

    private var views: [String: UIView] = [:]
    private var viewIdCounter: Int = 0
    private weak var rootContainer: UIView?
    private let lock = NSLock()

    // MARK: - Public API

    /// Generate a unique view ID
    public func generateViewId() -> String {
        lock.lock()
        defer { lock.unlock() }

        viewIdCounter += 1
        return "view_\(viewIdCounter)"
    }

    /// Register a view with its ID
    public func register(viewId: String, view: UIView) {
        lock.lock()
        defer { lock.unlock() }

        views[viewId] = view
        view.accessibilityIdentifier = viewId
    }

    /// Get a view by ID
    public func get(viewId: String) -> UIView? {
        lock.lock()
        defer { lock.unlock() }

        return views[viewId]
    }

    /// Check if a view exists
    public func has(viewId: String) -> Bool {
        lock.lock()
        defer { lock.unlock() }

        return views[viewId] != nil
    }

    /// Unregister a view and remove from parent
    public func unregister(viewId: String) {
        lock.lock()
        let view = views.removeValue(forKey: viewId)
        lock.unlock()

        DispatchQueue.main.async {
            view?.removeFromSuperview()
        }
    }

    /// Set the root container for the view hierarchy
    public func setRootContainer(_ container: UIView) {
        lock.lock()
        defer { lock.unlock() }

        rootContainer = container
    }

    /// Get the root container
    public func getRootContainer() -> UIView? {
        lock.lock()
        defer { lock.unlock() }

        return rootContainer
    }

    /// Get all registered view IDs
    public func getAllViewIds() -> [String] {
        lock.lock()
        defer { lock.unlock() }

        return Array(views.keys)
    }

    /// Get the total count of registered views
    public func getViewCount() -> Int {
        lock.lock()
        defer { lock.unlock() }

        return views.count
    }

    /// Clear all views
    public func clear() {
        lock.lock()
        let allViews = Array(views.values)
        views.removeAll()
        lock.unlock()

        DispatchQueue.main.async {
            allViews.forEach { $0.removeFromSuperview() }
        }
    }

    /// Find view ID by view instance
    public func findViewId(for view: UIView) -> String? {
        lock.lock()
        defer { lock.unlock() }

        if let identifier = view.accessibilityIdentifier, views[identifier] === view {
            return identifier
        }

        return views.first { $0.value === view }?.key
    }
}

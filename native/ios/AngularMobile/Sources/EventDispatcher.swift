import Foundation

/// Event Dispatcher
///
/// Manages event subscriptions and dispatches events from native views
/// to the JavaScript side.
public class EventDispatcher {

    // MARK: - Properties

    private var handlers: [String: [String: (([String: Any]) -> Void)]] = [:]
    private var globalHandlers: [String: [([String: Any]) -> Void]] = [:]
    private let lock = NSLock()

    // MARK: - Public API

    /// Register an event handler for a specific view and event type
    public func register(viewId: String, eventType: String, handler: @escaping ([String: Any]) -> Void) {
        lock.lock()
        defer { lock.unlock() }

        if handlers[viewId] == nil {
            handlers[viewId] = [:]
        }
        handlers[viewId]?[eventType] = handler
    }

    /// Unregister an event handler
    public func unregister(viewId: String, eventType: String) {
        lock.lock()
        defer { lock.unlock() }

        handlers[viewId]?.removeValue(forKey: eventType)
    }

    /// Unregister all handlers for a view
    public func unregisterView(viewId: String) {
        lock.lock()
        defer { lock.unlock() }

        handlers.removeValue(forKey: viewId)
    }

    /// Register a global event handler
    public func registerGlobal(eventType: String, handler: @escaping ([String: Any]) -> Void) {
        lock.lock()
        defer { lock.unlock() }

        if globalHandlers[eventType] == nil {
            globalHandlers[eventType] = []
        }
        globalHandlers[eventType]?.append(handler)
    }

    /// Dispatch an event to registered handlers
    public func dispatch(viewId: String, eventType: String, payload: [String: Any]) {
        lock.lock()
        let viewHandler = handlers[viewId]?[eventType]
        let globalTypeHandlers = globalHandlers[eventType]
        lock.unlock()

        // Call view-specific handler
        viewHandler?(payload)

        // Call global handlers
        globalTypeHandlers?.forEach { handler in
            handler(payload)
        }
    }

    /// Check if a view has handlers
    public func hasHandlers(viewId: String) -> Bool {
        lock.lock()
        defer { lock.unlock() }

        return handlers[viewId]?.isEmpty == false
    }

    /// Clear all handlers
    public func clear() {
        lock.lock()
        defer { lock.unlock() }

        handlers.removeAll()
        globalHandlers.removeAll()
    }
}

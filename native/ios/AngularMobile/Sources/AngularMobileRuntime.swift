import Foundation
import WebKit
import UIKit

/// Angular Mobile Runtime
///
/// Main entry point for the Angular Platform Mobile native runtime on iOS.
/// Hosts the JavaScript bundle and provides the bridge to native views.
public class AngularMobileRuntime: NSObject {

    // MARK: - Properties

    private var webView: WKWebView!
    private let viewRegistry = ViewRegistry()
    private let viewFactory: ViewFactory
    private let eventDispatcher = EventDispatcher()
    private let config: RuntimeConfig

    private weak var rootContainer: UIView?
    private var isReady = false
    private var pendingMessages: [String] = []

    // MARK: - Initialization

    public init(config: RuntimeConfig = RuntimeConfig()) {
        self.config = config
        self.viewFactory = ViewFactory(viewRegistry: viewRegistry)
        super.init()
        setupWebView()
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        // Add message handler for bridge communication
        userContentController.add(self, name: "nativeBridge")
        configuration.userContentController = userContentController

        // Enable inline media playback
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self

        if config.debug {
            if #available(iOS 16.4, *) {
                webView.isInspectable = true
            }
        }
    }

    // MARK: - Public API

    /// Initialize the runtime with a root container
    public func initialize(rootContainer: UIView) {
        self.rootContainer = rootContainer
        viewRegistry.setRootContainer(rootContainer)

        if config.debug {
            print("[AngularMobile] Runtime initialized")
        }
    }

    /// Load the JavaScript bundle from a URL
    public func loadBundle(url: URL) {
        let request = URLRequest(url: url)
        webView.load(request)
    }

    /// Load the JavaScript bundle from the app bundle
    public func loadBundleFromBundle(filename: String = "index", extension ext: String = "html") {
        if let url = Bundle.main.url(forResource: filename, withExtension: ext, subdirectory: "bundle") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            print("[AngularMobile] Error: Bundle not found")
        }
    }

    /// Send a message to the JavaScript side
    public func sendToJS(_ message: String) {
        guard isReady else {
            pendingMessages.append(message)
            return
        }

        let escapedMessage = message
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")

        let script = "window.__handleNativeMessage && window.__handleNativeMessage(\"\(escapedMessage)\")"

        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(script) { result, error in
                if let error = error, self?.config.debug == true {
                    print("[AngularMobile] JS error: \(error)")
                }
            }
        }
    }

    /// Dispatch an event to JavaScript
    public func dispatchEvent(viewId: String, eventType: String, payload: [String: Any]) {
        let event: [String: Any] = [
            "type": "viewEvent",
            "payload": [
                "viewId": viewId,
                "eventType": eventType,
                "payload": payload
            ]
        ]

        if let jsonData = try? JSONSerialization.data(withJSONObject: event),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sendToJS(jsonString)
        }
    }

    /// Clean up resources
    public func destroy() {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "nativeBridge")
        viewRegistry.clear()
        eventDispatcher.clear()
    }

    // MARK: - Message Handling

    private func handleMessage(_ message: [String: Any]) {
        guard let type = message["type"] as? String else { return }

        let id = message["id"] as? String
        let payload = message["payload"] as? [String: Any] ?? [:]

        if config.debug {
            print("[AngularMobile] Received: \(type)")
        }

        do {
            switch type {
            // View Operations
            case "createView":
                try handleCreateView(id: id, payload: payload)
            case "updateView":
                try handleUpdateView(id: id, payload: payload)
            case "removeView":
                try handleRemoveView(id: id, payload: payload)
            case "appendChild":
                try handleAppendChild(id: id, payload: payload)
            case "insertChild":
                try handleInsertChild(id: id, payload: payload)
            case "removeChild":
                try handleRemoveChild(id: id, payload: payload)
            case "setRootView":
                try handleSetRootView(id: id, payload: payload)

            // Batch Operations
            case "batch", "batchOperations":
                try handleBatch(id: id, payload: payload)

            // Measurements
            case "measureView":
                try handleMeasureView(id: id, payload: payload)

            // Focus
            case "focus":
                try handleFocus(id: id, payload: payload)
            case "blur":
                try handleBlur(id: id, payload: payload)

            default:
                print("[AngularMobile] Unknown message type: \(type)")
                sendError(id: id, error: "Unknown message type: \(type)")
            }
        } catch {
            print("[AngularMobile] Error: \(error)")
            sendError(id: id, error: error.localizedDescription)
        }
    }

    // MARK: - View Operations

    private func handleCreateView(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String,
              let viewType = payload["viewType"] as? String else {
            throw RuntimeError.invalidPayload
        }

        let props = payload["props"] as? [String: Any] ?? [:]

        if let view = viewFactory.createView(type: viewType, viewId: viewId, props: props) {
            viewRegistry.register(viewId: viewId, view: view)
            sendSuccess(id: id, data: ["viewId": viewId])
        } else {
            throw RuntimeError.viewCreationFailed(viewType)
        }
    }

    private func handleUpdateView(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        let props = payload["props"] as? [String: Any] ?? [:]

        if let view = viewRegistry.get(viewId: viewId) {
            viewFactory.updateView(view, props: props)
            sendSuccess(id: id)
        } else {
            throw RuntimeError.viewNotFound(viewId)
        }
    }

    private func handleRemoveView(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        viewRegistry.unregister(viewId: viewId)
        sendSuccess(id: id)
    }

    private func handleAppendChild(id: String?, payload: [String: Any]) throws {
        guard let parentId = payload["parentId"] as? String,
              let childId = payload["childId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        guard let parent = viewRegistry.get(viewId: parentId),
              let child = viewRegistry.get(viewId: childId) else {
            throw RuntimeError.viewNotFound(parentId)
        }

        parent.addSubview(child)
        sendSuccess(id: id)
    }

    private func handleInsertChild(id: String?, payload: [String: Any]) throws {
        guard let parentId = payload["parentId"] as? String,
              let childId = payload["childId"] as? String,
              let index = payload["index"] as? Int else {
            throw RuntimeError.invalidPayload
        }

        guard let parent = viewRegistry.get(viewId: parentId),
              let child = viewRegistry.get(viewId: childId) else {
            throw RuntimeError.viewNotFound(parentId)
        }

        parent.insertSubview(child, at: index)
        sendSuccess(id: id)
    }

    private func handleRemoveChild(id: String?, payload: [String: Any]) throws {
        guard let childId = payload["childId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        if let child = viewRegistry.get(viewId: childId) {
            child.removeFromSuperview()
        }
        sendSuccess(id: id)
    }

    private func handleSetRootView(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        if let view = viewRegistry.get(viewId: viewId),
           let root = rootContainer {
            root.subviews.forEach { $0.removeFromSuperview() }
            root.addSubview(view)

            // Fill the container
            view.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                view.topAnchor.constraint(equalTo: root.topAnchor),
                view.bottomAnchor.constraint(equalTo: root.bottomAnchor),
                view.leadingAnchor.constraint(equalTo: root.leadingAnchor),
                view.trailingAnchor.constraint(equalTo: root.trailingAnchor)
            ])

            sendSuccess(id: id)
        } else {
            throw RuntimeError.viewNotFound(viewId)
        }
    }

    private func handleBatch(id: String?, payload: [String: Any]) throws {
        let operations = payload["operations"] as? [[String: Any]] ?? payload["messages"] as? [[String: Any]] ?? []

        for op in operations {
            handleMessage(op)
        }

        sendSuccess(id: id)
    }

    private func handleMeasureView(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        if let view = viewRegistry.get(viewId: viewId),
           let window = view.window {
            let frame = view.convert(view.bounds, to: window)

            sendSuccess(id: id, data: [
                "x": frame.origin.x,
                "y": frame.origin.y,
                "width": frame.width,
                "height": frame.height
            ])
        } else {
            throw RuntimeError.viewNotFound(viewId)
        }
    }

    private func handleFocus(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        if let view = viewRegistry.get(viewId: viewId) {
            view.becomeFirstResponder()
        }
        sendSuccess(id: id)
    }

    private func handleBlur(id: String?, payload: [String: Any]) throws {
        guard let viewId = payload["viewId"] as? String else {
            throw RuntimeError.invalidPayload
        }

        if let view = viewRegistry.get(viewId: viewId) {
            view.resignFirstResponder()
        }
        sendSuccess(id: id)
    }

    // MARK: - Response Helpers

    private func sendSuccess(id: String?, data: [String: Any]? = nil) {
        var response: [String: Any] = [
            "id": id ?? "",
            "success": true
        ]
        if let data = data {
            response["data"] = data
        }

        if let jsonData = try? JSONSerialization.data(withJSONObject: response),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sendToJS(jsonString)
        }
    }

    private func sendError(id: String?, error: String) {
        let response: [String: Any] = [
            "id": id ?? "",
            "success": false,
            "error": error
        ]

        if let jsonData = try? JSONSerialization.data(withJSONObject: response),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sendToJS(jsonString)
        }
    }
}

// MARK: - WKScriptMessageHandler

extension AngularMobileRuntime: WKScriptMessageHandler {
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "nativeBridge" else { return }

        if let messageString = message.body as? String,
           let data = messageString.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            handleMessage(json)
        } else if let json = message.body as? [String: Any] {
            handleMessage(json)
        }
    }
}

// MARK: - WKNavigationDelegate

extension AngularMobileRuntime: WKNavigationDelegate {
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        isReady = true

        if config.debug {
            print("[AngularMobile] Bundle loaded")
        }

        // Send any pending messages
        pendingMessages.forEach { sendToJS($0) }
        pendingMessages.removeAll()
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("[AngularMobile] Navigation failed: \(error)")
    }
}

// MARK: - Supporting Types

public struct RuntimeConfig {
    public var debug: Bool
    public var hotReload: Bool
    public var bundleUrl: URL?

    public init(debug: Bool = false, hotReload: Bool = false, bundleUrl: URL? = nil) {
        self.debug = debug
        self.hotReload = hotReload
        self.bundleUrl = bundleUrl
    }
}

enum RuntimeError: LocalizedError {
    case invalidPayload
    case viewNotFound(String)
    case viewCreationFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidPayload:
            return "Invalid message payload"
        case .viewNotFound(let viewId):
            return "View not found: \(viewId)"
        case .viewCreationFailed(let viewType):
            return "Failed to create view of type: \(viewType)"
        }
    }
}

import Foundation
import UIKit
import WebKit

/// View Factory
///
/// Creates and updates native iOS views based on commands from JavaScript.
public class ViewFactory {

    // MARK: - Properties

    private let viewRegistry: ViewRegistry

    // MARK: - Initialization

    public init(viewRegistry: ViewRegistry) {
        self.viewRegistry = viewRegistry
    }

    // MARK: - View Creation

    /// Create a native view of the specified type
    public func createView(type: String, viewId: String, props: [String: Any]) -> UIView? {
        let view: UIView?

        switch type {
        case "View":
            view = createContainerView(props: props)
        case "Text":
            view = createLabel(props: props)
        case "Image":
            view = createImageView(props: props)
        case "TextInput":
            view = createTextField(props: props)
        case "Button":
            view = createButton(props: props)
        case "ScrollView":
            view = createScrollView(props: props)
        case "Switch":
            view = createSwitch(props: props)
        case "Slider":
            view = createSlider(props: props)
        case "ActivityIndicator":
            view = createActivityIndicator(props: props)
        case "WebView":
            view = createWebView(props: props)
        case "FlatList":
            view = createTableView(props: props)
        case "Modal":
            view = createModalContainer(props: props)
        default:
            view = createContainerView(props: props)
        }

        if let view = view {
            applyCommonProps(to: view, props: props)
        }

        return view
    }

    /// Update an existing view with new props
    public func updateView(_ view: UIView, props: [String: Any]) {
        applyCommonProps(to: view, props: props)

        switch view {
        case let label as UILabel:
            updateLabel(label, props: props)
        case let imageView as UIImageView:
            updateImageView(imageView, props: props)
        case let textField as UITextField:
            updateTextField(textField, props: props)
        case let button as UIButton:
            updateButton(button, props: props)
        case let switchView as UISwitch:
            updateSwitch(switchView, props: props)
        case let slider as UISlider:
            updateSlider(slider, props: props)
        case let indicator as UIActivityIndicatorView:
            updateActivityIndicator(indicator, props: props)
        default:
            break
        }
    }

    // MARK: - View Creators

    private func createContainerView(props: [String: Any]) -> UIView {
        let view = FlexboxView()
        if let style = props["style"] as? [String: Any] {
            view.applyFlexStyle(style)
        }
        return view
    }

    private func createLabel(props: [String: Any]) -> UILabel {
        let label = UILabel()
        label.text = props["text"] as? String ?? ""
        label.numberOfLines = 0
        updateLabelStyles(label, props: props)
        return label
    }

    private func createImageView(props: [String: Any]) -> UIImageView {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        updateImageView(imageView, props: props)
        return imageView
    }

    private func createTextField(props: [String: Any]) -> UITextField {
        let textField = UITextField()
        textField.placeholder = props["placeholder"] as? String
        textField.text = props["value"] as? String
        textField.borderStyle = .roundedRect
        updateTextField(textField, props: props)
        return textField
    }

    private func createButton(props: [String: Any]) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(props["title"] as? String ?? "", for: .normal)
        button.isEnabled = !(props["disabled"] as? Bool ?? false)
        return button
    }

    private func createScrollView(props: [String: Any]) -> UIScrollView {
        let scrollView = UIScrollView()
        scrollView.showsVerticalScrollIndicator = props["showsVerticalScrollIndicator"] as? Bool ?? true
        scrollView.showsHorizontalScrollIndicator = props["showsHorizontalScrollIndicator"] as? Bool ?? false
        scrollView.bounces = props["bounces"] as? Bool ?? true
        return scrollView
    }

    private func createSwitch(props: [String: Any]) -> UISwitch {
        let switchView = UISwitch()
        switchView.isOn = props["value"] as? Bool ?? false
        switchView.isEnabled = !(props["disabled"] as? Bool ?? false)
        return switchView
    }

    private func createSlider(props: [String: Any]) -> UISlider {
        let slider = UISlider()
        slider.minimumValue = Float(props["minimumValue"] as? Double ?? 0)
        slider.maximumValue = Float(props["maximumValue"] as? Double ?? 1)
        slider.value = Float(props["value"] as? Double ?? 0)
        slider.isEnabled = !(props["disabled"] as? Bool ?? false)
        return slider
    }

    private func createActivityIndicator(props: [String: Any]) -> UIActivityIndicatorView {
        let size = props["size"] as? String ?? "small"
        let style: UIActivityIndicatorView.Style = size == "large" ? .large : .medium
        let indicator = UIActivityIndicatorView(style: style)

        if props["animating"] as? Bool ?? true {
            indicator.startAnimating()
        }

        indicator.hidesWhenStopped = props["hidesWhenStopped"] as? Bool ?? true

        return indicator
    }

    private func createWebView(props: [String: Any]) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: configuration)

        if let source = props["source"] as? [String: Any],
           let urlString = source["uri"] as? String,
           let url = URL(string: urlString) {
            webView.load(URLRequest(url: url))
        }

        return webView
    }

    private func createTableView(props: [String: Any]) -> UITableView {
        let tableView = UITableView(frame: .zero, style: .plain)
        tableView.separatorStyle = .none
        return tableView
    }

    private func createModalContainer(props: [String: Any]) -> UIView {
        let view = UIView()
        view.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        return view
    }

    // MARK: - View Updaters

    private func updateLabel(_ label: UILabel, props: [String: Any]) {
        if let text = props["text"] as? String {
            label.text = text
        }
        updateLabelStyles(label, props: props)
    }

    private func updateImageView(_ imageView: UIImageView, props: [String: Any]) {
        if let source = props["source"] as? [String: Any],
           let urlString = source["uri"] as? String,
           let url = URL(string: urlString) {
            // Note: In production, use SDWebImage, Kingfisher, or Nuke
            URLSession.shared.dataTask(with: url) { data, _, _ in
                if let data = data, let image = UIImage(data: data) {
                    DispatchQueue.main.async {
                        imageView.image = image
                    }
                }
            }.resume()
        }

        switch props["resizeMode"] as? String {
        case "cover":
            imageView.contentMode = .scaleAspectFill
        case "contain":
            imageView.contentMode = .scaleAspectFit
        case "stretch":
            imageView.contentMode = .scaleToFill
        case "center":
            imageView.contentMode = .center
        default:
            break
        }
    }

    private func updateTextField(_ textField: UITextField, props: [String: Any]) {
        if let placeholder = props["placeholder"] as? String {
            textField.placeholder = placeholder
        }
        if let value = props["value"] as? String, textField.text != value {
            textField.text = value
        }

        textField.isSecureTextEntry = props["secureTextEntry"] as? Bool ?? false
        textField.isEnabled = props["editable"] as? Bool ?? true

        switch props["keyboardType"] as? String {
        case "numeric":
            textField.keyboardType = .numberPad
        case "email-address":
            textField.keyboardType = .emailAddress
        case "phone-pad":
            textField.keyboardType = .phonePad
        default:
            textField.keyboardType = .default
        }
    }

    private func updateButton(_ button: UIButton, props: [String: Any]) {
        if let title = props["title"] as? String {
            button.setTitle(title, for: .normal)
        }
        button.isEnabled = !(props["disabled"] as? Bool ?? false)
    }

    private func updateSwitch(_ switchView: UISwitch, props: [String: Any]) {
        if let value = props["value"] as? Bool {
            switchView.setOn(value, animated: true)
        }
        switchView.isEnabled = !(props["disabled"] as? Bool ?? false)
    }

    private func updateSlider(_ slider: UISlider, props: [String: Any]) {
        if let min = props["minimumValue"] as? Double {
            slider.minimumValue = Float(min)
        }
        if let max = props["maximumValue"] as? Double {
            slider.maximumValue = Float(max)
        }
        if let value = props["value"] as? Double {
            slider.setValue(Float(value), animated: true)
        }
        slider.isEnabled = !(props["disabled"] as? Bool ?? false)
    }

    private func updateActivityIndicator(_ indicator: UIActivityIndicatorView, props: [String: Any]) {
        let animating = props["animating"] as? Bool ?? true
        if animating {
            indicator.startAnimating()
        } else {
            indicator.stopAnimating()
        }
    }

    // MARK: - Style Application

    private func applyCommonProps(to view: UIView, props: [String: Any]) {
        guard let style = props["style"] as? [String: Any] else { return }

        // Background color
        if let bgColor = style["backgroundColor"] as? String {
            view.backgroundColor = UIColor(hex: bgColor)
        }

        // Opacity
        if let opacity = style["opacity"] as? Double {
            view.alpha = CGFloat(opacity)
        }

        // Border
        if let borderWidth = style["borderWidth"] as? Double {
            view.layer.borderWidth = CGFloat(borderWidth)
        }
        if let borderColor = style["borderColor"] as? String {
            view.layer.borderColor = UIColor(hex: borderColor)?.cgColor
        }
        if let borderRadius = style["borderRadius"] as? Double {
            view.layer.cornerRadius = CGFloat(borderRadius)
            view.clipsToBounds = true
        }

        // Shadow
        if let shadowColor = style["shadowColor"] as? String {
            view.layer.shadowColor = UIColor(hex: shadowColor)?.cgColor
        }
        if let shadowOpacity = style["shadowOpacity"] as? Double {
            view.layer.shadowOpacity = Float(shadowOpacity)
        }
        if let shadowRadius = style["shadowRadius"] as? Double {
            view.layer.shadowRadius = CGFloat(shadowRadius)
        }
        if let shadowOffset = style["shadowOffset"] as? [String: Double] {
            view.layer.shadowOffset = CGSize(
                width: shadowOffset["width"] ?? 0,
                height: shadowOffset["height"] ?? 0
            )
        }

        // Visibility
        if let display = style["display"] as? String, display == "none" {
            view.isHidden = true
        } else {
            view.isHidden = false
        }
    }

    private func updateLabelStyles(_ label: UILabel, props: [String: Any]) {
        let style = props["style"] as? [String: Any] ?? props

        // Font size
        if let fontSize = style["fontSize"] as? Double {
            label.font = label.font.withSize(CGFloat(fontSize))
        }

        // Font color
        if let color = style["color"] as? String {
            label.textColor = UIColor(hex: color)
        }

        // Font weight
        var fontWeight: UIFont.Weight = .regular
        if let weight = style["fontWeight"] as? String {
            switch weight {
            case "bold", "700", "800", "900":
                fontWeight = .bold
            case "600":
                fontWeight = .semibold
            case "500":
                fontWeight = .medium
            case "300":
                fontWeight = .light
            default:
                fontWeight = .regular
            }
        }

        let fontSize = style["fontSize"] as? Double ?? Double(label.font.pointSize)
        label.font = UIFont.systemFont(ofSize: CGFloat(fontSize), weight: fontWeight)

        // Font style
        if let fontStyle = style["fontStyle"] as? String, fontStyle == "italic" {
            if let descriptor = label.font.fontDescriptor.withSymbolicTraits(.traitItalic) {
                label.font = UIFont(descriptor: descriptor, size: label.font.pointSize)
            }
        }

        // Text alignment
        if let textAlign = style["textAlign"] as? String {
            switch textAlign {
            case "center":
                label.textAlignment = .center
            case "right", "end":
                label.textAlignment = .right
            default:
                label.textAlignment = .left
            }
        }

        // Number of lines
        if let numberOfLines = style["numberOfLines"] as? Int {
            label.numberOfLines = numberOfLines
        }
    }
}

// MARK: - UIColor Extension

extension UIColor {
    convenience init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgb)

        let length = hexSanitized.count

        let r, g, b, a: CGFloat
        switch length {
        case 6:
            r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
            g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
            b = CGFloat(rgb & 0x0000FF) / 255.0
            a = 1.0
        case 8:
            r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
            g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
            b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
            a = CGFloat(rgb & 0x000000FF) / 255.0
        default:
            return nil
        }

        self.init(red: r, green: g, blue: b, alpha: a)
    }
}

package com.pegasusheavy.angularmobile

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.widget.SwitchCompat
import androidx.core.widget.NestedScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import org.json.JSONObject

/**
 * View Factory
 *
 * Creates and updates native Android views based on commands from JavaScript.
 */
class ViewFactory(
    private val context: Context,
    private val viewRegistry: ViewRegistry
) {
    /**
     * Create a native view of the specified type
     */
    fun createView(viewType: String, viewId: String, props: JSONObject): View? {
        val view = when (viewType) {
            "View", "android.view.ViewGroup" -> createViewGroup(props)
            "Text", "android.widget.TextView" -> createTextView(props)
            "Image", "android.widget.ImageView" -> createImageView(props)
            "TextInput", "android.widget.EditText" -> createEditText(props)
            "Button", "android.widget.Button" -> createButton(props)
            "ScrollView", "android.widget.ScrollView" -> createScrollView(props)
            "Switch", "android.widget.Switch" -> createSwitch(props)
            "Slider", "android.widget.SeekBar" -> createSeekBar(props)
            "ActivityIndicator", "android.widget.ProgressBar" -> createProgressBar(props)
            "FlatList", "androidx.recyclerview.widget.RecyclerView" -> createRecyclerView(props)
            "WebView", "android.webkit.WebView" -> createWebView(props)
            "Modal", "android.app.Dialog" -> createModalContainer(props)
            else -> createViewGroup(props) // Default to ViewGroup
        }

        view?.let {
            applyCommonProps(it, props)
        }

        return view
    }

    /**
     * Update an existing view with new props
     */
    fun updateView(view: View, props: JSONObject) {
        applyCommonProps(view, props)

        when (view) {
            is TextView -> updateTextView(view, props)
            is ImageView -> updateImageView(view, props)
            is EditText -> updateEditText(view, props)
            is Button -> updateButton(view, props)
            is SwitchCompat -> updateSwitch(view, props)
            is SeekBar -> updateSeekBar(view, props)
            is ProgressBar -> updateProgressBar(view, props)
        }
    }

    // ==================== View Creators ====================

    private fun createViewGroup(props: JSONObject): ViewGroup {
        return FrameLayout(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
    }

    private fun createTextView(props: JSONObject): TextView {
        return TextView(context).apply {
            text = props.optString("text", "")
            updateTextStyles(this, props)
        }
    }

    private fun createImageView(props: JSONObject): ImageView {
        return ImageView(context).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            updateImageView(this, props)
        }
    }

    private fun createEditText(props: JSONObject): EditText {
        return EditText(context).apply {
            hint = props.optString("placeholder", "")
            setText(props.optString("value", ""))
            updateEditText(this, props)
        }
    }

    private fun createButton(props: JSONObject): Button {
        return Button(context).apply {
            text = props.optString("title", "")
            isEnabled = !props.optBoolean("disabled", false)
        }
    }

    private fun createScrollView(props: JSONObject): NestedScrollView {
        return NestedScrollView(context).apply {
            isFillViewport = true
            isNestedScrollingEnabled = true
        }
    }

    private fun createSwitch(props: JSONObject): SwitchCompat {
        return SwitchCompat(context).apply {
            isChecked = props.optBoolean("value", false)
            isEnabled = !props.optBoolean("disabled", false)
        }
    }

    private fun createSeekBar(props: JSONObject): SeekBar {
        return SeekBar(context).apply {
            max = ((props.optDouble("maximumValue", 1.0) - props.optDouble("minimumValue", 0.0)) * 100).toInt()
            progress = ((props.optDouble("value", 0.0) - props.optDouble("minimumValue", 0.0)) * 100).toInt()
            isEnabled = !props.optBoolean("disabled", false)
        }
    }

    private fun createProgressBar(props: JSONObject): ProgressBar {
        val style = if (props.optString("size") == "large") {
            android.R.attr.progressBarStyleLarge
        } else {
            android.R.attr.progressBarStyle
        }
        return ProgressBar(context, null, style).apply {
            isIndeterminate = props.optBoolean("animating", true)
        }
    }

    private fun createRecyclerView(props: JSONObject): RecyclerView {
        return RecyclerView(context).apply {
            layoutManager = LinearLayoutManager(context)
            setHasFixedSize(true)
        }
    }

    private fun createWebView(props: JSONObject): android.webkit.WebView {
        return android.webkit.WebView(context).apply {
            settings.javaScriptEnabled = props.optBoolean("javaScriptEnabled", true)
            props.optString("source")?.let { url ->
                if (url.isNotEmpty()) loadUrl(url)
            }
        }
    }

    private fun createModalContainer(props: JSONObject): FrameLayout {
        return FrameLayout(context).apply {
            setBackgroundColor(Color.parseColor("#80000000"))
        }
    }

    // ==================== View Updaters ====================

    private fun updateTextView(view: TextView, props: JSONObject) {
        props.optString("text")?.let { view.text = it }
        updateTextStyles(view, props)
    }

    private fun updateImageView(view: ImageView, props: JSONObject) {
        // Image loading would typically use Glide/Coil
        props.optJSONObject("source")?.let { source ->
            source.optString("uri")?.let { uri ->
                // TODO: Load image from URI using image loading library
            }
        }

        when (props.optString("resizeMode")) {
            "cover" -> view.scaleType = ImageView.ScaleType.CENTER_CROP
            "contain" -> view.scaleType = ImageView.ScaleType.FIT_CENTER
            "stretch" -> view.scaleType = ImageView.ScaleType.FIT_XY
            "center" -> view.scaleType = ImageView.ScaleType.CENTER
        }
    }

    private fun updateEditText(view: EditText, props: JSONObject) {
        props.optString("placeholder")?.let { view.hint = it }
        props.optString("value")?.let {
            if (view.text.toString() != it) {
                view.setText(it)
            }
        }

        view.inputType = when {
            props.optBoolean("secureTextEntry", false) ->
                InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            props.optString("keyboardType") == "numeric" ->
                InputType.TYPE_CLASS_NUMBER
            props.optString("keyboardType") == "email-address" ->
                InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            props.optBoolean("multiline", false) ->
                InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            else -> InputType.TYPE_CLASS_TEXT
        }

        view.isEnabled = props.optBoolean("editable", true)
    }

    private fun updateButton(view: Button, props: JSONObject) {
        props.optString("title")?.let { view.text = it }
        view.isEnabled = !props.optBoolean("disabled", false)
    }

    private fun updateSwitch(view: SwitchCompat, props: JSONObject) {
        view.isChecked = props.optBoolean("value", false)
        view.isEnabled = !props.optBoolean("disabled", false)
    }

    private fun updateSeekBar(view: SeekBar, props: JSONObject) {
        val min = props.optDouble("minimumValue", 0.0)
        val max = props.optDouble("maximumValue", 1.0)
        view.max = ((max - min) * 100).toInt()
        view.progress = ((props.optDouble("value", 0.0) - min) * 100).toInt()
        view.isEnabled = !props.optBoolean("disabled", false)
    }

    private fun updateProgressBar(view: ProgressBar, props: JSONObject) {
        view.isIndeterminate = props.optBoolean("animating", true)
        if (view.visibility == View.VISIBLE && props.optBoolean("hidesWhenStopped", true) && !props.optBoolean("animating", true)) {
            view.visibility = View.INVISIBLE
        }
    }

    // ==================== Style Application ====================

    private fun applyCommonProps(view: View, props: JSONObject) {
        val style = props.optJSONObject("style") ?: return

        // Dimensions
        val width = parseDimension(style.opt("width"))
        val height = parseDimension(style.opt("height"))

        view.layoutParams = (view.layoutParams ?: ViewGroup.MarginLayoutParams(
            width ?: ViewGroup.LayoutParams.WRAP_CONTENT,
            height ?: ViewGroup.LayoutParams.WRAP_CONTENT
        )).apply {
            if (this is ViewGroup.MarginLayoutParams) {
                leftMargin = dpToPx(style.optDouble("marginLeft", style.optDouble("margin", 0.0)))
                rightMargin = dpToPx(style.optDouble("marginRight", style.optDouble("margin", 0.0)))
                topMargin = dpToPx(style.optDouble("marginTop", style.optDouble("margin", 0.0)))
                bottomMargin = dpToPx(style.optDouble("marginBottom", style.optDouble("margin", 0.0)))
            }
        }

        // Padding
        view.setPadding(
            dpToPx(style.optDouble("paddingLeft", style.optDouble("padding", 0.0))),
            dpToPx(style.optDouble("paddingTop", style.optDouble("padding", 0.0))),
            dpToPx(style.optDouble("paddingRight", style.optDouble("padding", 0.0))),
            dpToPx(style.optDouble("paddingBottom", style.optDouble("padding", 0.0)))
        )

        // Background
        style.optString("backgroundColor")?.let { color ->
            if (color.isNotEmpty()) {
                try {
                    val bgDrawable = GradientDrawable().apply {
                        setColor(Color.parseColor(color))
                        cornerRadius = dpToPx(style.optDouble("borderRadius", 0.0)).toFloat()

                        val borderWidth = dpToPx(style.optDouble("borderWidth", 0.0))
                        if (borderWidth > 0) {
                            setStroke(borderWidth, Color.parseColor(
                                style.optString("borderColor", "#000000")
                            ))
                        }
                    }
                    view.background = bgDrawable
                } catch (e: Exception) {
                    // Invalid color
                }
            }
        }

        // Opacity
        view.alpha = style.optDouble("opacity", 1.0).toFloat()

        // Visibility
        when (style.optString("display")) {
            "none" -> view.visibility = View.GONE
            else -> view.visibility = View.VISIBLE
        }

        // Elevation (shadow)
        val elevation = style.optDouble("elevation", 0.0)
        if (elevation > 0) {
            view.elevation = dpToPx(elevation).toFloat()
        }
    }

    private fun updateTextStyles(view: TextView, props: JSONObject) {
        val style = props.optJSONObject("style") ?: props

        // Font size
        style.optDouble("fontSize", -1.0).let { size ->
            if (size > 0) {
                view.setTextSize(TypedValue.COMPLEX_UNIT_SP, size.toFloat())
            }
        }

        // Font color
        style.optString("color")?.let { color ->
            if (color.isNotEmpty()) {
                try {
                    view.setTextColor(Color.parseColor(color))
                } catch (e: Exception) { }
            }
        }

        // Font weight
        val fontWeight = style.optString("fontWeight", "normal")
        val fontStyle = style.optString("fontStyle", "normal")

        view.setTypeface(view.typeface, when {
            fontWeight == "bold" && fontStyle == "italic" -> Typeface.BOLD_ITALIC
            fontWeight == "bold" -> Typeface.BOLD
            fontStyle == "italic" -> Typeface.ITALIC
            else -> Typeface.NORMAL
        })

        // Text alignment
        view.gravity = when (style.optString("textAlign")) {
            "center" -> Gravity.CENTER
            "right", "end" -> Gravity.END
            "left", "start" -> Gravity.START
            else -> Gravity.START
        }

        // Line height
        style.optDouble("lineHeight", -1.0).let { height ->
            if (height > 0) {
                view.setLineSpacing(dpToPx(height - view.textSize / context.resources.displayMetrics.density).toFloat(), 1f)
            }
        }

        // Number of lines
        style.optInt("numberOfLines", 0).let { lines ->
            if (lines > 0) {
                view.maxLines = lines
                view.ellipsize = android.text.TextUtils.TruncateAt.END
            }
        }
    }

    // ==================== Utilities ====================

    private fun dpToPx(dp: Double): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }

    private fun parseDimension(value: Any?): Int? {
        return when (value) {
            is Number -> dpToPx(value.toDouble())
            is String -> {
                when {
                    value.endsWith("%") -> null // Percentage needs parent measurement
                    value == "auto" -> ViewGroup.LayoutParams.WRAP_CONTENT
                    else -> value.toDoubleOrNull()?.let { dpToPx(it) }
                }
            }
            else -> null
        }
    }
}

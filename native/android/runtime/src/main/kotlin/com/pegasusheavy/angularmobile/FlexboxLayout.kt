package com.pegasusheavy.angularmobile

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.view.ViewGroup
import org.json.JSONObject
import kotlin.math.max

/**
 * Flexbox Layout
 *
 * A custom ViewGroup that implements CSS Flexbox layout semantics
 * for React Native-style layouts.
 */
class FlexboxLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ViewGroup(context, attrs, defStyleAttr) {

    enum class FlexDirection { ROW, ROW_REVERSE, COLUMN, COLUMN_REVERSE }
    enum class JustifyContent { FLEX_START, FLEX_END, CENTER, SPACE_BETWEEN, SPACE_AROUND, SPACE_EVENLY }
    enum class AlignItems { FLEX_START, FLEX_END, CENTER, STRETCH, BASELINE }
    enum class AlignSelf { AUTO, FLEX_START, FLEX_END, CENTER, STRETCH, BASELINE }
    enum class FlexWrap { NO_WRAP, WRAP, WRAP_REVERSE }

    var flexDirection: FlexDirection = FlexDirection.COLUMN
    var justifyContent: JustifyContent = JustifyContent.FLEX_START
    var alignItems: AlignItems = AlignItems.STRETCH
    var flexWrap: FlexWrap = FlexWrap.NO_WRAP
    var gap: Int = 0
    var rowGap: Int = 0
    var columnGap: Int = 0

    /**
     * Apply style from JSON
     */
    fun applyStyle(style: JSONObject) {
        flexDirection = when (style.optString("flexDirection", "column")) {
            "row" -> FlexDirection.ROW
            "row-reverse" -> FlexDirection.ROW_REVERSE
            "column-reverse" -> FlexDirection.COLUMN_REVERSE
            else -> FlexDirection.COLUMN
        }

        justifyContent = when (style.optString("justifyContent", "flex-start")) {
            "flex-end" -> JustifyContent.FLEX_END
            "center" -> JustifyContent.CENTER
            "space-between" -> JustifyContent.SPACE_BETWEEN
            "space-around" -> JustifyContent.SPACE_AROUND
            "space-evenly" -> JustifyContent.SPACE_EVENLY
            else -> JustifyContent.FLEX_START
        }

        alignItems = when (style.optString("alignItems", "stretch")) {
            "flex-start" -> AlignItems.FLEX_START
            "flex-end" -> AlignItems.FLEX_END
            "center" -> AlignItems.CENTER
            "baseline" -> AlignItems.BASELINE
            else -> AlignItems.STRETCH
        }

        flexWrap = when (style.optString("flexWrap", "nowrap")) {
            "wrap" -> FlexWrap.WRAP
            "wrap-reverse" -> FlexWrap.WRAP_REVERSE
            else -> FlexWrap.NO_WRAP
        }

        gap = dpToPx(style.optDouble("gap", 0.0))
        rowGap = dpToPx(style.optDouble("rowGap", gap.toDouble()))
        columnGap = dpToPx(style.optDouble("columnGap", gap.toDouble()))

        requestLayout()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val widthMode = MeasureSpec.getMode(widthMeasureSpec)
        val heightMode = MeasureSpec.getMode(heightMeasureSpec)
        val widthSize = MeasureSpec.getSize(widthMeasureSpec)
        val heightSize = MeasureSpec.getSize(heightMeasureSpec)

        var totalWidth = 0
        var totalHeight = 0
        var maxChildWidth = 0
        var maxChildHeight = 0

        val isHorizontal = flexDirection == FlexDirection.ROW || flexDirection == FlexDirection.ROW_REVERSE

        // Measure children
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (child.visibility == GONE) continue

            measureChild(child, widthMeasureSpec, heightMeasureSpec)
            val childWidth = child.measuredWidth
            val childHeight = child.measuredHeight

            if (isHorizontal) {
                totalWidth += childWidth + if (i > 0) columnGap else 0
                maxChildHeight = max(maxChildHeight, childHeight)
            } else {
                totalHeight += childHeight + if (i > 0) rowGap else 0
                maxChildWidth = max(maxChildWidth, childWidth)
            }
        }

        if (isHorizontal) {
            totalHeight = maxChildHeight
        } else {
            totalWidth = maxChildWidth
        }

        // Add padding
        totalWidth += paddingLeft + paddingRight
        totalHeight += paddingTop + paddingBottom

        val measuredWidth = when (widthMode) {
            MeasureSpec.EXACTLY -> widthSize
            MeasureSpec.AT_MOST -> minOf(totalWidth, widthSize)
            else -> totalWidth
        }

        val measuredHeight = when (heightMode) {
            MeasureSpec.EXACTLY -> heightSize
            MeasureSpec.AT_MOST -> minOf(totalHeight, heightSize)
            else -> totalHeight
        }

        setMeasuredDimension(measuredWidth, measuredHeight)
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        val isHorizontal = flexDirection == FlexDirection.ROW || flexDirection == FlexDirection.ROW_REVERSE
        val isReverse = flexDirection == FlexDirection.ROW_REVERSE || flexDirection == FlexDirection.COLUMN_REVERSE

        val availableWidth = r - l - paddingLeft - paddingRight
        val availableHeight = b - t - paddingTop - paddingBottom

        // Calculate total children size
        var totalMainSize = 0
        var visibleChildCount = 0
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (child.visibility == GONE) continue
            visibleChildCount++
            totalMainSize += if (isHorizontal) child.measuredWidth else child.measuredHeight
        }

        // Add gaps
        val totalGap = if (isHorizontal) columnGap * (visibleChildCount - 1) else rowGap * (visibleChildCount - 1)
        totalMainSize += totalGap

        // Calculate starting position based on justify content
        val mainAxisSize = if (isHorizontal) availableWidth else availableHeight
        val freeSpace = mainAxisSize - totalMainSize

        var mainOffset = when (justifyContent) {
            JustifyContent.FLEX_END -> freeSpace
            JustifyContent.CENTER -> freeSpace / 2
            JustifyContent.SPACE_BETWEEN -> 0
            JustifyContent.SPACE_AROUND -> freeSpace / (visibleChildCount * 2)
            JustifyContent.SPACE_EVENLY -> freeSpace / (visibleChildCount + 1)
            else -> 0
        }

        val spaceBetween = when (justifyContent) {
            JustifyContent.SPACE_BETWEEN -> if (visibleChildCount > 1) freeSpace / (visibleChildCount - 1) else 0
            JustifyContent.SPACE_AROUND -> freeSpace / visibleChildCount
            JustifyContent.SPACE_EVENLY -> freeSpace / (visibleChildCount + 1)
            else -> 0
        }

        // Add padding offset
        mainOffset += if (isHorizontal) paddingLeft else paddingTop

        // Layout children
        val children = (0 until childCount).map { getChildAt(it) }.filter { it.visibility != GONE }
        val orderedChildren = if (isReverse) children.reversed() else children

        for (child in orderedChildren) {
            val childWidth = child.measuredWidth
            val childHeight = child.measuredHeight

            // Calculate cross axis position
            val crossAxisSize = if (isHorizontal) availableHeight else availableWidth
            val childCrossSize = if (isHorizontal) childHeight else childWidth

            val crossOffset = when (alignItems) {
                AlignItems.FLEX_END -> crossAxisSize - childCrossSize
                AlignItems.CENTER -> (crossAxisSize - childCrossSize) / 2
                AlignItems.STRETCH -> 0
                else -> 0
            } + if (isHorizontal) paddingTop else paddingLeft

            // Position child
            if (isHorizontal) {
                child.layout(
                    mainOffset,
                    crossOffset,
                    mainOffset + childWidth,
                    crossOffset + childHeight
                )
                mainOffset += childWidth + columnGap + spaceBetween
            } else {
                child.layout(
                    crossOffset,
                    mainOffset,
                    crossOffset + childWidth,
                    mainOffset + childHeight
                )
                mainOffset += childHeight + rowGap + spaceBetween
            }
        }
    }

    private fun dpToPx(dp: Double): Int {
        return (dp * context.resources.displayMetrics.density).toInt()
    }

    /**
     * Layout params for flex children
     */
    class LayoutParams : MarginLayoutParams {
        var flex: Float = 0f
        var flexGrow: Float = 0f
        var flexShrink: Float = 1f
        var flexBasis: Int = ViewGroup.LayoutParams.WRAP_CONTENT
        var alignSelf: AlignSelf = AlignSelf.AUTO

        constructor(width: Int, height: Int) : super(width, height)
        constructor(c: Context, attrs: AttributeSet?) : super(c, attrs)
        constructor(source: ViewGroup.LayoutParams) : super(source)
        constructor(source: MarginLayoutParams) : super(source)
        constructor(source: LayoutParams) : super(source as MarginLayoutParams) {
            flex = source.flex
            flexGrow = source.flexGrow
            flexShrink = source.flexShrink
            flexBasis = source.flexBasis
            alignSelf = source.alignSelf
        }
    }

    override fun generateDefaultLayoutParams(): LayoutParams {
        return LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    override fun generateLayoutParams(attrs: AttributeSet?): LayoutParams {
        return LayoutParams(context, attrs)
    }

    override fun generateLayoutParams(p: ViewGroup.LayoutParams): LayoutParams {
        return when (p) {
            is LayoutParams -> LayoutParams(p)
            is MarginLayoutParams -> LayoutParams(p)
            else -> LayoutParams(p)
        }
    }

    override fun checkLayoutParams(p: ViewGroup.LayoutParams?): Boolean {
        return p is LayoutParams
    }
}

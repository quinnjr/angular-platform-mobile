import UIKit

/// Flexbox View
///
/// A custom UIView that implements CSS Flexbox layout semantics
/// for React Native-style layouts.
public class FlexboxView: UIView {

    // MARK: - Flex Properties

    public enum FlexDirection {
        case row, rowReverse, column, columnReverse
    }

    public enum JustifyContent {
        case flexStart, flexEnd, center, spaceBetween, spaceAround, spaceEvenly
    }

    public enum AlignItems {
        case flexStart, flexEnd, center, stretch, baseline
    }

    public enum FlexWrap {
        case noWrap, wrap, wrapReverse
    }

    public var flexDirection: FlexDirection = .column
    public var justifyContent: JustifyContent = .flexStart
    public var alignItems: AlignItems = .stretch
    public var flexWrap: FlexWrap = .noWrap
    public var gap: CGFloat = 0
    public var rowGap: CGFloat = 0
    public var columnGap: CGFloat = 0

    private var padding = UIEdgeInsets.zero

    // MARK: - Style Application

    public func applyFlexStyle(_ style: [String: Any]) {
        if let direction = style["flexDirection"] as? String {
            switch direction {
            case "row":
                flexDirection = .row
            case "row-reverse":
                flexDirection = .rowReverse
            case "column-reverse":
                flexDirection = .columnReverse
            default:
                flexDirection = .column
            }
        }

        if let justify = style["justifyContent"] as? String {
            switch justify {
            case "flex-end":
                justifyContent = .flexEnd
            case "center":
                justifyContent = .center
            case "space-between":
                justifyContent = .spaceBetween
            case "space-around":
                justifyContent = .spaceAround
            case "space-evenly":
                justifyContent = .spaceEvenly
            default:
                justifyContent = .flexStart
            }
        }

        if let align = style["alignItems"] as? String {
            switch align {
            case "flex-start":
                alignItems = .flexStart
            case "flex-end":
                alignItems = .flexEnd
            case "center":
                alignItems = .center
            case "baseline":
                alignItems = .baseline
            default:
                alignItems = .stretch
            }
        }

        if let wrap = style["flexWrap"] as? String {
            switch wrap {
            case "wrap":
                flexWrap = .wrap
            case "wrap-reverse":
                flexWrap = .wrapReverse
            default:
                flexWrap = .noWrap
            }
        }

        gap = CGFloat(style["gap"] as? Double ?? 0)
        rowGap = CGFloat(style["rowGap"] as? Double ?? Double(gap))
        columnGap = CGFloat(style["columnGap"] as? Double ?? Double(gap))

        // Padding
        let paddingValue = CGFloat(style["padding"] as? Double ?? 0)
        padding = UIEdgeInsets(
            top: CGFloat(style["paddingTop"] as? Double ?? Double(paddingValue)),
            left: CGFloat(style["paddingLeft"] as? Double ?? Double(paddingValue)),
            bottom: CGFloat(style["paddingBottom"] as? Double ?? Double(paddingValue)),
            right: CGFloat(style["paddingRight"] as? Double ?? Double(paddingValue))
        )

        setNeedsLayout()
    }

    // MARK: - Layout

    public override func layoutSubviews() {
        super.layoutSubviews()

        let isHorizontal = flexDirection == .row || flexDirection == .rowReverse
        let isReverse = flexDirection == .rowReverse || flexDirection == .columnReverse

        let contentBounds = bounds.inset(by: padding)
        let availableWidth = contentBounds.width
        let availableHeight = contentBounds.height

        // Get visible subviews
        var visibleSubviews = subviews.filter { !$0.isHidden }
        if isReverse {
            visibleSubviews.reverse()
        }

        guard !visibleSubviews.isEmpty else { return }

        // Measure children
        var totalMainSize: CGFloat = 0
        var maxCrossSize: CGFloat = 0
        var childSizes: [CGSize] = []

        for subview in visibleSubviews {
            subview.sizeToFit()
            let size = subview.bounds.size
            childSizes.append(size)

            if isHorizontal {
                totalMainSize += size.width
                maxCrossSize = max(maxCrossSize, size.height)
            } else {
                totalMainSize += size.height
                maxCrossSize = max(maxCrossSize, size.width)
            }
        }

        // Add gaps
        let gapSize = isHorizontal ? columnGap : rowGap
        let totalGap = gapSize * CGFloat(visibleSubviews.count - 1)
        totalMainSize += totalGap

        // Calculate main axis spacing
        let mainAxisSize = isHorizontal ? availableWidth : availableHeight
        let freeSpace = max(0, mainAxisSize - totalMainSize)

        var mainOffset: CGFloat
        var spaceBetween: CGFloat = 0

        switch justifyContent {
        case .flexEnd:
            mainOffset = freeSpace
            spaceBetween = 0
        case .center:
            mainOffset = freeSpace / 2
            spaceBetween = 0
        case .spaceBetween:
            mainOffset = 0
            spaceBetween = visibleSubviews.count > 1 ? freeSpace / CGFloat(visibleSubviews.count - 1) : 0
        case .spaceAround:
            let space = freeSpace / CGFloat(visibleSubviews.count)
            mainOffset = space / 2
            spaceBetween = space
        case .spaceEvenly:
            let space = freeSpace / CGFloat(visibleSubviews.count + 1)
            mainOffset = space
            spaceBetween = space
        case .flexStart:
            mainOffset = 0
            spaceBetween = 0
        }

        mainOffset += isHorizontal ? padding.left : padding.top

        // Layout children
        for (index, subview) in visibleSubviews.enumerated() {
            let childSize = childSizes[index]

            // Calculate cross axis position
            let crossAxisSize = isHorizontal ? availableHeight : availableWidth
            let childCrossSize = isHorizontal ? childSize.height : childSize.width

            var crossOffset: CGFloat
            switch alignItems {
            case .flexEnd:
                crossOffset = crossAxisSize - childCrossSize
            case .center:
                crossOffset = (crossAxisSize - childCrossSize) / 2
            case .stretch, .flexStart, .baseline:
                crossOffset = 0
            }

            crossOffset += isHorizontal ? padding.top : padding.left

            // Set frame
            if isHorizontal {
                subview.frame = CGRect(
                    x: mainOffset,
                    y: crossOffset,
                    width: alignItems == .stretch ? childSize.width : childSize.width,
                    height: alignItems == .stretch ? availableHeight : childSize.height
                )
                mainOffset += childSize.width + gapSize + spaceBetween
            } else {
                subview.frame = CGRect(
                    x: crossOffset,
                    y: mainOffset,
                    width: alignItems == .stretch ? availableWidth : childSize.width,
                    height: childSize.height
                )
                mainOffset += childSize.height + gapSize + spaceBetween
            }
        }
    }

    public override func sizeThatFits(_ size: CGSize) -> CGSize {
        let isHorizontal = flexDirection == .row || flexDirection == .rowReverse

        var totalWidth: CGFloat = 0
        var totalHeight: CGFloat = 0
        var maxWidth: CGFloat = 0
        var maxHeight: CGFloat = 0

        let visibleSubviews = subviews.filter { !$0.isHidden }

        for subview in visibleSubviews {
            subview.sizeToFit()
            let childSize = subview.bounds.size

            if isHorizontal {
                totalWidth += childSize.width
                maxHeight = max(maxHeight, childSize.height)
            } else {
                totalHeight += childSize.height
                maxWidth = max(maxWidth, childSize.width)
            }
        }

        // Add gaps
        let gapSize = isHorizontal ? columnGap : rowGap
        let gapCount = max(0, visibleSubviews.count - 1)

        if isHorizontal {
            totalWidth += gapSize * CGFloat(gapCount)
            totalHeight = maxHeight
        } else {
            totalWidth = maxWidth
            totalHeight += gapSize * CGFloat(gapCount)
        }

        // Add padding
        totalWidth += padding.left + padding.right
        totalHeight += padding.top + padding.bottom

        return CGSize(width: totalWidth, height: totalHeight)
    }
}

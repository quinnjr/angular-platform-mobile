// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "AngularMobile",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "AngularMobile",
            targets: ["AngularMobile"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AngularMobile",
            dependencies: [],
            path: "Sources"
        ),
        .testTarget(
            name: "AngularMobileTests",
            dependencies: ["AngularMobile"],
            path: "Tests"
        ),
    ]
)

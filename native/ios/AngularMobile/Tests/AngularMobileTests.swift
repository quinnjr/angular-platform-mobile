import XCTest
@testable import AngularMobile

final class AngularMobileTests: XCTestCase {
    
    func testViewRegistryCreation() {
        let registry = ViewRegistry()
        XCTAssertNotNil(registry, "ViewRegistry should be created successfully")
    }
    
    func testViewFactoryCreation() {
        let factory = ViewFactory()
        XCTAssertNotNil(factory, "ViewFactory should be created successfully")
    }
    
    func testEventDispatcherCreation() {
        let dispatcher = EventDispatcher()
        XCTAssertNotNil(dispatcher, "EventDispatcher should be created successfully")
    }
    
    func testEventDispatcherSubscription() {
        let dispatcher = EventDispatcher()
        let expectation = XCTestExpectation(description: "Event callback should be called")
        
        let subscriptionId = dispatcher.subscribe(to: "testEvent") { data in
            XCTAssertNotNil(data)
            expectation.fulfill()
        }
        
        XCTAssertFalse(subscriptionId.isEmpty, "Subscription ID should not be empty")
        
        dispatcher.emit(event: "testEvent", data: ["key": "value"])
        
        wait(for: [expectation], timeout: 1.0)
    }
    
    func testEventDispatcherUnsubscribe() {
        let dispatcher = EventDispatcher()
        var callCount = 0
        
        let subscriptionId = dispatcher.subscribe(to: "testEvent") { _ in
            callCount += 1
        }
        
        dispatcher.emit(event: "testEvent", data: [:])
        XCTAssertEqual(callCount, 1, "Event should be called once")
        
        dispatcher.unsubscribe(id: subscriptionId)
        
        dispatcher.emit(event: "testEvent", data: [:])
        XCTAssertEqual(callCount, 1, "Event should not be called after unsubscribe")
    }
}

# System Patterns: Sneaky Link

## System Architecture

Sneaky Link follows a modular, layered architecture with clear separation of concerns:

```mermaid
flowchart TD
    subgraph Frontend
        UI[User Interface]
        FE_Logic[Frontend Logic]
    end
    
    subgraph Core_SDK
        API[SDK API Layer]
        Browser[Browser Automation]
        Payment[Payment Processing]
        NEAR[NEAR Integration]
    end
    
    subgraph MCP_Server
        MCP_API[MCP API]
        MCP_Tools[MCP Tools]
    end
    
    UI --> FE_Logic
    FE_Logic --> API
    MCP_API --> API
    API --> Browser
    API --> Payment
    API --> NEAR
    MCP_Tools --> MCP_API
```

## Key Components

### Core SDK

The foundation of the system, providing the essential functionality:

1. **SDK API Layer**
   - Public interfaces for all SDK functionality
   - Configuration management
   - Session handling

2. **Browser Automation Module**
   - Playwright integration
   - Page navigation logic
   - Element interaction
   - Data extraction

3. **Payment Processing**
   - ZCash transaction handling
   - Payment verification
   - Status tracking

4. **NEAR Integration**
   - Intent creation and management
   - Transaction signing
   - Response handling

### Frontend Application

A user-facing interface built on top of the SDK:

1. **User Interface**
   - Responsive design
   - Step-by-step flow
   - Status visualization

2. **Frontend Logic**
   - SDK integration
   - State management
   - Error handling

### MCP Server

Makes the SDK functionality available to AI agents:

1. **MCP API**
   - SDK wrapper
   - Session management
   - Authentication

2. **MCP Tools**
   - Tool definitions
   - Input validation
   - Response formatting

## Data Flow

The typical data flow through the system:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SDK
    participant Bitrefill
    participant NEAR
    
    User->>Frontend: Initiate purchase
    Frontend->>SDK: Create purchase request
    SDK->>Bitrefill: Navigate to iframe
    SDK->>Bitrefill: Complete checkout form
    Bitrefill->>SDK: Return deposit address
    SDK->>NEAR: Create payment intent
    NEAR->>SDK: Return transaction result
    SDK->>Bitrefill: Verify payment
    Bitrefill->>SDK: Return Visa card details
    SDK->>Frontend: Return purchase result
    Frontend->>User: Display Visa card details
```

## Design Patterns

### Core Patterns

1. **Facade Pattern**
   - The SDK API provides a simplified interface to the complex subsystems
   - Hides implementation details from consumers

2. **Strategy Pattern**
   - Pluggable strategies for browser automation steps
   - Allows for adaptation to changes in Bitrefill's UI

3. **Observer Pattern**
   - Event-based system for status updates
   - Enables loose coupling between components

4. **Factory Pattern**
   - Creates appropriate instances of browser, payment, and NEAR handlers
   - Centralizes object creation logic

5. **Command Pattern**
   - Encapsulates browser automation actions as commands
   - Enables retry, undo, and logging capabilities

### Error Handling Patterns

1. **Circuit Breaker**
   - Prevents cascading failures by failing fast
   - Automatically retries after backoff period

2. **Retry with Exponential Backoff**
   - Automatically retries failed operations
   - Increases delay between retries

3. **Fallback Mechanisms**
   - Provides alternative paths when primary path fails
   - Graceful degradation of functionality

## State Management

Purchase flow state machine:

```mermaid
stateDiagram-v2
    [*] --> Initialized
    Initialized --> NavigatingCheckout
    NavigatingCheckout --> AwaitingPayment
    AwaitingPayment --> ProcessingPayment
    ProcessingPayment --> CompletingPurchase
    CompletingPurchase --> PurchaseComplete
    CompletingPurchase --> PurchaseFailed
    
    NavigatingCheckout --> Error
    AwaitingPayment --> Error
    ProcessingPayment --> Error
    CompletingPurchase --> Error
    
    Error --> RetryingOperation
    RetryingOperation --> NavigatingCheckout
    RetryingOperation --> AwaitingPayment
    RetryingOperation --> ProcessingPayment
    RetryingOperation --> CompletingPurchase
    
    PurchaseComplete --> [*]
    PurchaseFailed --> [*]
```

## Technical Decisions

1. **Bun as Runtime**
   - Modern JavaScript/TypeScript capabilities
   - Improved performance over Node.js
   - Built-in TypeScript support

2. **Playwright over Puppeteer**
   - More modern API
   - Better cross-browser support
   - Improved stability and reliability
   - Enhanced debugging capabilities

3. **Modular Architecture**
   - Clear separation of concerns
   - Testable components
   - Maintainable codebase

4. **Event-Driven Communication**
   - Loose coupling between components
   - Scalable architecture
   - Easier to extend and modify

5. **Strong Typing with TypeScript**
   - Improved developer experience
   - Catch errors at compile time
   - Better code documentation

## Integration Points

1. **Bitrefill Integration**
   - Browser automation to navigate checkout flow
   - Form filling and submission
   - Data extraction from pages

2. **ZCash Integration**
   - Deposit address generation
   - Transaction verification
   - Balance checking

3. **NEAR Integration**
   - Intent creation
   - Transaction signing
   - Response handling

4. **MCP Integration**
   - Tool definitions
   - Resource templates
   - Response formatting

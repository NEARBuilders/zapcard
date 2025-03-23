# Active Context: Sneaky Link

## Current Focus

We are in the initial planning and setup phase of the Sneaky Link project. The primary focus is on:

1. **Project Architecture**
   - Defining the overall system architecture
   - Establishing component boundaries and interfaces
   - Determining technical approach

2. **Development Environment Setup**
   - Setting up the project structure
   - Configuring development tools
   - Establishing coding standards

3. **Core SDK Design**
   - Designing the API surface
   - Planning browser automation approach
   - Defining integration points

## Recent Changes

As this is the project initialization phase, there are no recent code changes. The following documentation has been established:

1. **Project Brief**
   - Core requirements and goals defined
   - Constraints identified
   - Success criteria established

2. **Product Context**
   - Problem statement articulated
   - User personas identified
   - Key workflows outlined

3. **System Patterns**
   - Architecture diagram created
   - Component relationships defined
   - Design patterns selected

4. **Technical Context**
   - Technology stack chosen
   - Development environment specified
   - Project structure planned

## Next Steps

The immediate next steps for the project are:

1. **Project Initialization**
   - Create project repository
   - Set up basic project structure
   - Initialize package.json and tsconfig.json
   - Add core dependencies

2. **Core SDK Development**
   - Implement browser automation module
   - Set up Playwright integration
   - Create basic navigation flows
   - Implement deposit address extraction

3. **NEAR Integration Research**
   - Investigate NEAR intents API
   - Set up testnet environment
   - Create proof-of-concept for payment flow

4. **Frontend Scaffolding**
   - Create basic UI structure
   - Implement responsive layout
   - Design step-by-step flow

## Active Decisions

Several key decisions are currently being considered:

1. **Browser Automation Approach**
   - **Decision**: Use Playwright over Puppeteer
   - **Rationale**: More modern API, better cross-browser support, improved stability
   - **Status**: Decided

2. **Frontend Technology**
   - **Decision**: Use Web Components for UI
   - **Rationale**: Native browser support, no framework dependencies, future-proof
   - **Status**: Proposed, awaiting implementation experience

3. **State Management**
   - **Decision**: Implement state machine for purchase flow
   - **Rationale**: Clear state transitions, easier to handle errors and retries
   - **Status**: Proposed, needs detailed design

4. **Error Handling Strategy**
   - **Decision**: Implement circuit breaker and retry patterns
   - **Rationale**: Improve resilience, handle transient failures
   - **Status**: Proposed, needs implementation details

## Current Challenges

1. **Bitrefill Integration**
   - Need to analyze Bitrefill checkout flow
   - Identify stable selectors for automation
   - Handle potential UI changes

2. **Payment Verification**
   - Determine reliable method to verify ZCash payments
   - Handle blockchain confirmation times
   - Implement timeout and retry mechanisms

3. **NEAR Intent Integration**
   - Research NEAR intent API capabilities
   - Determine best approach for integration
   - Handle transaction signing securely

4. **Testing Strategy**
   - Develop approach for testing browser automation
   - Create mocks for blockchain interactions
   - Implement end-to-end test scenarios

## Open Questions

1. **Bitrefill API**
   - Does Bitrefill offer a direct API that could be used instead of browser automation?
   - If not, how stable is their UI for automation purposes?

2. **ZCash Integration**
   - What libraries are available for ZCash integration?
   - How to handle transaction verification efficiently?

3. **Error Recovery**
   - What are the common failure modes in the purchase flow?
   - How to implement graceful recovery from each?

4. **Deployment Strategy**
   - What is the preferred hosting environment?
   - How to handle secrets and credentials securely?

## Current Priorities

1. **High Priority**
   - Project initialization and setup
   - Core SDK browser automation module
   - Basic frontend scaffolding

2. **Medium Priority**
   - NEAR integration research
   - Error handling strategy
   - Testing framework setup

3. **Low Priority**
   - MCP server implementation
   - Documentation website
   - Performance optimization

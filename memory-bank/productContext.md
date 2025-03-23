# Product Context: Sneaky Link

## Problem Statement

Current methods for purchasing Visa gift cards with cryptocurrency have several limitations:

1. **Manual Process**: Users must manually navigate checkout flows, which is time-consuming and error-prone
2. **Limited Automation**: No programmatic way for AI agents to purchase cards on behalf of users
3. **Integration Challenges**: Difficult to integrate card purchasing into other applications and workflows
4. **Privacy Concerns**: Traditional purchasing methods may expose user identity

## Solution

Sneaky Link addresses these challenges by:

1. **Automating the Checkout Process**: Using headless browser automation to navigate Bitrefill's checkout flow
2. **Providing Programmatic Access**: Offering an SDK and MCP server for developers and AI agents
3. **Enabling ZCash Payments**: Supporting privacy-focused cryptocurrency transactions
4. **Leveraging NEAR Intents**: Using blockchain intents for secure, verifiable transactions

## User Personas

### Human End Users
- **Crypto Enthusiasts**: Users who prefer to use cryptocurrency for everyday purchases
- **Privacy-Focused Individuals**: Users who value the privacy benefits of ZCash
- **Convenience Seekers**: Users looking for a streamlined way to purchase gift cards

### Developer Users
- **Application Developers**: Integrating gift card purchasing into their applications
- **Blockchain Developers**: Building on NEAR and ZCash ecosystems
- **AI Developers**: Creating agents that can make purchases on behalf of users

### AI Agents
- **Personal Assistants**: AI agents helping users with shopping and payments
- **Autonomous Systems**: AI systems that need to make purchases as part of their operations

## User Experience Goals

### For Human Users
1. **Simplicity**: Intuitive interface with minimal steps to complete a purchase
2. **Transparency**: Clear visibility into the purchase process and status
3. **Reliability**: Consistent, dependable performance with helpful error messages
4. **Speed**: Quick completion of transactions with minimal waiting

### For Developers
1. **Easy Integration**: Simple SDK with clear documentation
2. **Flexibility**: Multiple integration options (direct SDK, MCP server)
3. **Robustness**: Comprehensive error handling and recovery mechanisms
4. **Extensibility**: Ability to customize and extend functionality

### For AI Agents
1. **Structured Interaction**: Well-defined MCP tools with clear input/output schemas
2. **Stateful Operations**: Ability to track and manage purchase state
3. **Error Recovery**: Intelligent handling of common failure modes
4. **Feedback Mechanisms**: Clear status updates and result reporting

## Key Workflows

### Human User Purchase Flow
1. User visits the Sneaky Link frontend
2. User selects Visa card denomination
3. System navigates Bitrefill checkout and displays ZCash deposit address
4. User sends ZCash to the deposit address
5. System verifies payment and completes purchase using NEAR intents
6. System displays Visa card details to the user

### Developer Integration Flow
1. Developer integrates Sneaky Link SDK into their application
2. Application calls SDK methods to initiate purchase
3. SDK handles browser automation, payment processing, and NEAR integration
4. SDK returns purchase results to the application

### AI Agent Purchase Flow
1. AI agent calls the MCP server with purchase parameters
2. MCP server uses the SDK to handle the purchase process
3. MCP server returns structured results to the AI agent

## Success Metrics

1. **Conversion Rate**: Percentage of initiated purchases that complete successfully
2. **Transaction Time**: Time from purchase initiation to card delivery
3. **Error Rate**: Percentage of transactions that encounter errors
4. **Recovery Rate**: Percentage of errors that are successfully recovered from
5. **User Satisfaction**: Feedback from human users on ease of use and reliability
6. **Developer Adoption**: Number of developers integrating the SDK
7. **AI Agent Usage**: Frequency of purchases made through the MCP server

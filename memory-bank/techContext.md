# Technical Context: Sneaky Link

## Technology Stack

### Core Technologies

1. **Bun**
   - JavaScript/TypeScript runtime
   - Package manager
   - Built-in bundler and test runner
   - TypeScript support out of the box

2. **TypeScript**
   - Static typing for JavaScript
   - Enhanced developer experience
   - Better code documentation
   - Improved maintainability

3. **Playwright**
   - Browser automation framework
   - Cross-browser support
   - Headless and headed mode
   - Robust selectors and actions
   - Built-in debugging tools

### Frontend Technologies

1. **HTML/CSS/JavaScript**
   - Simple, lightweight frontend
   - Responsive design
   - Progressive enhancement

2. **Web Components**
   - Custom elements for reusable UI components
   - Shadow DOM for encapsulation
   - HTML templates for declarative markup

### Backend Technologies

1. **NEAR SDK**
   - Integration with NEAR blockchain
   - Intent creation and management
   - Transaction signing and verification

2. **ZCash Libraries**
   - Address generation and validation
   - Transaction verification
   - Balance checking

### MCP Integration

1. **Model Context Protocol SDK**
   - Tool definitions
   - Resource templates
   - Server implementation

## Development Environment

### Required Tools

1. **Bun**
   - Runtime and package manager
   - Version: Latest stable

2. **Visual Studio Code (recommended)**
   - TypeScript support
   - Playwright extension
   - Mermaid preview extension

3. **Git**
   - Version control
   - Collaboration

### Development Setup

1. **Installation**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Clone repository
   git clone <repository-url>
   cd sneaky-link
   
   # Install dependencies
   bun install
   ```

2. **Environment Configuration**
   - Create `.env` file with required configuration
   - Set up NEAR testnet/mainnet credentials
   - Configure Bitrefill API keys (if applicable)

3. **Running Locally**
   ```bash
   # Start development server
   bun run dev
   
   # Run tests
   bun test
   
   # Build for production
   bun run build
   ```

## Project Structure

```
sneaky-link/
├── src/
│   ├── sdk/                 # Core SDK
│   │   ├── api/             # Public API
│   │   ├── browser/         # Browser automation
│   │   ├── payment/         # Payment processing
│   │   ├── near/            # NEAR integration
│   │   └── utils/           # Utilities
│   ├── frontend/            # Frontend application
│   │   ├── components/      # Web components
│   │   ├── styles/          # CSS styles
│   │   └── pages/           # Page templates
│   ├── mcp/                 # MCP server
│   │   ├── tools/           # Tool definitions
│   │   ├── resources/       # Resource templates
│   │   └── server.ts        # Server implementation
│   └── index.ts             # Main entry point
├── tests/                   # Test suite
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── scripts/                 # Build and utility scripts
├── docs/                    # Documentation
├── .env.example             # Example environment variables
├── tsconfig.json            # TypeScript configuration
├── package.json             # Package configuration
└── README.md                # Project overview
```

## Dependencies

### Core Dependencies

1. **Playwright**
   - Browser automation
   - Version: Latest stable

2. **NEAR API JS**
   - NEAR blockchain integration
   - Version: Latest stable

3. **ZCash Libraries**
   - ZCash integration
   - Version: Latest stable

4. **Model Context Protocol SDK**
   - MCP server implementation
   - Version: Latest stable

### Development Dependencies

1. **TypeScript**
   - Static typing
   - Version: Latest stable

2. **ESLint**
   - Code linting
   - Version: Latest stable

3. **Prettier**
   - Code formatting
   - Version: Latest stable

4. **Vitest**
   - Testing framework
   - Version: Latest stable

## Technical Constraints

### Performance Constraints

1. **Browser Automation**
   - Must complete checkout flow within reasonable time (< 30 seconds)
   - Must handle network latency and page load variations

2. **Blockchain Integration**
   - Must account for transaction confirmation times
   - Must handle network congestion and fees

### Security Constraints

1. **Credential Management**
   - Secure storage of API keys and credentials
   - No hardcoded secrets in codebase

2. **Payment Processing**
   - Secure handling of payment information
   - Verification of transaction completion

### Compatibility Constraints

1. **Browser Compatibility**
   - Must work with latest versions of Chrome, Firefox, and Safari
   - Must handle variations in Bitrefill's UI

2. **Blockchain Compatibility**
   - Must support NEAR Protocol (testnet and mainnet)
   - Must handle ZCash transactions reliably

## Integration Points

### Bitrefill Integration

1. **Checkout Flow**
   - Navigation through iframe
   - Form filling and submission
   - Extraction of deposit address
   - Retrieval of card details

2. **API Integration (if available)**
   - Direct API calls for checkout
   - Webhook handling for status updates

### NEAR Integration

1. **Intent Creation**
   - Creating payment intents
   - Setting up transaction parameters

2. **Transaction Signing**
   - Signing transactions with appropriate keys
   - Submitting transactions to the network

3. **Response Handling**
   - Parsing transaction results
   - Handling success and failure cases

### ZCash Integration

1. **Address Handling**
   - Validating deposit addresses
   - Generating payment QR codes

2. **Transaction Verification**
   - Checking transaction status
   - Confirming payment completion

## Deployment Considerations

1. **Hosting Options**
   - Self-hosted server
   - Serverless deployment
   - Docker containerization

2. **Scaling Strategy**
   - Horizontal scaling for increased load
   - Caching strategies for improved performance

3. **Monitoring and Logging**
   - Error tracking and reporting
   - Performance monitoring
   - Usage analytics

4. **CI/CD Pipeline**
   - Automated testing
   - Continuous deployment
   - Version management

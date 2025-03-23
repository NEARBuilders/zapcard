# Project Brief: Sneaky Link

## Overview
Sneaky Link is a system that enables programmatic purchasing of Visa gift cards using ZCash and NEAR blockchain technologies. It automates the process of navigating Bitrefill's checkout flow, handling ZCash deposits, and using NEAR intents to complete purchases.

## Core Requirements

1. **Browser Automation**
   - Headless browser navigation of Bitrefill iframe
   - Automated checkout process
   - Extraction of deposit address
   - Retrieval of Visa card details

2. **Payment Processing**
   - ZCash deposit handling
   - NEAR intents integration for purchases
   - Transaction verification

3. **Dual Interface**
   - User-facing frontend for direct purchases
   - SDK for programmatic access
   - MCP server for AI agent integration

## Goals

1. **Primary Goals**
   - Create a reliable, automated system for purchasing Visa cards
   - Provide a simple, intuitive interface for human users
   - Enable AI agents to programmatically purchase cards

2. **Technical Goals**
   - Build with modern, maintainable technologies
   - Maintain a clean, modular architecture
   - Ensure robust error handling and recovery
   - Provide comprehensive logging and monitoring

## Constraints

1. **Technical Constraints**
   - Must use Bun as the JavaScript/TypeScript runtime
   - Must use Playwright for browser automation
   - Must maintain simplicity in architecture and implementation

2. **Integration Constraints**
   - Must work with Bitrefill's existing checkout flow
   - Must integrate with NEAR blockchain for intents
   - Must handle ZCash deposits securely

## Success Criteria

1. End-to-end successful purchase of Visa cards through the frontend
2. Successful programmatic purchases through the SDK
3. AI agents able to purchase cards through the MCP server
4. Robust error handling and recovery from common failure modes
5. Clear documentation for all interfaces

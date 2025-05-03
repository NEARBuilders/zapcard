# Sneaky Link API Server

This directory contains the Hono API server for the Sneaky Link project. It provides an HTTP endpoint to initiate the Visa gift card checkout process programmatically.

## Running the Server

You can run the API server locally using Bun:

```bash
bun run api
```

The server will start, typically on port 3000 (unless overridden by the `PORT` environment variable).

## API Endpoints

### `POST /api/checkout`

Initiates the checkout process for a Visa gift card.

**Request Body (JSON):**

```json
{
  "denomination": 50,
  "paymentMethod": "usdc_base",
  "headless": true
}
```

-   `denomination` (optional, number): The desired gift card value. Must be one of the values defined in `CardDenomination` (e.g., 25, 50, 100, 200). Defaults to `50`.
-   `paymentMethod` (optional, string): The desired payment method. Must be one of the values defined in `PaymentMethod` (e.g., "usdc_base", "zcash"). Defaults to `"usdc_base"`.
-   `headless` (optional, boolean): Whether to run the underlying Playwright browser in headless mode. Defaults to `true`.

**Success Response (200 OK):**

Returns the deposit information needed to complete the payment.

```json
{
  "address": "0x...",
  "amount": "51.47",
  "paymentMethod": "usdc_base",
  "qrCodeUrl": "data:image/png;base64,..." // Optional
}
```

**Error Responses:**

-   `400 Bad Request`: If the request body contains invalid `denomination` or `paymentMethod`.
-   `500 Internal Server Error`: If the checkout process fails due to an internal error (e.g., Playwright issue, timeout).

### `GET /health`

A simple health check endpoint.

**Success Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2025-05-03T05:16:00.000Z"
}
```

### `GET /api/version`

Returns the API server version.

**Success Response (200 OK):**

```json
{
  "version": "0.1.0",
  "name": "Sneaky Link API"
}
```

### `GET /api/queue/status`

Returns the current status of the task queue (powered by `p-queue`).

**Success Response (200 OK):**

```json
{
  "size": 0,      // Number of tasks currently running
  "pending": 0,   // Number of tasks waiting in the queue
  "isPaused": false
}
```

## Concurrency Management

The server uses `p-queue` to limit the number of concurrent Playwright browser sessions. This prevents resource exhaustion when multiple requests arrive simultaneously.

-   The maximum concurrency is controlled by the `MAX_CONCURRENCY` environment variable (defaults to 2).
-   Each checkout task has a timeout (defaults to 10 minutes).

## Deployment

A `Dockerfile` is provided for containerizing the application. This is the recommended way to deploy, as it handles Playwright dependencies correctly.

**Build the Docker image:**

```bash
docker build -t sneaky-link-api .
```

**Run the Docker container:**

```bash
docker run -p 3000:3000 -e MAX_CONCURRENCY=4 sneaky-link-api
```

You can deploy this container to platforms like Fly.io, Render, or any other Docker hosting provider.

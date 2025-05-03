import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import PQueue from "p-queue";
import { CardDenomination, PaymentMethod } from "../sdk/api/types";
import { initiateCheckout } from "../sdk/api/purchase";

const queue = new PQueue({ 
  concurrency: Number(process.env["MAX_CONCURRENCY"] || 2), // 2 max at the same time
  timeout: 10 * 60 * 1000, // 10 minutes timeout for each task
});

queue.on('active', () => {
  console.log(`Working on task. Queue size: ${queue.size}, Pending: ${queue.pending}`);
});

queue.on('idle', () => {
  console.log(`Queue is idle. Completed all tasks.`);
});

queue.on('error', (error) => {
  console.error('Queue error:', error);
});

// Create Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API version
app.get("/api/version", (c) => {
  return c.json({
    version: "0.1.0",
    name: "Sneaky Link API",
  });
});

// Queue status endpoint
app.get("/api/queue/status", (c) => {
  return c.json({
    size: queue.size,
    pending: queue.pending,
    isPaused: queue.isPaused,
  });
});

// Checkout endpoint
app.post("/api/checkout", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request body
    const denomination = body.denomination || CardDenomination.VISA_50;
    const paymentMethod = body.paymentMethod || PaymentMethod.BASE_USDC;
    const headless = body.headless !== false; // Default to true
    
    // Validate denomination
    if (!Object.values(CardDenomination).includes(denomination)) {
      return c.json(
        {
          error: "Invalid denomination",
          validValues: Object.values(CardDenomination).filter(v => typeof v === "number"),
        },
        400
      );
    }
    
    // Validate payment method
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return c.json(
        {
          error: "Invalid payment method",
          validValues: Object.values(PaymentMethod).filter(v => typeof v === "string"),
        },
        400
      );
    }
    
    console.log(`Queueing checkout process with denomination: $${denomination}, payment method: ${paymentMethod}`);
    console.log(`Current queue size: ${queue.size}, Pending: ${queue.pending}`);
    
    // Add checkout task to queue
    const depositInfo = await queue.add(async () => {
      console.log(`Starting checkout process with denomination: $${denomination}, payment method: ${paymentMethod}`);
      return await initiateCheckout({
        denomination,
        paymentMethod,
        headless,
        timeout: 60000,
      });
    });
    
    // Check if depositInfo is defined (queue might return void if paused)
    if (!depositInfo) {
      throw new Error("Checkout process failed: Queue is paused or task was cancelled");
    }
    
    // Return deposit information
    return c.json({
      address: depositInfo.address,
      amount: depositInfo.amount,
      paymentMethod: depositInfo.paymentMethod,
      qrCodeUrl: depositInfo.qrCodeUrl,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return c.json(
      {
        error: "Checkout process failed",
        message: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

// Start server
const port = process.env["PORT"] || 3000;
console.log(`Starting Sneaky Link API server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};

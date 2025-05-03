/**
 * Worker Pool for handling concurrent Playwright operations
 * 
 * This module provides a worker pool that limits the number of concurrent
 * Playwright browser instances to prevent resource exhaustion.
 */

import { EventEmitter } from "events";

/**
 * Worker function type
 */
type WorkerFunction<T> = () => Promise<T>;

/**
 * Worker task interface
 */
interface WorkerTask<T> {
  fn: WorkerFunction<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

/**
 * Worker pool options
 */
interface WorkerPoolOptions {
  /**
   * Maximum number of concurrent workers
   * Default: 2
   */
  maxConcurrency?: number;
  
  /**
   * Maximum queue size
   * Default: 100
   */
  maxQueueSize?: number;
  
  /**
   * Task timeout in milliseconds
   * Default: 5 minutes
   */
  taskTimeout?: number;
}

/**
 * Worker pool for handling concurrent Playwright operations
 */
export class WorkerPool extends EventEmitter {
  private maxConcurrency: number;
  private maxQueueSize: number;
  private taskTimeout: number;
  private activeWorkers: number = 0;
  private queue: WorkerTask<any>[] = [];
  private isProcessing: boolean = false;
  
  /**
   * Create a new worker pool
   * 
   * @param options Worker pool options
   */
  constructor(options: WorkerPoolOptions = {}) {
    super();
    this.maxConcurrency = options.maxConcurrency || 2;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.taskTimeout = options.taskTimeout || 5 * 60 * 1000; // 5 minutes
  }
  
  /**
   * Enqueue a task to be executed by a worker
   * 
   * @param fn Worker function
   * @returns Promise that resolves with the worker function result
   */
  enqueue<T>(fn: WorkerFunction<T>): Promise<T> {
    // Check if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(new Error("Worker queue is full"));
    }
    
    // Create a new promise that will be resolved when the task is completed
    return new Promise<T>((resolve, reject) => {
      // Create a task object
      const task: WorkerTask<T> = { fn, resolve, reject };
      
      // Add task to queue
      this.queue.push(task);
      
      // Start processing queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    // Set processing flag
    this.isProcessing = true;
    
    // Process queue until empty or all workers are busy
    while (this.queue.length > 0 && this.activeWorkers < this.maxConcurrency) {
      // Get next task
      const task = this.queue.shift();
      
      if (task) {
        // Increment active workers
        this.activeWorkers++;
        
        // Execute task with timeout
        this.executeTask(task)
          .catch(error => {
            console.error("Worker pool task execution error:", error);
          })
          .finally(() => {
            // Decrement active workers
            this.activeWorkers--;
            
            // Continue processing queue
            this.processQueue();
          });
      }
    }
    
    // Clear processing flag if queue is empty or all workers are busy
    if (this.queue.length === 0 || this.activeWorkers >= this.maxConcurrency) {
      this.isProcessing = false;
    }
  }
  
  /**
   * Execute a task with timeout
   * 
   * @param task Task to execute
   */
  private async executeTask<T>(task: WorkerTask<T>): Promise<void> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task timed out after ${this.taskTimeout}ms`));
        }, this.taskTimeout);
      });
      
      // Execute task with timeout
      const result = await Promise.race([task.fn(), timeoutPromise]);
      
      // Resolve task promise
      task.resolve(result);
    } catch (error) {
      // Reject task promise
      task.reject(error);
    }
  }
  
  /**
   * Get the current number of active workers
   */
  get activeCount(): number {
    return this.activeWorkers;
  }
  
  /**
   * Get the current queue size
   */
  get queueSize(): number {
    return this.queue.length;
  }
  
  /**
   * Get the maximum concurrency
   */
  get concurrency(): number {
    return this.maxConcurrency;
  }
}

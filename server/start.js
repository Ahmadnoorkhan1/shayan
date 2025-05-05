/**
 * Server Startup Script
 * 
 * This script ensures proper garbage collection and memory management
 * by explicitly enabling v8 options before loading the main server.
 */

// Enable garbage collection - this will be available via global.gc
if (!global.gc) {
  console.log('Forcing garbage collection to be available');
  // The v8 module allows direct interaction with V8 engine
  try {
    const v8 = require('v8');
    
    // Configure V8 heap size limits
    v8.setFlagsFromString('--expose-gc');
    v8.setFlagsFromString('--max-old-space-size=1536');
    
    // Set GC parameters to be more aggressive in cleaning up memory
    v8.setFlagsFromString('--optimize-for-size');
    v8.setFlagsFromString('--max-semi-space-size=64');
    
    // Manually trigger garbage collection to ensure it's available
    setTimeout(() => {
      if (global.gc) {
        console.log('Global GC is available, running initial cleanup');
        global.gc();
      } else {
        console.warn('Failed to enable global.gc despite v8 configuration');
      }
    }, 1000);
  } catch (e) {
    console.error('Failed to configure v8:', e.message);
  }
}

// Set memory monitor intervals
const MEMORY_CHECK_INTERVAL = 30000; // 30 seconds
let lastMemoryUsage = process.memoryUsage();

// Setup recurring memory monitoring
setInterval(() => {
  const currentMemory = process.memoryUsage();
  const memoryDiff = {
    rss: currentMemory.rss - lastMemoryUsage.rss,
    heapTotal: currentMemory.heapTotal - lastMemoryUsage.heapTotal,
    heapUsed: currentMemory.heapUsed - lastMemoryUsage.heapUsed
  };
  
  console.log(`Memory Check - RSS: ${Math.round(currentMemory.rss / 1024 / 1024)}MB, Heap: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}/${Math.round(currentMemory.heapTotal / 1024 / 1024)}MB`);
  
  // If heap usage is over 80%, force garbage collection
  if (currentMemory.heapUsed / currentMemory.heapTotal > 0.8) {
    console.log('Memory usage high, forcing garbage collection');
    try {
      if (global.gc) {
        global.gc();
      }
    } catch (e) {
      console.error('Error running gc:', e);
    }
  }
  
  lastMemoryUsage = currentMemory;
}, MEMORY_CHECK_INTERVAL);

// Load the main server
console.log('Starting server with enhanced memory management');
require('./server.js'); 
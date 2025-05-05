/**
 * Memory Management Utility
 * Helps monitor and optimize memory usage in the application
 */

// Track memory stats over time
let memoryStats = {
  peak: {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0
  },
  snapshots: []
};

// Take a memory snapshot
function takeMemorySnapshot() {
  const memory = process.memoryUsage();
  
  // Update peak values
  Object.keys(memory).forEach(key => {
    if (memory[key] > memoryStats.peak[key]) {
      memoryStats.peak[key] = memory[key];
    }
  });
  
  // Add snapshot with timestamp
  memoryStats.snapshots.push({
    timestamp: Date.now(),
    memory: { ...memory }
  });
  
  // Keep only last 100 snapshots
  if (memoryStats.snapshots.length > 100) {
    memoryStats.snapshots.shift();
  }
  
  return memory;
}

// Format memory values to human-readable format
function formatMemory(bytes) {
  // Check if input is a valid number
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return '0 B';
  }

  if (bytes < 1024) return bytes.toFixed(2) + ' B';
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  do {
    bytes /= 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return bytes.toFixed(2) + ' ' + units[i];
}

// Run garbage collection if available
function runGC() {
  if (global.gc) {
    console.log('Running manual garbage collection...');
    const before = process.memoryUsage();
    global.gc();
    const after = process.memoryUsage();
    
    // Calculate freed memory
    const freed = {
      rss: before.rss - after.rss,
      heapTotal: before.heapTotal - after.heapTotal,
      heapUsed: before.heapUsed - after.heapUsed
    };
    
    console.log(`Memory freed - RSS: ${formatMemory(freed.rss)}, Heap: ${formatMemory(freed.heapUsed)}`);
    return freed;
  } else {
    console.log('Garbage collection not available. Run node with --expose-gc flag.');
    return null;
  }
}

// Get current memory usage
function getMemoryUsage(formatted = false) {
  const memory = process.memoryUsage();
  
  if (!formatted) return memory;
  
  return {
    rss: formatMemory(memory.rss),
    heapTotal: formatMemory(memory.heapTotal),
    heapUsed: formatMemory(memory.heapUsed),
    external: formatMemory(memory.external),
    arrayBuffers: formatMemory(memory.arrayBuffers || 0)
  };
}

// Check if memory usage is critical and needs attention
function isMemoryCritical() {
  const memory = process.memoryUsage();
  const heapUsedPercentage = (memory.heapUsed / memory.heapTotal) * 100;
  
  // Consider memory critical if heap usage is over 85% (increased from 75%)
  // This will reduce unnecessary warnings and cleanup operations
  return heapUsedPercentage > 85;
}

// Print memory info
function logMemoryUsage() {
  const memory = getMemoryUsage(true);
  console.log(`Memory Usage - RSS: ${memory.rss}, Heap Used: ${memory.heapUsed}/${memory.heapTotal}`);
  return memory;
}

// More aggressive memory cleanup
function forceCleanup() {
  console.log('Performing aggressive memory cleanup...');
  
  // Capture memory before cleanup
  const memBefore = process.memoryUsage();
  
  // Run garbage collection if available
  if (global.gc) {
    // Run twice for more thorough cleanup
    global.gc();
    setTimeout(() => {
      global.gc();
    }, 100);
  }
  
  // Clear unnecessary caches
  if (global.v8) {
    try {
      // Clear code cache
      if (typeof global.v8.clearFunctionPrototypeCache === 'function') {
        global.v8.clearFunctionPrototypeCache();
      }
    } catch (e) {
      console.error('Error clearing V8 caches:', e);
    }
  }
  
  // Reset peak memory tracking
  memoryStats.peak = {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0
  };
  
  // Capture memory after cleanup
  const memAfter = process.memoryUsage();
  
  // Calculate what was freed (ensure values are numbers)
  const freed = {
    rss: memBefore.rss - memAfter.rss,
    heapTotal: memBefore.heapTotal - memAfter.heapTotal,
    heapUsed: memBefore.heapUsed - memAfter.heapUsed
  };
  
  console.log(`Memory freed - RSS: ${formatMemory(freed.rss)}, Heap: ${formatMemory(freed.heapUsed)}`);
  
  return memAfter;
}

// Setup memory monitoring
function setupMemoryMonitoring(interval = 60000) { // Default: check every minute
  console.log(`Setting up memory monitoring (interval: ${interval}ms)`);
  
  // Initial memory snapshot
  takeMemorySnapshot();
  logMemoryUsage();
  
  // Set up interval for monitoring
  const monitoringInterval = setInterval(() => {
    takeMemorySnapshot();
    
    // Check for critical memory usage
    if (isMemoryCritical()) {
      console.log('⚠️ WARNING: Memory usage is critical!');
      const before = process.memoryUsage();
      
      // Try to free up memory more aggressively
      forceCleanup();
      
      // Log the results of cleanup
      const after = process.memoryUsage();
      // Make sure we're using valid numbers
      const freedRss = typeof before.rss === 'number' && typeof after.rss === 'number' ? before.rss - after.rss : 0;
      const freedHeap = typeof before.heapUsed === 'number' && typeof after.heapUsed === 'number' ? before.heapUsed - after.heapUsed : 0;
      
      console.log(`Memory freed: RSS: ${formatMemory(freedRss)}, Heap: ${formatMemory(freedHeap)}`);
    }
  }, interval);
  
  return monitoringInterval;
}

module.exports = {
  takeMemorySnapshot,
  getMemoryUsage,
  formatMemory,
  runGC,
  isMemoryCritical,
  logMemoryUsage,
  setupMemoryMonitoring,
  forceCleanup,
  memoryStats
}; 
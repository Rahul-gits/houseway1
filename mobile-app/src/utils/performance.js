import { InteractionManager } from 'react-native';
import { useMemo, useCallback } from 'react';

/**
 * Performance optimization utilities for React Native
 */

// Debounce hook for preventing excessive function calls
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Throttle hook for rate limiting
export const useThrottle = (callback, limit) => {
  const inThrottle = useRef(false);

  return useCallback((...args) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit]);
};

// Memoize expensive computations with interaction manager
export const useInteractionMemo = (factory, deps) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setResult(factory());
    });
  }, deps);

  return result;
};

// Optimized image loading with blur hash placeholder
export const OptimizedImage = ({ source, placeholder, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <View style={style}>
      {!loaded && !error && placeholder && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#EFE4D3' }]}>
          <Blurhash
            blurhash={placeholder}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      <Image
        source={source}
        style={style}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />

      {error && (
        <View style={[StyleSheet.absoluteFill, {
          backgroundColor: '#F8F1E6',
          justifyContent: 'center',
          alignItems: 'center'
        }]}>
          <Ionicons name="image-outline" size={24} color="#8B7D6B" />
        </View>
      )}
    </View>
  );
};

// Virtualized list for better performance with large datasets
export const VirtualizedList = ({
  data,
  renderItem,
  keyExtractor,
  getItemLayout,
  ...props
}) => {
  const memoizedRenderItem = useCallback(({ item, index }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      {...props}
    />
  );
};

// Performance monitor for debugging
export const PerformanceMonitor = {
  timers: {},

  start: (label) => {
    PerformanceMonitor.timers[label] = performance.now();
  },

  end: (label) => {
    if (PerformanceMonitor.timers[label]) {
      const duration = performance.now() - PerformanceMonitor.timers[label];
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      delete PerformanceMonitor.timers[label];
      return duration;
    }
  },

  measure: async (label, fn) => {
    PerformanceMonitor.start(label);
    const result = await fn();
    PerformanceMonitor.end(label);
    return result;
  }
};

// Memory usage optimization
export const MemoryOptimizer = {
  // Clear unused caches
  clearCaches: () => {
    // Clear image cache
    if (global.Image && global.Image.clear) {
      global.Image.clear();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  },

  // Batch state updates
  batchUpdates: (updates) => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        updates();
        resolve();
      });
    });
  }
};

export default {
  useDebounce,
  useThrottle,
  useInteractionMemo,
  OptimizedImage,
  VirtualizedList,
  PerformanceMonitor,
  MemoryOptimizer
};
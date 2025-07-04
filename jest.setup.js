// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'sendloop',
      slug: 'sendloop',
    },
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  createPermissionHook: jest.fn(() => () => [null, null, jest.fn()]),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
    runSync: jest.fn(),
    prepareSync: jest.fn(() => ({
      executeSync: jest.fn(),
      finalizeSync: jest.fn(),
    })),
  })),
}));

// Mock React Native TurboModuleRegistry before it's accessed
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn((name) => {
    // Mock DevMenu module specifically
    if (name === 'DevMenu') {
      return {
        reload: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      };
    }
    // Return mock for other modules
    return {};
  }),
  get: jest.fn(() => ({})),
}));

// Mock React Native components
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  Image: 'Image',
  TextInput: 'TextInput',
  Switch: 'Switch',
  Modal: 'Modal',
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...s }), {});
      }
      return style;
    },
  },
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    createAnimatedComponent: (Component) => Component,
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    parallel: jest.fn((animations) => ({
      start: jest.fn((cb) => cb && cb()),
    })),
  },
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Stack: {
    Screen: 'Screen',
  },
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const mockValue = (value) => ({ value });
  
  const mockReanimated = {
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
    createAnimatedComponent: (Component) => {
      // Return a proper React component that can handle props
      return React.forwardRef((props, ref) => {
        if (typeof Component === 'string') {
          return React.createElement('View', { testID: `animated-${Component}`, ref, ...props });
        }
        if (React.isValidElement(Component)) {
          return Component;
        }
        if (typeof Component === 'function') {
          return React.createElement(Component, { ref, ...props });
        }
        return React.createElement('View', { testID: 'animated-component', ref, ...props });
      });
    },
    useSharedValue: jest.fn(mockValue),
    useAnimatedStyle: jest.fn((fn) => ({})),
    useAnimatedProps: jest.fn((fn) => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((...values) => values[values.length - 1]),
    withRepeat: jest.fn((value, repetitions, reverse) => value),
    interpolate: jest.fn((value, inputRange, outputRange) => outputRange[1]),
    interpolateColor: jest.fn((value, inputRange, outputRange) => outputRange[1]),
    Extrapolate: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
  };
  
  return {
    default: mockReanimated,
    ...mockReanimated,
  };
});

// Mock React Native SVG
jest.mock('react-native-svg', () => {
  const React = require('react');
  
  const MockSvg = React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('View', { testID: 'svg', ref, ...props }, children)
  );
  MockSvg.displayName = 'MockSvg';
  
  const MockCircle = React.forwardRef((props, ref) => 
    React.createElement('View', { testID: 'circle', ref, ...props })
  );
  MockCircle.displayName = 'MockCircle';
  
  const MockPath = React.forwardRef((props, ref) => 
    React.createElement('View', { testID: 'path', ref, ...props })
  );
  MockPath.displayName = 'MockPath';
  
  const MockEllipse = React.forwardRef((props, ref) => 
    React.createElement('View', { testID: 'ellipse', ref, ...props })
  );
  MockEllipse.displayName = 'MockEllipse';
  
  const MockLinearGradient = React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('View', { testID: 'linear-gradient', ref, ...props }, children)
  );
  MockLinearGradient.displayName = 'MockLinearGradient';
  
  const MockStop = React.forwardRef((props, ref) => 
    React.createElement('View', { testID: 'stop', ref, ...props })
  );
  MockStop.displayName = 'MockStop';
  
  const MockDefs = React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('View', { testID: 'defs', ref, ...props }, children)
  );
  MockDefs.displayName = 'MockDefs';
  
  const MockG = React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('View', { testID: 'g', ref, ...props }, children)
  );
  MockG.displayName = 'MockG';
  
  return {
    default: MockSvg,
    Svg: MockSvg,
    Circle: MockCircle,
    Path: MockPath,
    Ellipse: MockEllipse,
    LinearGradient: MockLinearGradient,
    Stop: MockStop,
    Defs: MockDefs,
    G: MockG,
  };
});

// Enable fake timers by default
jest.useFakeTimers();
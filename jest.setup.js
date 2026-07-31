import 'react-native-gesture-handler/jestSetup';

// Reanimated's worklets runtime has no native module under Jest; the manual
// mock in __mocks__/react-native-reanimated.js is picked up automatically.
jest.mock('react-native-reanimated');

// React Testing Library v13+ dropped react-test-renderer, which used to set this
// flag. Without it React warns "not configured to support act(...)" and state
// updates from hooks are never flushed into the rendered tree.
global.IS_REACT_ACT_ENVIRONMENT = true;

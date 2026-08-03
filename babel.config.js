module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // react-native-reanimated's Babel plugin MUST be listed last —
    // misordering this is a common source of a crash at startup.
    'react-native-worklets/plugin',
  ],
};

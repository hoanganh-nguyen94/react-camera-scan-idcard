module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        processNestedWorklets: true,
      },
    ],
    ['react-native-worklets-core/plugin'],

  ],
};

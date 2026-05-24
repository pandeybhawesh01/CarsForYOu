module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vision-camera|react-native-fs|react-native-safe-area-context|react-native-screens|@react-navigation)/)',
  ],
  moduleNameMapper: {
    'react-native-fs': '<rootDir>/__mocks__/react-native-fs.ts',
    'react-native-vision-camera': '<rootDir>/__mocks__/react-native-vision-camera.ts',
  },
};

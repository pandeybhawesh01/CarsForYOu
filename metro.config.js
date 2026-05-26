const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const blockList = new RegExp(
	[
		'node_modules[\\/]react-native-nitro-image[\\/]android[\\/]\\.cxx[\\/].*',
		'node_modules[\\/]react-native-nitro-modules[\\/]android[\\/]\\.cxx[\\/].*',
		'node_modules[\\/]react-native-vision-camera[\\/]android[\\/]\\.cxx[\\/].*',
	].join('|'),
);

const config = {
	resolver: {
		blockList,
	},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

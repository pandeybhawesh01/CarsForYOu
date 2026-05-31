// Mock for react-native-image-picker used in tests.
// Defaults to a cancelled pick so no media flows through unless a test overrides it.
export const launchImageLibrary = jest.fn().mockResolvedValue({ didCancel: true });
export const launchCamera = jest.fn().mockResolvedValue({ didCancel: true });

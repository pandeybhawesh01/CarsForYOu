/**
 * Mock for react-native-fs
 */
const RNFS = {
  TemporaryDirectoryPath: '/tmp',
  CachesDirectoryPath: '/cache',
  DocumentDirectoryPath: '/documents',
  exists: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({ size: '1024' }),
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(''),
  copyFile: jest.fn().mockResolvedValue(undefined),
  moveFile: jest.fn().mockResolvedValue(undefined),
};

export default RNFS;

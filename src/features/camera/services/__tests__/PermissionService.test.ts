import { Linking, Platform } from 'react-native';

jest.mock('react-native-vision-camera', () => ({
  VisionCamera: {
    cameraPermissionStatus: 'authorized',
    microphonePermissionStatus: 'authorized',
    requestCameraPermission: jest.fn().mockResolvedValue(true),
    requestMicrophonePermission: jest.fn().mockResolvedValue(true),
  },
}));

describe('PermissionService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('checkCameraPermission maps authorized -> granted', async () => {
    // require after mocks have been set up
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    const status = await PermissionService.checkCameraPermission();
    expect(status).toBe('granted');
  });

  it('checkMicrophonePermission maps authorized -> granted', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    const status = await PermissionService.checkMicrophonePermission();
    expect(status).toBe('granted');
  });

  it('requestCameraPermission returns granted when VisionCamera resolves true', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    const status = await PermissionService.requestCameraPermission();
    expect(status).toBe('granted');
  });

  it('requestMicrophonePermission returns granted when VisionCamera resolves true', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    const status = await PermissionService.requestMicrophonePermission();
    expect(status).toBe('granted');
  });

  it('openAppSettings calls Linking.openSettings', () => {
    const openSpy = jest.spyOn(Linking, 'openSettings').mockImplementation(() => {});
    // import after mocking
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    PermissionService.openAppSettings();
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('shouldShowPermissionRationale returns true on android, false on ios', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PermissionService } = require('../PermissionService');
    const orig = Platform.OS;
    // @ts-ignore
    Platform.OS = 'android';
    expect(await PermissionService.shouldShowPermissionRationale('camera')).toBe(true);
    // @ts-ignore
    Platform.OS = 'ios';
    expect(await PermissionService.shouldShowPermissionRationale('camera')).toBe(false);
    // restore
    // @ts-ignore
    Platform.OS = orig;
  });
});

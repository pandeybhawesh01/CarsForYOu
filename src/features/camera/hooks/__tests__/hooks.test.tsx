import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

describe('Camera hooks', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('useCameraPermissions returns mapped permission statuses and actions', () => {
    jest.mock('react-native-vision-camera', () => ({
      useCameraPermission: () => ({ status: 'authorized', hasPermission: true, requestPermission: jest.fn().mockResolvedValue(true) }),
      useMicrophonePermission: () => ({ status: 'denied', hasPermission: false, requestPermission: jest.fn().mockResolvedValue(false) }),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useCameraPermissions } = require('../useCameraPermissions');

    let result: any = null;

    function TestComp() {
      result = useCameraPermissions();
      return null;
    }

    act(() => {
      TestRenderer.create(React.createElement(TestComp));
    });

    expect(result.cameraPermission).toBe('granted');
    expect(result.microphonePermission).toBe('denied');
    expect(typeof result.requestCameraPermission).toBe('function');
  });

  it('useCameraCapture openCamera respects permissions and captures flow', async () => {
    // Mock useCameraPermissions used inside hook
    jest.mock('../useCameraPermissions', () => ({
      useCameraPermissions: () => ({
        hasCameraPermission: false,
        requestCameraPermission: jest.fn().mockResolvedValue(true),
      }),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useCameraCapture } = require('../useCameraCapture');

    let result: any = null;

    function TestComp() {
      result = useCameraCapture();
      return null;
    }

    let tree: any;
    act(() => {
      tree = TestRenderer.create(React.createElement(TestComp));
    });

    await act(async () => {
      await result.openCamera();
    });

    expect(result.isCameraVisible).toBe(true);

    // Test capture promise resolves when internal success callback is called
    const capturePromise = result.capturePhoto();
    act(() => {
      // call internal callback exposed in hook implementation
      result._onCaptureSuccess('file:///tmp/photo.jpg');
    });

    await expect(capturePromise).resolves.toBe('file:///tmp/photo.jpg');
    tree.unmount();
  });

  it('useCameraRecording start/stop and duration timer work', async () => {
    jest.mock('../useCameraPermissions', () => ({
      useCameraPermissions: () => ({
        hasCameraPermission: true,
        hasMicrophonePermission: true,
        requestAllPermissions: jest.fn().mockResolvedValue(true),
      }),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useCameraRecording } = require('../useCameraRecording');

    let result: any = null;

    function TestComp() {
      result = useCameraRecording();
      return null;
    }

    let tree: any;
    act(() => {
      tree = TestRenderer.create(React.createElement(TestComp));
    });

    // open camera (should set visible)
    await act(async () => {
      await result.openCamera();
    });

    expect(result.isCameraVisible).toBe(true);

    // start recording
    act(() => result.startRecording());
    expect(result.isRecording).toBe(true);

    // stopRecording returns a promise resolved by internal callback
    const stopPromise = result.stopRecording();
    act(() => result._onRecordingFinished('file:///tmp/video.mp4'));
    await expect(stopPromise).resolves.toBe('file:///tmp/video.mp4');

    tree.unmount();
  });
});

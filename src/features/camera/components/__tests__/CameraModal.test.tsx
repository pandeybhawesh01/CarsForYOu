import React from 'react';
import renderer from 'react-test-renderer';
import CameraModal from '../CameraModal';

jest.mock('../../services/CameraService', () => ({
  CameraService: {
    capturePhoto: jest.fn().mockResolvedValue('file://photo.jpg'),
    startRecording: jest.fn().mockImplementation((_recorder, onFinished) => {
      onFinished('file://video.mp4');
      return Promise.resolve();
    }),
    stopRecording: jest.fn().mockResolvedValue(undefined),
  },
}));

const onClose = jest.fn();
const onCapture = jest.fn();
const onError = jest.fn();

describe('CameraModal', () => {
  it('captures photo and calls callbacks', async () => {
    const tree = renderer.create(
      <CameraModal visible={true} mode="photo" onClose={onClose} onCapture={onCapture} onError={onError} />,
    );

    const root = tree.root;

    // Main action button should be accessible
    const main = root.findAllByProps({ accessibilityLabel: 'Capture photo' })[0];
    await renderer.act(async () => {
      await main.props.onPress();
    });

    const usePhoto = root.findAllByProps({ accessibilityLabel: 'Use this photo' })[0];
    usePhoto.props.onPress();

    // onCapture and onClose should be called (capturePhoto resolves)
    expect(onCapture).toHaveBeenCalledWith('file://photo.jpg');
    expect(onClose).toHaveBeenCalled();
  });

  it('starts recording and confirms video in video mode', async () => {
    const tree = renderer.create(
      <CameraModal visible={true} mode="video" onClose={onClose} onCapture={onCapture} onError={onError} />,
    );

    const root = tree.root;

    const start = root.findAllByProps({ accessibilityLabel: 'Start recording' })[0];
    await renderer.act(async () => {
      await start.props.onPress();
    });

    const useVideo = root.findAllByProps({ accessibilityLabel: 'Use this video' })[0];
    useVideo.props.onPress();

    // startRecording triggers onFinished synchronously in mock
    expect(onCapture).toHaveBeenCalledWith('file://video.mp4');
    expect(onClose).toHaveBeenCalled();
  });
});

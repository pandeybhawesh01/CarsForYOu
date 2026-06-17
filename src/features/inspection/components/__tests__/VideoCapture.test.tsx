import React from 'react';
import renderer from 'react-test-renderer';
import VideoCapture from '../VideoCapture';

jest.mock('../../../camera/services/CameraService', () => ({
  CameraService: {
    capturePhoto: jest.fn(),
    startRecording: jest.fn().mockImplementation((ref, opts, onFinished) => onFinished('file://video.mp4')),
    stopRecording: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('VideoCapture', () => {
  it('opens camera and returns recorded uri', () => {
    const onCapture = jest.fn();

    const tree = renderer.create(
      <VideoCapture label="Test" onCapture={onCapture} />,
    );

    const root = tree.root;

    const open = root.findAllByProps({ accessibilityLabel: 'Record video: Test' })[0];
    open.props.onPress();

    const start = root.findAllByProps({ accessibilityLabel: 'Start recording' })[0];
    start.props.onPress();

    expect(onCapture).toHaveBeenCalledWith('file://video.mp4');
  });
});

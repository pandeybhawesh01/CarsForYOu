import React from 'react';
import renderer from 'react-test-renderer';
import PhotoCapture from '../PhotoCapture';

jest.mock('../../../camera/services/CameraService', () => ({
  CameraService: {
    capturePhoto: jest.fn().mockResolvedValue('file://photo.jpg'),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
  },
}));

describe('PhotoCapture', () => {
  it('opens camera and returns captured uri', async () => {
    const onCapture = jest.fn();

    const tree = renderer.create(
      <PhotoCapture label="Test" onCapture={onCapture} />,
    );

    const root = tree.root;

    const open = root.findAllByProps({ accessibilityLabel: 'Capture photo: Test' })[0];
    open.props.onPress();

    // CameraModal's mock will call onCapture; simulate pressing main button
    const main = root.findAllByProps({ accessibilityLabel: 'Capture photo' })[0];
    await main.props.onPress();

    expect(onCapture).toHaveBeenCalledWith('file://photo.jpg');
  });
});

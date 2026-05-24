import React from 'react';
import renderer from 'react-test-renderer';
import CameraControls from '../CameraControls';

describe('CameraControls', () => {
  it('calls appropriate handlers for photo mode', () => {
    const onCapture = jest.fn();
    const onStartRecording = jest.fn();
    const onStopRecording = jest.fn();
    const onCancel = jest.fn();
    const onToggleFlash = jest.fn();

    const tree = renderer.create(
      <CameraControls
        mode="photo"
        isRecording={false}
        hasFlash={true}
        flashMode="auto"
        onCapture={onCapture}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onCancel={onCancel}
        onToggleFlash={onToggleFlash}
      />,
    );

    const root = tree.root;

    // Find flash button
    const flash = root.findAllByProps({ accessibilityLabel: expect.stringContaining('Flash mode') })[0];
    flash.props.onPress();
    expect(onToggleFlash).toHaveBeenCalled();

    // Find main action (capture photo)
    const main = root.findAllByProps({ accessibilityLabel: 'Capture photo' })[0];
    main.props.onPress();
    expect(onCapture).toHaveBeenCalled();

    // Find cancel
    const cancel = root.findAllByProps({ accessibilityLabel: 'Cancel and close camera' })[0];
    cancel.props.onPress();
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls recording handlers in video mode', () => {
    const onCapture = jest.fn();
    const onStartRecording = jest.fn();
    const onStopRecording = jest.fn();
    const onCancel = jest.fn();
    const onToggleFlash = jest.fn();

    const tree = renderer.create(
      <CameraControls
        mode="video"
        isRecording={false}
        hasFlash={true}
        flashMode="on"
        onCapture={onCapture}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onCancel={onCancel}
        onToggleFlash={onToggleFlash}
      />,
    );

    const root = tree.root;

    // Start recording
    const start = root.findAllByProps({ accessibilityLabel: 'Start recording' })[0];
    start.props.onPress();
    expect(onStartRecording).toHaveBeenCalled();

    // Simulate recording state
    tree.update(
      <CameraControls
        mode="video"
        isRecording={true}
        hasFlash={true}
        flashMode="on"
        onCapture={onCapture}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onCancel={onCancel}
        onToggleFlash={onToggleFlash}
      />,
    );

    const stop = tree.root.findAllByProps({ accessibilityLabel: 'Stop recording' })[0];
    stop.props.onPress();
    expect(onStopRecording).toHaveBeenCalled();
  });
});

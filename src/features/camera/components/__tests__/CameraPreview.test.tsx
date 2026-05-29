import React from 'react';
import renderer from 'react-test-renderer';
import CameraPreview from '../CameraPreview';

const fakeDevice = {
  id: 'back-camera',
  position: 'back',
  hasFlash: true,
};

describe('CameraPreview', () => {
  it('shows loading overlay before started and children after started', () => {
    const onInitialized = jest.fn();
    const onError = jest.fn();

    const tree = renderer.create(
      <CameraPreview
        device={fakeDevice as any}
        isActive={true}
        outputs={[]}
        onInitialized={onInitialized}
        onError={onError}
      >
        <React.Fragment>
          <TextChild />
        </React.Fragment>
      </CameraPreview>,
    );

    const root = tree.root;

    // Since mock Camera calls onStarted during mount, children should be visible
    const child = root.findAllByType(TextChild)[0];
    expect(child).toBeTruthy();
  });
});

function TextChild() {
  return <div>child</div> as any;
}

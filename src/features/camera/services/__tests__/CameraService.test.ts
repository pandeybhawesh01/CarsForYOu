import { CameraService } from '../CameraService';
import { CameraErrorCode } from '../../types';

describe('CameraService', () => {
  it('capturePhoto returns file:// URI on success', async () => {
    const photoOutput = {
      capturePhotoToFile: jest.fn().mockResolvedValue({ filePath: '/tmp/photo.jpg' }),
    } as any;

    const uri = await CameraService.capturePhoto(photoOutput);
    expect(uri).toBe('file:///tmp/photo.jpg');
    expect(photoOutput.capturePhotoToFile).toHaveBeenCalled();
  });

  it('capturePhoto throws CameraError with CAPTURE_FAILED on failure', async () => {
    const photoOutput = {
      capturePhotoToFile: jest.fn().mockRejectedValue(new Error('capture failed')),
    } as any;

    await expect(CameraService.capturePhoto(photoOutput)).rejects.toHaveProperty(
      'code',
      CameraErrorCode.CAPTURE_FAILED,
    );
  });

  it('startRecording calls onRecordingFinished when recorder resolves', async () => {
    const onFinished = jest.fn();
    const onError = jest.fn();

    const recorder = {
      startRecording: jest.fn().mockImplementation((onFinish: any) => {
        onFinish('/tmp/video.mp4', 'stopped');
        return Promise.resolve();
      }),
    } as any;

    await CameraService.startRecording(recorder, onFinished, onError);
    expect(onFinished).toHaveBeenCalledWith('file:///tmp/video.mp4');
    expect(onError).not.toHaveBeenCalled();
  });

  it('startRecording calls onRecordingError when recorder triggers error', async () => {
    const onFinished = jest.fn();
    const onError = jest.fn();

    const recorder = {
      startRecording: jest.fn().mockImplementation((_onFinish: any, onErr: any) => {
        onErr(new Error('record failed'));
        return Promise.resolve();
      }),
    } as any;

    await CameraService.startRecording(recorder, onFinished, onError);
    expect(onError).toHaveBeenCalled();
    expect(onFinished).not.toHaveBeenCalled();
  });

  it('stopRecording resolves when recorder.stopRecording succeeds', async () => {
    const recorder = { stopRecording: jest.fn().mockResolvedValue(undefined) } as any;
    await expect(CameraService.stopRecording(recorder)).resolves.toBeUndefined();
    expect(recorder.stopRecording).toHaveBeenCalled();
  });

  it('stopRecording throws CameraError with RECORDING_FAILED on failure', async () => {
    const recorder = { stopRecording: jest.fn().mockRejectedValue(new Error('stop failed')) } as any;
    await expect(CameraService.stopRecording(recorder)).rejects.toHaveProperty(
      'code',
      CameraErrorCode.RECORDING_FAILED,
    );
  });
});

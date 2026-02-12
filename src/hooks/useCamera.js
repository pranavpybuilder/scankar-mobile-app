import {useCallback, useMemo, useRef, useState} from 'react';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import ImagePicker from 'react-native-image-crop-picker';
import {toFileUri} from '../utils/imageUtils';

const normalizePhoto = photo => ({
  uri: toFileUri(photo?.path || photo?.uri || ''),
  width: Number(photo?.width) || 0,
  height: Number(photo?.height) || 0,
  source: photo?.source || 'camera',
});

export const useCamera = () => {
  const cameraRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState('off');
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const ensurePermission = useCallback(async () => {
    if (hasPermission) {
      return true;
    }
    const status = await requestPermission();
    return status === true || status === 'authorized' || status === 'granted';
  }, [hasPermission, requestPermission]);

  const takePhoto = useCallback(async () => {
    try {
      const allowed = await ensurePermission();
      if (!allowed) {
        return {success: false, error: 'Camera permission denied'};
      }
      if (!cameraRef.current) {
        return {success: false, error: 'Camera is not ready'};
      }

      setCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash,
        qualityPrioritization: 'quality',
      });

      return {success: true, image: normalizePhoto({...photo, source: 'camera'})};
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to capture image',
      };
    } finally {
      setCapturing(false);
    }
  }, [ensurePermission, flash]);

  const pickFromGallery = useCallback(async () => {
    try {
      const picked = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
        includeExif: true,
      });
      return {success: true, image: normalizePhoto({...picked, source: 'gallery'})};
    } catch (error) {
      if (error?.code === 'E_PICKER_CANCELLED') {
        return {success: false, cancelled: true};
      }
      return {
        success: false,
        error: error?.message || 'Failed to open gallery',
      };
    }
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  }, []);

  return useMemo(
    () => ({
      cameraRef,
      device,
      hasPermission,
      capturing,
      flash,
      ensurePermission,
      takePhoto,
      pickFromGallery,
      toggleFlash,
    }),
    [
      device,
      hasPermission,
      capturing,
      flash,
      ensurePermission,
      takePhoto,
      pickFromGallery,
      toggleFlash,
    ],
  );
};

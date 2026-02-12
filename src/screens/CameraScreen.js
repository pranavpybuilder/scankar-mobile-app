import React, {useEffect} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Camera} from 'react-native-vision-camera';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CameraOverlay from '../components/camera/CameraOverlay';
import CaptureButton from '../components/camera/CaptureButton';
import {useCamera} from '../hooks/useCamera';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';

const CameraScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {
    cameraRef,
    device,
    hasPermission,
    capturing,
    flash,
    ensurePermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
  } = useCamera();

  useEffect(() => {
    ensurePermission();
  }, [ensurePermission]);

  const openPreview = image => {
    navigation.navigate('ImagePreview', {
      imageUri: image.uri,
      imageWidth: image.width,
      imageHeight: image.height,
      source: image.source,
    });
  };

  const onCapture = async () => {
    const result = await takePhoto();
    if (result.success) {
      openPreview(result.image);
      return;
    }
    if (!result.cancelled) {
      Alert.alert('Capture failed', result.error || 'Unknown capture error');
    }
  };

  const onPickGallery = async () => {
    const result = await pickFromGallery();
    if (result.success) {
      openPreview(result.image);
      return;
    }
    if (!result.cancelled) {
      Alert.alert('Gallery import failed', result.error || 'Unknown gallery error');
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionRoot}>
        <Card>
          <Text style={styles.title}>Camera permission required</Text>
          <Text style={styles.text}>
            Grant camera permission to capture machine-reading sheets directly in the app.
          </Text>
          <Button title="Grant Permission" onPress={ensurePermission} />
        </Card>
        <Button title="Import from Gallery" type="ghost" onPress={onPickGallery} />
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.permissionRoot}>
        <Card>
          <Text style={styles.title}>No back camera found</Text>
          <Text style={styles.text}>
            This device does not expose a back camera through Vision Camera.
          </Text>
        </Card>
        <Button title="Import from Gallery" onPress={onPickGallery} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={isFocused} photo />
      <CameraOverlay />

      <SafeAreaView style={styles.topRow}>
        <TouchableOpacity style={styles.pill} onPress={() => navigation.goBack()}>
          <Text style={styles.pillText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill} onPress={toggleFlash}>
          <Text style={styles.pillText}>Flash: {flash.toUpperCase()}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomAction} onPress={onPickGallery}>
          <Text style={styles.bottomActionText}>Gallery</Text>
        </TouchableOpacity>
        <CaptureButton onPress={onCapture} disabled={capturing} />
        <TouchableOpacity style={styles.bottomAction} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.bottomActionText}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionRoot: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  text: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  topRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
  },
  pillText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  bottomAction: {
    minWidth: 90,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 10,
  },
  bottomActionText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});

export default CameraScreen;

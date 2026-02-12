import React, {useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PerspectiveOverlay from '../components/editor/PerspectiveOverlay';
import {COLORS} from '../constants/colors';
import {SPACING} from '../constants/spacing';
import {
  buildPreprocessOptions,
  DEFAULT_PERSPECTIVE_POINTS,
  normalizePerspectivePoints,
  normalizeRotation,
  stripFileProtocol,
  toFileUri,
} from '../utils/imageUtils';

const ImagePreviewScreen = ({navigation, route}) => {
  const imageUri = route.params?.imageUri || '';
  const source = route.params?.source || 'camera';
  const imageWidth = route.params?.imageWidth || 0;
  const imageHeight = route.params?.imageHeight || 0;

  const [workingImageUri, setWorkingImageUri] = useState(imageUri);
  const [rotation, setRotation] = useState(0);
  const [cropRect, setCropRect] = useState(null);
  const [perspectiveMode, setPerspectiveMode] = useState(false);
  const [perspectivePoints, setPerspectivePoints] = useState(DEFAULT_PERSPECTIVE_POINTS);
  const [busy, setBusy] = useState(false);

  const preprocessOptions = useMemo(
    () =>
      buildPreprocessOptions({
        rotation,
        cropRect,
        perspectivePoints,
        imageWidth,
        imageHeight,
        source,
        userAdjusted: true,
      }),
    [cropRect, imageHeight, imageWidth, perspectivePoints, rotation, source],
  );

  const rotateLeft = () => setRotation(prev => normalizeRotation(prev - 90));
  const rotateRight = () => setRotation(prev => normalizeRotation(prev + 90));

  const runCropper = async () => {
    if (!workingImageUri) {
      return;
    }
    try {
      setBusy(true);
      const cropped = await ImagePicker.openCropper({
        path: stripFileProtocol(workingImageUri),
        freeStyleCropEnabled: true,
      });
      setWorkingImageUri(toFileUri(cropped.path));
      setCropRect(
        cropped.cropRect
          ? {
              x: cropped.cropRect.x || 0,
              y: cropped.cropRect.y || 0,
              width: cropped.cropRect.width || cropped.width || 0,
              height: cropped.cropRect.height || cropped.height || 0,
            }
          : {
              x: 0,
              y: 0,
              width: cropped.width || 0,
              height: cropped.height || 0,
            },
      );
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Crop failed', error?.message || 'Unable to crop image');
      }
    } finally {
      setBusy(false);
    }
  };

  const resetAdjustments = () => {
    setRotation(0);
    setCropRect(null);
    setPerspectivePoints(DEFAULT_PERSPECTIVE_POINTS);
    setPerspectiveMode(false);
    setWorkingImageUri(imageUri);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.imageCard}>
        <View style={styles.previewCanvas}>
          {!!workingImageUri && (
            <Image
              source={{uri: workingImageUri}}
              resizeMode="contain"
              style={[styles.previewImage, {transform: [{rotate: `${rotation}deg`}]}]}
            />
          )}
          {perspectiveMode && (
            <PerspectiveOverlay
              points={perspectivePoints}
              onChange={next => setPerspectivePoints(normalizePerspectivePoints(next))}
            />
          )}
        </View>
        <Text style={styles.label}>Source: {source}</Text>
        <Text style={styles.label}>Rotation: {rotation}deg</Text>
        <Text style={styles.label}>Crop: {cropRect ? 'Applied' : 'Not applied'}</Text>
      </Card>

      <Card>
        <Text style={styles.editorTitle}>Adjust image before OCR</Text>
        <View style={styles.row}>
          <Button title="Crop" onPress={runCropper} disabled={busy} style={styles.controlBtn} />
          <Button title="-90" type="ghost" onPress={rotateLeft} style={styles.controlBtn} />
          <Button title="+90" type="ghost" onPress={rotateRight} style={styles.controlBtn} />
        </View>
        <View style={styles.row}>
          <Button
            title={perspectiveMode ? 'Lock Perspective' : 'Edit Perspective'}
            type={perspectiveMode ? 'secondary' : 'ghost'}
            onPress={() => setPerspectiveMode(prev => !prev)}
            style={styles.controlBtn}
          />
          <Button title="Reset" type="ghost" onPress={resetAdjustments} style={styles.controlBtn} />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Retake" type="ghost" onPress={() => navigation.goBack()} />
        <Button
          title="Process Offline"
          disabled={!workingImageUri}
          onPress={() =>
            navigation.navigate('Processing', {
              imageUri: workingImageUri,
              preprocessOptions,
            })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  imageCard: {
    gap: SPACING.sm,
  },
  previewCanvas: {
    height: 280,
    backgroundColor: '#101010',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    color: COLORS.textSecondary,
  },
  editorTitle: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  controlBtn: {
    flex: 1,
  },
  actions: {
    gap: SPACING.sm,
  },
});

export default ImagePreviewScreen;

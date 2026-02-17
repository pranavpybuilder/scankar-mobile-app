import {NativeModules} from 'react-native';
import {buildPreprocessOptions} from '../../utils/imageUtils';
import DeterministicGridDetector from '../table/DeterministicGridDetector';

const OpenCvNative =
  NativeModules?.OpenCVModule ||
  NativeModules?.RNOpenCv ||
  NativeModules?.RNOpenCVModule;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

class OpenCVService {
  normalizeDimension(value, fallback) {
    const dimension = Math.round(Number(value) || 0);
    return clamp(dimension || fallback, 1, 12000);
  }

  isQuarterTurn(rotation) {
    return rotation === 90 || rotation === 270;
  }

  resolveFallbackDimensions(options) {
    let width = this.normalizeDimension(options.imageWidth, 1280);
    let height = this.normalizeDimension(options.imageHeight, 720);

    if (options.cropRect?.width > 0 && options.cropRect?.height > 0) {
      width = this.normalizeDimension(options.cropRect.width, width);
      height = this.normalizeDimension(options.cropRect.height, height);
    }

    if (this.isQuarterTurn(options.rotation)) {
      [width, height] = [height, width];
    }

    if (options.userAdjusted && Array.isArray(options.perspectivePoints)) {
      const xs = options.perspectivePoints.map(point => Number(point?.x) || 0);
      const ys = options.perspectivePoints.map(point => Number(point?.y) || 0);
      const perspectiveWidthFactor = clamp(
        Math.max(...xs) - Math.min(...xs),
        0.35,
        1,
      );
      const perspectiveHeightFactor = clamp(
        Math.max(...ys) - Math.min(...ys),
        0.35,
        1,
      );

      width = this.normalizeDimension(width * perspectiveWidthFactor, width);
      height = this.normalizeDimension(
        height * perspectiveHeightFactor,
        height,
      );
    }

    return {width, height};
  }

  buildTableBoundsHint(width, height, options) {
    if (options.userAdjusted && Array.isArray(options.perspectivePoints)) {
      const xs = options.perspectivePoints.map(point => Number(point?.x) || 0);
      const ys = options.perspectivePoints.map(point => Number(point?.y) || 0);
      const minX = clamp(Math.min(...xs), 0, 1);
      const maxX = clamp(Math.max(...xs), 0, 1);
      const minY = clamp(Math.min(...ys), 0, 1);
      const maxY = clamp(Math.max(...ys), 0, 1);

      const x = Math.round(width * minX);
      const y = Math.round(height * minY);
      const w = this.normalizeDimension(
        width * Math.max(0.2, maxX - minX),
        width,
      );
      const h = this.normalizeDimension(
        height * Math.max(0.2, maxY - minY),
        height,
      );

      return {x, y, w, h};
    }

    const marginX = Math.round(width * 0.04);
    const marginY = Math.round(height * 0.08);
    return {
      x: marginX,
      y: marginY,
      w: Math.max(80, width - marginX * 2),
      h: Math.max(80, height - marginY * 2),
    };
  }

  buildTransformPipeline(options) {
    const transforms = [
      'deskew',
      'noise-reduction',
      'adaptive-threshold',
      'contrast-enhancement',
    ];
    if (options.rotation) {
      transforms.unshift(`rotation-${options.rotation}`);
    }
    if (options.cropRect && options.userAdjusted) {
      transforms.unshift('crop');
    }
    if (options.perspectivePoints && options.userAdjusted) {
      transforms.unshift('perspective-correction');
    }
    return transforms;
  }

  async preprocessImage(imageUri, rawOptions = {}) {
    const options = buildPreprocessOptions(rawOptions);
    const transforms = this.buildTransformPipeline(options);
    const fallbackDimensions = this.resolveFallbackDimensions(options);

    if (OpenCvNative?.preprocessImage) {
      try {
        const nativeResult = await OpenCvNative.preprocessImage({
          imageUri,
          options,
          transforms,
        });
        const width = this.normalizeDimension(
          nativeResult?.width,
          fallbackDimensions.width,
        );
        const height = this.normalizeDimension(
          nativeResult?.height,
          fallbackDimensions.height,
        );
        return {
          uri: nativeResult?.uri || imageUri,
          width,
          height,
          transforms,
          tableBoundsHint: this.buildTableBoundsHint(width, height, options),
          userAdjustments: options,
          native: true,
        };
      } catch (error) {
        // Fall through to deterministic JS fallback when native bridge is missing/unstable.
      }
    }

    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      uri: imageUri,
      width: fallbackDimensions.width,
      height: fallbackDimensions.height,
      transforms,
      tableBoundsHint: this.buildTableBoundsHint(
        fallbackDimensions.width,
        fallbackDimensions.height,
        options,
      ),
      userAdjustments: options,
      native: false,
    };
  }

  async detectTableGrid(preprocessedImage) {
    const image = preprocessedImage || {};

    if (OpenCvNative?.detectTableGrid) {
      try {
        const nativeResult = await OpenCvNative.detectTableGrid({
          imageUri: image.uri,
          width: image.width,
          height: image.height,
          tableBoundsHint: image.tableBoundsHint,
          transforms: image.transforms || [],
        });

        const normalized = DeterministicGridDetector.fromNative(
          nativeResult,
          image,
        );
        if (normalized) {
          return normalized;
        }
      } catch (error) {
        // Ignore bridge failure and continue with deterministic fallback.
      }
    }

    return DeterministicGridDetector.detect(image);
  }
}

export default new OpenCVService();

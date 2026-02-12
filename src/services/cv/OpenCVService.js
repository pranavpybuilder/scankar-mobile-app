import {NativeModules} from 'react-native';
import {buildPreprocessOptions} from '../../utils/imageUtils';

const OpenCvNative =
  NativeModules?.OpenCVModule || NativeModules?.RNOpenCv || NativeModules?.RNOpenCVModule;

class OpenCVService {
  buildTransformPipeline(options) {
    const transforms = ['deskew', 'noise-reduction', 'adaptive-threshold', 'contrast-enhancement'];
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

    if (OpenCvNative?.preprocessImage) {
      try {
        const nativeResult = await OpenCvNative.preprocessImage({
          imageUri,
          options,
          transforms,
        });
        return {
          uri: nativeResult?.uri || imageUri,
          width: Number(nativeResult?.width) || options.imageWidth || 1280,
          height: Number(nativeResult?.height) || options.imageHeight || 720,
          transforms,
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
      width: options.imageWidth || 1280,
      height: options.imageHeight || 720,
      transforms,
      userAdjustments: options,
      native: false,
    };
  }
}

export default new OpenCVService();

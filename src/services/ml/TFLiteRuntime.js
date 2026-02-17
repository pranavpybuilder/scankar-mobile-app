import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {CONFIG} from '../../constants/config';

const getNativeRuntimeModule = () =>
  NativeModules?.TFLiteModule ||
  NativeModules?.TensorFlowLiteModule ||
  NativeModules?.RNTFLite ||
  NativeModules?.RNFastTflite;

const DEFAULT_STATUS = {
  initialized: false,
  available: false,
  mode: 'fallback-js',
  nativeModule: false,
  models: {},
  reason: 'not-initialized',
};

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

class TFLiteRuntime {
  constructor() {
    this.initialized = false;
    this.status = DEFAULT_STATUS;
    this.nativeModule = getNativeRuntimeModule();
  }

  getModelConfig() {
    const config = CONFIG?.TFLITE || {};
    return {
      enabled: config.enabled !== false,
      modelAssetDir: config.modelAssetDir || 'models',
      models: {
        tableStructure:
          config?.models?.tableStructure || 'table_structure.tflite',
        textDetection: config?.models?.textDetection || 'text_detection.tflite',
        handwritingOCR:
          config?.models?.handwritingOCR || 'handwriting_ocr.tflite',
        imageEnhancement:
          config?.models?.imageEnhancement || 'image_enhancement.tflite',
      },
    };
  }

  getModelCandidates(fileName, modelAssetDir) {
    const iosBundlePath = `${RNFS.MainBundlePath}/${modelAssetDir}/${fileName}`;
    return [
      {type: 'asset', value: `${modelAssetDir}/${fileName}`},
      {type: 'asset', value: fileName},
      {type: 'absolute', value: iosBundlePath},
      {
        type: 'absolute',
        value: `file:///android_asset/${modelAssetDir}/${fileName}`,
      },
    ];
  }

  async existsCandidate(candidate) {
    try {
      if (candidate.type === 'asset') {
        if (
          Platform.OS !== 'android' ||
          typeof RNFS.existsAssets !== 'function'
        ) {
          return false;
        }
        return Boolean(await RNFS.existsAssets(candidate.value));
      }

      if (candidate.type === 'absolute') {
        if (candidate.value.startsWith('file:///android_asset/')) {
          if (
            Platform.OS !== 'android' ||
            typeof RNFS.existsAssets !== 'function'
          ) {
            return false;
          }
          const relative = candidate.value.replace(
            'file:///android_asset/',
            '',
          );
          return Boolean(await RNFS.existsAssets(relative));
        }
        return Boolean(await RNFS.exists(candidate.value));
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  async resolveModelPath(fileName, modelAssetDir) {
    const candidates = this.getModelCandidates(fileName, modelAssetDir);
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      const exists = await this.existsCandidate(candidate);
      if (exists) {
        return {
          exists: true,
          type: candidate.type,
          path: candidate.value,
        };
      }
    }

    return {
      exists: false,
      type: null,
      path: null,
    };
  }

  getModelDescriptorMap(modelConfig) {
    return Object.entries(modelConfig.models).reduce(
      (acc, [modelKey, fileName]) => ({
        ...acc,
        [modelKey]: {
          modelKey,
          fileName,
        },
      }),
      {},
    );
  }

  async collectModelAvailability(modelConfig) {
    const descriptors = this.getModelDescriptorMap(modelConfig);
    const keys = Object.keys(descriptors);
    const models = {};

    for (let index = 0; index < keys.length; index += 1) {
      const modelKey = keys[index];
      const descriptor = descriptors[modelKey];
      const resolved = await this.resolveModelPath(
        descriptor.fileName,
        modelConfig.modelAssetDir,
      );
      models[modelKey] = {
        ...descriptor,
        ...resolved,
      };
    }

    return models;
  }

  buildRuntimeStatus(modelConfig, models, nativeReady, reason) {
    const availableModels = Object.values(models).filter(model => model.exists);
    const available = Boolean(
      modelConfig.enabled && nativeReady && availableModels.length >= 3,
    );

    return {
      initialized: true,
      available,
      mode: available ? 'tflite-native' : 'fallback-js',
      nativeModule: nativeReady,
      modelConfig,
      models,
      availableModelCount: availableModels.length,
      reason: reason || (available ? 'ready' : 'runtime-or-models-missing'),
    };
  }

  async initializeNativeRuntime(models) {
    if (!this.nativeModule) {
      return {ready: false, reason: 'native-module-missing'};
    }

    if (typeof this.nativeModule.initialize !== 'function') {
      return {ready: true, reason: 'native-module-present-no-init-hook'};
    }

    try {
      const initialized = await this.nativeModule.initialize({models});
      return {
        ready: initialized !== false,
        reason:
          initialized === false ? 'native-init-failed' : 'native-initialized',
      };
    } catch (error) {
      return {
        ready: false,
        reason: error?.message || 'native-init-error',
      };
    }
  }

  async initialize() {
    if (this.initialized) {
      return this.status;
    }

    const modelConfig = this.getModelConfig();
    if (!modelConfig.enabled) {
      this.initialized = true;
      this.status = this.buildRuntimeStatus(
        modelConfig,
        {},
        false,
        'runtime-disabled-in-config',
      );
      return this.status;
    }

    const models = await this.collectModelAvailability(modelConfig);
    const nativeRuntime = await this.initializeNativeRuntime(models);
    this.initialized = true;
    this.status = this.buildRuntimeStatus(
      modelConfig,
      models,
      nativeRuntime.ready,
      nativeRuntime.reason,
    );
    return this.status;
  }

  getStatus() {
    return this.status;
  }

  isAvailable() {
    return Boolean(this.status?.available);
  }

  getCallableMethod(methodNames = []) {
    if (!this.nativeModule) {
      return null;
    }

    for (let index = 0; index < methodNames.length; index += 1) {
      const methodName = methodNames[index];
      if (typeof this.nativeModule[methodName] === 'function') {
        return methodName;
      }
    }

    return null;
  }

  async runStage(stage, payload) {
    if (!this.isAvailable() || !this.nativeModule) {
      return null;
    }

    const stageMethods = {
      tableStructure: [
        'runTableStructure',
        'inferTableStructure',
        'detectTableStructure',
      ],
      textDetection: ['runTextDetection', 'detectTextRegions'],
      handwritingOCR: ['runHandwritingOCR', 'recognizeHandwriting'],
    };

    const methodName = this.getCallableMethod([
      ...(stageMethods[stage] || []),
      'runModel',
      'infer',
    ]);

    if (!methodName) {
      return null;
    }

    try {
      if (methodName === 'runModel' || methodName === 'infer') {
        return this.nativeModule[methodName]({stage, payload});
      }
      return this.nativeModule[methodName](payload);
    } catch (error) {
      return null;
    }
  }

  async inferTableStructure(preprocessedImage) {
    const input = {
      imageUri: preprocessedImage?.uri || '',
      width: toNumber(preprocessedImage?.width),
      height: toNumber(preprocessedImage?.height),
      tableBoundsHint: preprocessedImage?.tableBoundsHint || null,
    };
    return this.runStage('tableStructure', input);
  }

  async detectTextInCells(preprocessedImage, cells) {
    const input = {
      imageUri: preprocessedImage?.uri || '',
      width: toNumber(preprocessedImage?.width),
      height: toNumber(preprocessedImage?.height),
      cells: Array.isArray(cells) ? cells : [],
    };
    return this.runStage('textDetection', input);
  }

  async recognizeHandwriting(preprocessedImage, textRegions) {
    const input = {
      imageUri: preprocessedImage?.uri || '',
      width: toNumber(preprocessedImage?.width),
      height: toNumber(preprocessedImage?.height),
      textRegions: Array.isArray(textRegions) ? textRegions : [],
    };
    return this.runStage('handwritingOCR', input);
  }
}

export default new TFLiteRuntime();

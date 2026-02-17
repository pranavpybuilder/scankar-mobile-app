import TFLiteRuntime from './TFLiteRuntime';

class ModelLoader {
  constructor() {
    this.loaded = false;
    this.runtimeStatus = TFLiteRuntime.getStatus();
  }

  async initialize() {
    if (this.loaded) {
      return true;
    }
    this.runtimeStatus = await TFLiteRuntime.initialize();
    this.loaded = true;
    return true;
  }

  getRuntimeStatus() {
    return this.runtimeStatus || TFLiteRuntime.getStatus();
  }

  isRuntimeAvailable() {
    return Boolean(this.getRuntimeStatus()?.available);
  }

  async inferTableStructure(preprocessedImage) {
    await this.initialize();
    return TFLiteRuntime.inferTableStructure(preprocessedImage);
  }

  async detectTextInCells(preprocessedImage, cells) {
    await this.initialize();
    return TFLiteRuntime.detectTextInCells(preprocessedImage, cells);
  }

  async recognizeHandwriting(preprocessedImage, textRegions) {
    await this.initialize();
    return TFLiteRuntime.recognizeHandwriting(preprocessedImage, textRegions);
  }
}

export default new ModelLoader();

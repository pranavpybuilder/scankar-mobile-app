class ModelLoader {
  constructor() {
    this.loaded = false;
  }

  async initialize() {
    if (this.loaded) {
      return true;
    }
    // Keep this explicit so model-path replacement in future modules is isolated.
    await new Promise(resolve => setTimeout(resolve, 200));
    this.loaded = true;
    return true;
  }
}

export default new ModelLoader();

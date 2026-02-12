import StorageService from './StorageService';

class DocumentManager {
  async loadAll() {
    return StorageService.getDocuments();
  }

  async saveAll(documents) {
    await StorageService.saveDocuments(documents);
  }

  async removeById(documents, id) {
    const next = documents.filter(doc => doc.id !== id);
    await this.saveAll(next);
    return next;
  }
}

export default new DocumentManager();

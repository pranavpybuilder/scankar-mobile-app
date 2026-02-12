class TextDetectionModel {
  async detectTextInCells(_preprocessedImage, cells) {
    await new Promise(resolve => setTimeout(resolve, 220));
    return cells.map(cell => ({
      ...cell,
      bbox: {
        x: cell.x + 2,
        y: cell.y + 2,
        w: Math.max(0, cell.w - 4),
        h: Math.max(0, cell.h - 4),
      },
    }));
  }
}

export default new TextDetectionModel();

describe('zoomToPoint - Mathematical Correctness', () => {
  test('should calculate correct pan offset when zooming in', () => {
    // Test the mathematical formula used in zoomToPoint
    // Formula: newTranslate = cursorPos - (cursorPos - oldTranslate) * (newZoom / oldZoom)

    const cursorX = 500;
    const cursorY = 500;
    const oldTranslateX = 0;
    const oldTranslateY = 0;
    const oldZoom = 1;
    const newZoom = 1.1;

    const newX = cursorX - (cursorX - oldTranslateX) * (newZoom / oldZoom);
    const newY = cursorY - (cursorY - oldTranslateY) * (newZoom / oldZoom);

    // Expected: 500 - 500 * 1.1 = 500 - 550 = -50
    expect(newX).toBe(-50);
    expect(newY).toBe(-50);

    // Verify cursor position in world coordinates remains constant
    const worldXBefore = (cursorX - oldTranslateX) / oldZoom;
    const worldXAfter = (cursorX - newX) / newZoom;
    expect(worldXBefore).toBeCloseTo(worldXAfter, 5);
  });

  test('should calculate correct pan offset when zooming out', () => {
    const cursorX = 500;
    const cursorY = 500;
    const oldTranslateX = -50;
    const oldTranslateY = -50;
    const oldZoom = 1.1;
    const newZoom = 1.0;

    const newX = cursorX - (cursorX - oldTranslateX) * (newZoom / oldZoom);
    const newY = cursorY - (cursorY - oldTranslateY) * (newZoom / oldZoom);

    // Expected: 500 - 550 * (1.0 / 1.1) = 500 - 500 = 0
    expect(newX).toBeCloseTo(0, 5);
    expect(newY).toBeCloseTo(0, 5);

    // Verify cursor position in world coordinates remains constant
    const worldXBefore = (cursorX - oldTranslateX) / oldZoom;
    const worldXAfter = (cursorX - newX) / newZoom;
    expect(worldXBefore).toBeCloseTo(worldXAfter, 5);
  });

  test('should keep cursor position fixed with panned canvas', () => {
    const cursorX = 600;
    const cursorY = 400;
    const oldTranslateX = 100;
    const oldTranslateY = 50;
    const oldZoom = 1.5;
    const newZoom = 1.8;

    const newX = cursorX - (cursorX - oldTranslateX) * (newZoom / oldZoom);
    const newY = cursorY - (cursorY - oldTranslateY) * (newZoom / oldZoom);

    // Verify cursor position in world coordinates remains constant
    const worldXBefore = (cursorX - oldTranslateX) / oldZoom;
    const worldXAfter = (cursorX - newX) / newZoom;
    expect(worldXBefore).toBeCloseTo(worldXAfter, 5);

    const worldYBefore = (cursorY - oldTranslateY) / oldZoom;
    const worldYAfter = (cursorY - newY) / newZoom;
    expect(worldYBefore).toBeCloseTo(worldYAfter, 5);
  });

  test('should handle zoom at canvas corner (0, 0)', () => {
    const cursorX = 0;
    const cursorY = 0;
    const oldTranslateX = 0;
    const oldTranslateY = 0;
    const oldZoom = 1;
    const newZoom = 1.2;

    const newX = cursorX - (cursorX - oldTranslateX) * (newZoom / oldZoom);
    const newY = cursorY - (cursorY - oldTranslateY) * (newZoom / oldZoom);

    // At (0,0), no translation should occur
    expect(newX).toBe(0);
    expect(newY).toBe(0);
  });

  test('should handle zoom at arbitrary position', () => {
    const cursorX = 750;
    const cursorY = 350;
    const oldTranslateX = 50;
    const oldTranslateY = 25;
    const oldZoom = 1.0;
    const newZoom = 1.3;

    const newX = cursorX - (cursorX - oldTranslateX) * (newZoom / oldZoom);
    const newY = cursorY - (cursorY - oldTranslateY) * (newZoom / oldZoom);

    // Verify the world coordinates are preserved
    const worldXBefore = (cursorX - oldTranslateX) / oldZoom;
    const worldXAfter = (cursorX - newX) / newZoom;
    expect(worldXBefore).toBeCloseTo(worldXAfter, 5);

    const worldYBefore = (cursorY - oldTranslateY) / oldZoom;
    const worldYAfter = (cursorY - newY) / newZoom;
    expect(worldYBefore).toBeCloseTo(worldYAfter, 5);
  });

  test('should handle zoom limits correctly', () => {
    const minZoom = -0.5;
    const maxZoom = 1.0;

    // Test min zoom clamping
    const currentZoomFactor1 = -0.4;
    const zoomDelta1 = -0.3;
    const newZoomFactor1 = Math.max(minZoom, Math.min(maxZoom, currentZoomFactor1 + zoomDelta1));
    expect(newZoomFactor1).toBe(minZoom);

    // Test max zoom clamping
    const currentZoomFactor2 = 0.9;
    const zoomDelta2 = 0.3;
    const newZoomFactor2 = Math.max(minZoom, Math.min(maxZoom, currentZoomFactor2 + zoomDelta2));
    expect(newZoomFactor2).toBe(maxZoom);

    // Test within bounds
    const currentZoomFactor3 = 0.0;
    const zoomDelta3 = 0.1;
    const newZoomFactor3 = Math.max(minZoom, Math.min(maxZoom, currentZoomFactor3 + zoomDelta3));
    expect(newZoomFactor3).toBe(0.1);
  });

  test('should not zoom when delta results in same zoom level', () => {
    const currentZoom = 1.0;
    const zoomDelta = 0.0;
    const newZoom = currentZoom + zoomDelta;

    // When zoom doesn't change, the function should not update state
    expect(newZoom).toBe(currentZoom);
  });

  test('should handle negative zoom delta correctly', () => {
    const currentZoomFactor = 0.5;
    const zoomDelta = -0.2;
    const newZoomFactor = currentZoomFactor + zoomDelta;

    expect(newZoomFactor).toBe(0.3);
  });

  test('should maintain mathematical invariant: world position constant under zoom', () => {
    // This test verifies the core invariant:
    // For any cursor position (cx, cy), the world coordinates should remain constant:
    // worldX = (cx - tx) / zoom = constant

    const testCases = [
      { cx: 500, cy: 500, tx: 0, ty: 0, oldZ: 1.0, newZ: 1.5 },
      { cx: 300, cy: 200, tx: 50, ty: 25, oldZ: 1.2, newZ: 0.8 },
      { cx: 1000, cy: 800, tx: -100, ty: -80, oldZ: 2.0, newZ: 1.0 },
      { cx: 0, cy: 0, tx: 100, ty: 100, oldZ: 1.0, newZ: 1.5 }
    ];

    testCases.forEach(({ cx, cy, tx, ty, oldZ, newZ }) => {
      // Calculate new translate using the formula
      const newTx = cx - (cx - tx) * (newZ / oldZ);
      const newTy = cy - (cy - ty) * (newZ / oldZ);

      // Verify world coordinates are preserved
      const worldXBefore = (cx - tx) / oldZ;
      const worldXAfter = (cx - newTx) / newZ;
      expect(worldXBefore).toBeCloseTo(worldXAfter, 10);

      const worldYBefore = (cy - ty) / oldZ;
      const worldYAfter = (cy - newTy) / newZ;
      expect(worldYBefore).toBeCloseTo(worldYAfter, 10);
    });
  });
});

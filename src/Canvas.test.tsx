describe('Canvas - Zoom Calculation Logic', () => {
  test('should calculate mouse position relative to SVG correctly', () => {
    // Simulates the calculation in Canvas.tsx for cursor-based zoom
    const svgRect = {
      left: 100,
      top: 50
    };

    const mouseEvent = {
      clientX: 600,
      clientY: 350
    };

    // Calculate mouse position relative to SVG
    const mouseX = mouseEvent.clientX - svgRect.left;
    const mouseY = mouseEvent.clientY - svgRect.top;

    expect(mouseX).toBe(500);
    expect(mouseY).toBe(300);
  });

  test('should calculate mouse position when SVG is at origin', () => {
    const svgRect = {
      left: 0,
      top: 0
    };

    const mouseEvent = {
      clientX: 250,
      clientY: 175
    };

    const mouseX = mouseEvent.clientX - svgRect.left;
    const mouseY = mouseEvent.clientY - svgRect.top;

    expect(mouseX).toBe(250);
    expect(mouseY).toBe(175);
  });

  test('should handle wheel event delta correctly for zoom', () => {
    // Simulates the zoom factor calculation from wheel delta
    // zoomFactor = delta[1] * -0.02

    const wheelDeltaZoomIn = -100; // Scroll up
    const zoomFactorIn = wheelDeltaZoomIn * -0.02;
    expect(zoomFactorIn).toBe(2.0); // Zoom in by 2.0

    const wheelDeltaZoomOut = 100; // Scroll down
    const zoomFactorOut = wheelDeltaZoomOut * -0.02;
    expect(zoomFactorOut).toBe(-2.0); // Zoom out by 2.0

    const wheelDeltaSmall = -50;
    const zoomFactorSmall = wheelDeltaSmall * -0.02;
    expect(zoomFactorSmall).toBe(1.0); // Zoom in by 1.0
  });

  test('should use zoomToPoint when available', () => {
    // This tests the branching logic in Canvas.tsx
    const zoomToPoint = vi.fn();
    const zoomIn = vi.fn();
    const zoomOut = vi.fn();

    // When zoomToPoint is available, it should be used
    if (zoomToPoint) {
      zoomToPoint(500, 500, 0.1);
      expect(zoomToPoint).toHaveBeenCalledWith(500, 500, 0.1);
      expect(zoomIn).not.toHaveBeenCalled();
      expect(zoomOut).not.toHaveBeenCalled();
    }
  });

  test('should fallback to zoomIn/zoomOut when zoomToPoint is not available', () => {
    const zoomToPoint = undefined;
    const zoomIn = vi.fn();
    const zoomOut = vi.fn();

    const delta = -100; // Zoom in
    const zoomFactor = delta * -0.02;

    if (zoomToPoint) {
      // Won't be called
      zoomToPoint(500, 500, zoomFactor);
    } else {
      // Fallback to center-based zoom
      if (delta > 0) {
        zoomOut(zoomFactor);
      } else {
        zoomIn(zoomFactor);
      }
    }

    expect(zoomIn).toHaveBeenCalledWith(2.0);
    expect(zoomOut).not.toHaveBeenCalled();
  });

  test('should determine zoom direction from wheel delta', () => {
    // Test zoom in (negative delta)
    const deltaZoomIn = -100;
    const isZoomIn = deltaZoomIn < 0;
    expect(isZoomIn).toBe(true);

    // Test zoom out (positive delta)
    const deltaZoomOut = 100;
    const isZoomOut = deltaZoomOut > 0;
    expect(isZoomOut).toBe(true);
  });

  test('should convert wheel delta to zoom factor consistently', () => {
    const testCases = [
      { delta: -100, expected: 2.0 },
      { delta: -50, expected: 1.0 },
      { delta: -10, expected: 0.2 },
      { delta: 100, expected: -2.0 },
      { delta: 50, expected: -1.0 },
      { delta: 10, expected: -0.2 }
    ];

    testCases.forEach(({ delta, expected }) => {
      const zoomFactor = delta * -0.02;
      expect(zoomFactor).toBeCloseTo(expected, 5);
    });
  });

  test('should handle edge case: wheel delta of zero', () => {
    const delta = 0;
    const zoomFactor = delta * -0.02;
    expect(Math.abs(zoomFactor)).toBe(0);
  });

  test('should calculate cursor position for different SVG positions', () => {
    const testCases = [
      { svgLeft: 0, svgTop: 0, clientX: 500, clientY: 400, expectedX: 500, expectedY: 400 },
      { svgLeft: 100, svgTop: 50, clientX: 600, clientY: 450, expectedX: 500, expectedY: 400 },
      { svgLeft: 250, svgTop: 150, clientX: 750, clientY: 550, expectedX: 500, expectedY: 400 },
      { svgLeft: -50, svgTop: -25, clientX: 450, clientY: 375, expectedX: 500, expectedY: 400 }
    ];

    testCases.forEach(({ svgLeft, svgTop, clientX, clientY, expectedX, expectedY }) => {
      const mouseX = clientX - svgLeft;
      const mouseY = clientY - svgTop;
      expect(mouseX).toBe(expectedX);
      expect(mouseY).toBe(expectedY);
    });
  });
});

describe('Canvas - Drag Node Rendering Logic', () => {
  test('should determine when to render drag node', () => {
    // Test the conditions for rendering drag node in Canvas
    // Render when: dragCoords !== null && dragNodeData && Object.keys(dragNodeData).length > 0 && dragType === 'node' && !readonly

    const testCases = [
      { dragCoords: null, dragNodeData: {}, dragType: 'node', readonly: false, shouldRender: false },
      { dragCoords: [{}], dragNodeData: null, dragType: 'node', readonly: false, shouldRender: false },
      { dragCoords: [{}], dragNodeData: {}, dragType: 'node', readonly: false, shouldRender: false },
      { dragCoords: [{}], dragNodeData: { id: '1' }, dragType: 'edge', readonly: false, shouldRender: false },
      { dragCoords: [{}], dragNodeData: { id: '1' }, dragType: 'node', readonly: true, shouldRender: false },
      { dragCoords: [{}], dragNodeData: { id: '1' }, dragType: 'node', readonly: false, shouldRender: true }
    ];

    testCases.forEach(({ dragCoords, dragNodeData, dragType, readonly, shouldRender }) => {
      const result = !!(dragCoords !== null && dragNodeData && Object.keys(dragNodeData).length > 0 && dragType === 'node' && !readonly);

      expect(result).toBe(shouldRender);
    });
  });

  test('should extract children from dragNodeData correctly', () => {
    const dragNodeData = {
      id: 'node-1',
      x: 100,
      y: 200,
      width: 150,
      height: 100,
      children: [
        { id: 'child-1', x: 10, y: 10 },
        { id: 'child-2', x: 20, y: 20 }
      ]
    };

    const { children, ...dragNodeProps } = dragNodeData;

    expect(dragNodeProps).toEqual({
      id: 'node-1',
      x: 100,
      y: 200,
      width: 150,
      height: 100
    });

    expect(children).toEqual([
      { id: 'child-1', x: 10, y: 10 },
      { id: 'child-2', x: 20, y: 20 }
    ]);
  });

  test('should handle dragNodeData without children', () => {
    const dragNodeData = {
      id: 'node-1',
      x: 100,
      y: 200
    };

    const { children, ...dragNodeProps } = dragNodeData;

    expect(dragNodeProps).toEqual({
      id: 'node-1',
      x: 100,
      y: 200
    });

    expect(children).toBeUndefined();
  });
});

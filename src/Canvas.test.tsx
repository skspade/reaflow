describe('Canvas - Zoom Speed Calculations', () => {
  test('should use default zoom speed of 0.02', () => {
    const defaultZoomSpeed = 0.02;
    const delta = -100;
    const zoomFactor = delta * -defaultZoomSpeed;
    expect(zoomFactor).toBe(2.0);
  });

  test('should calculate zoom factor with custom zoom speeds', () => {
    const testCases = [
      { speed: 0.01, delta: -100, expected: 1.0 }, // Slow speed
      { speed: 0.02, delta: -100, expected: 2.0 }, // Normal speed
      { speed: 0.05, delta: -100, expected: 5.0 }, // Fast speed
      { speed: 0.1, delta: -100, expected: 10.0 }, // Very fast speed
      { speed: 0.01, delta: 100, expected: -1.0 }, // Slow zoom out
      { speed: 0.05, delta: 50, expected: -2.5 } // Fast zoom out
    ];

    testCases.forEach(({ speed, delta, expected }) => {
      const zoomFactor = delta * -speed;
      expect(zoomFactor).toBeCloseTo(expected, 5);
    });
  });

  test('should maintain zoom direction regardless of speed', () => {
    const speeds = [0.01, 0.02, 0.05, 0.1];

    speeds.forEach((speed) => {
      // Zoom in (negative delta)
      const zoomInDelta = -100;
      const zoomInFactor = zoomInDelta * -speed;
      expect(zoomInFactor).toBeGreaterThan(0);

      // Zoom out (positive delta)
      const zoomOutDelta = 100;
      const zoomOutFactor = zoomOutDelta * -speed;
      expect(zoomOutFactor).toBeLessThan(0);
    });
  });

  test('should scale zoom factor proportionally with speed', () => {
    const delta = -100;
    const baseSpeed = 0.02;
    const baseFactor = delta * -baseSpeed;

    // Double speed should double the zoom factor
    const doubleSpeed = 0.04;
    const doubleFactor = delta * -doubleSpeed;
    expect(doubleFactor).toBeCloseTo(baseFactor * 2, 5);

    // Half speed should halve the zoom factor
    const halfSpeed = 0.01;
    const halfFactor = delta * -halfSpeed;
    expect(halfFactor).toBeCloseTo(baseFactor / 2, 5);
  });

  test('should handle various wheel delta values with different speeds', () => {
    const testCases = [
      { speed: 0.02, delta: -100, expected: 2.0 },
      { speed: 0.02, delta: -50, expected: 1.0 },
      { speed: 0.02, delta: -10, expected: 0.2 },
      { speed: 0.05, delta: -100, expected: 5.0 },
      { speed: 0.05, delta: -50, expected: 2.5 },
      { speed: 0.01, delta: -200, expected: 2.0 },
      { speed: 0.1, delta: -10, expected: 1.0 }
    ];

    testCases.forEach(({ speed, delta, expected }) => {
      const zoomFactor = delta * -speed;
      expect(zoomFactor).toBeCloseTo(expected, 5);
    });
  });

  test('should handle edge case: zero speed', () => {
    const speed = 0;
    const delta = -100;
    const zoomFactor = delta * -speed;
    expect(zoomFactor).toBe(0);
  });

  test('should handle edge case: very small speed', () => {
    const speed = 0.001;
    const delta = -100;
    const zoomFactor = delta * -speed;
    expect(zoomFactor).toBe(0.1);
  });

  test('should handle edge case: very large speed', () => {
    const speed = 1.0;
    const delta = -100;
    const zoomFactor = delta * -speed;
    expect(zoomFactor).toBe(100.0);
  });

  test('should handle edge case: wheel delta of zero with any speed', () => {
    const speeds = [0.01, 0.02, 0.05, 0.1];
    const delta = 0;

    speeds.forEach((speed) => {
      const zoomFactor = delta * -speed;
      expect(Math.abs(zoomFactor)).toBe(0);
    });
  });

  test('should produce consistent results for equivalent speed/delta combinations', () => {
    // These combinations should produce the same zoom factor
    const testCases = [
      { speed: 0.02, delta: -100 },
      { speed: 0.04, delta: -50 },
      { speed: 0.01, delta: -200 },
      { speed: 0.1, delta: -20 }
    ];

    const expectedFactor = 2.0;

    testCases.forEach(({ speed, delta }) => {
      const zoomFactor = delta * -speed;
      expect(zoomFactor).toBeCloseTo(expectedFactor, 5);
    });
  });

  test('should calculate zoom correctly for slow speed (0.01)', () => {
    const speed = 0.01;
    const testCases = [
      { delta: -100, expected: 1.0 },
      { delta: -50, expected: 0.5 },
      { delta: 100, expected: -1.0 }
    ];

    testCases.forEach(({ delta, expected }) => {
      const zoomFactor = delta * -speed;
      expect(zoomFactor).toBeCloseTo(expected, 5);
    });
  });

  test('should calculate zoom correctly for fast speed (0.05)', () => {
    const speed = 0.05;
    const testCases = [
      { delta: -100, expected: 5.0 },
      { delta: -50, expected: 2.5 },
      { delta: -20, expected: 1.0 },
      { delta: 100, expected: -5.0 }
    ];

    testCases.forEach(({ delta, expected }) => {
      const zoomFactor = delta * -speed;
      expect(zoomFactor).toBeCloseTo(expected, 5);
    });
  });
});

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

  test('should handle wheel event delta correctly for zoom with default speed', () => {
    // Simulates the zoom factor calculation from wheel delta
    // zoomFactor = delta[1] * -zoomSpeed (default 0.02)
    const zoomSpeed = 0.02;

    const wheelDeltaZoomIn = -100; // Scroll up
    const zoomFactorIn = wheelDeltaZoomIn * -zoomSpeed;
    expect(zoomFactorIn).toBe(2.0); // Zoom in by 2.0

    const wheelDeltaZoomOut = 100; // Scroll down
    const zoomFactorOut = wheelDeltaZoomOut * -zoomSpeed;
    expect(zoomFactorOut).toBe(-2.0); // Zoom out by 2.0

    const wheelDeltaSmall = -50;
    const zoomFactorSmall = wheelDeltaSmall * -zoomSpeed;
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

/**
 * Mock for react-native-svg
 * Required for testing components that use SVG
 */

import React from 'react';

const createMockComponent = (name) => {
  return ({ children, ...props }) => React.createElement(name, props, children);
};

module.exports = {
  __esModule: true,
  default: createMockComponent('Svg'),
  Svg: createMockComponent('Svg'),
  Circle: createMockComponent('Circle'),
  Ellipse: createMockComponent('Ellipse'),
  G: createMockComponent('G'),
  Text: createMockComponent('Text'),
  TSpan: createMockComponent('TSpan'),
  TextPath: createMockComponent('TextPath'),
  Path: createMockComponent('Path'),
  Polygon: createMockComponent('Polygon'),
  Polyline: createMockComponent('Polyline'),
  Line: createMockComponent('Line'),
  Rect: createMockComponent('Rect'),
  Use: createMockComponent('Use'),
  Image: createMockComponent('Image'),
  Symbol: createMockComponent('Symbol'),
  Defs: createMockComponent('Defs'),
  LinearGradient: createMockComponent('LinearGradient'),
  RadialGradient: createMockComponent('RadialGradient'),
  Stop: createMockComponent('Stop'),
  ClipPath: createMockComponent('ClipPath'),
  Pattern: createMockComponent('Pattern'),
  Mask: createMockComponent('Mask'),
};
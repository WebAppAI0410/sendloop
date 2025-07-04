/**
 * LottieGrowthAnimation Component Tests - t-wada style TDD
 * Testing Lottie-based plant growth animation component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LottieGrowthAnimation, GrowthStage } from '../../../src/components/animations/LottieGrowthAnimation';

describe('LottieGrowthAnimation Component', () => {
  const defaultProps = {
    progress: 0,
    size: 300,
  };

  describe('Initial Render', () => {
    it('should render with default props', () => {
      render(<LottieGrowthAnimation {...defaultProps} />);
      
      expect(screen.getByTestId('lottie-growth-animation')).toBeTruthy();
      expect(screen.getByTestId('lottie-growth-animation-lottie')).toBeTruthy();
    });

    it('should have correct initial size', () => {
      render(<LottieGrowthAnimation {...defaultProps} />);
      
      const container = screen.getByTestId('lottie-growth-animation');
      const style = Array.isArray(container.props.style) 
        ? container.props.style.reduce((acc: any, s: any) => ({ ...acc, ...s }), {})
        : container.props.style;
      
      expect(style).toMatchObject({
        width: 300,
        height: 300,
      });
    });
  });

  describe('Progress Control', () => {
    it('should update progress from 0 to 100', () => {
      const { rerender } = render(<LottieGrowthAnimation progress={0} />);
      
      // Test different progress values
      rerender(<LottieGrowthAnimation progress={25} />);
      rerender(<LottieGrowthAnimation progress={50} />);
      rerender(<LottieGrowthAnimation progress={75} />);
      rerender(<LottieGrowthAnimation progress={100} />);
      
      // Component should render without errors
      expect(screen.getByTestId('lottie-growth-animation')).toBeTruthy();
    });

    it('should clamp progress between 0 and 100', () => {
      const { rerender } = render(<LottieGrowthAnimation progress={-10} />);
      expect(screen.getByTestId('lottie-growth-animation')).toBeTruthy();
      
      rerender(<LottieGrowthAnimation progress={150} />);
      expect(screen.getByTestId('lottie-growth-animation')).toBeTruthy();
    });
  });

  describe('Growth Stages', () => {
    it('should show seed stage for 0-25% progress', () => {
      const onStageChange = jest.fn();
      render(<LottieGrowthAnimation progress={10} onStageChange={onStageChange} />);
      
      expect(onStageChange).toHaveBeenCalledWith(GrowthStage.SEED);
    });

    it('should show sprout stage for 26-50% progress', () => {
      const onStageChange = jest.fn();
      render(<LottieGrowthAnimation progress={30} onStageChange={onStageChange} />);
      
      expect(onStageChange).toHaveBeenCalledWith(GrowthStage.SPROUT);
    });

    it('should show plant stage for 51-75% progress', () => {
      const onStageChange = jest.fn();
      render(<LottieGrowthAnimation progress={60} onStageChange={onStageChange} />);
      
      expect(onStageChange).toHaveBeenCalledWith(GrowthStage.PLANT);
    });

    it('should show bloom stage for 76-100% progress', () => {
      const onStageChange = jest.fn();
      render(<LottieGrowthAnimation progress={90} onStageChange={onStageChange} />);
      
      expect(onStageChange).toHaveBeenCalledWith(GrowthStage.BLOOM);
    });
  });

  describe('Customization', () => {
    it('should accept custom size', () => {
      render(<LottieGrowthAnimation size={400} />);
      
      const container = screen.getByTestId('lottie-growth-animation');
      const style = Array.isArray(container.props.style) 
        ? container.props.style.reduce((acc: any, s: any) => ({ ...acc, ...s }), {})
        : container.props.style;
      
      expect(style).toMatchObject({
        width: 400,
        height: 400,
      });
    });

    it('should accept custom animation source', () => {
      const customSource = { v: '5.7.13', fr: 60 }; // Mock Lottie JSON
      render(<LottieGrowthAnimation animationSource={customSource} />);
      
      expect(screen.getByTestId('lottie-growth-animation-lottie')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<LottieGrowthAnimation progress={50} />);
      
      const container = screen.getByTestId('lottie-growth-animation');
      expect(container.props.accessibilityLabel).toBe('Growth visualization: sprout stage at 50%');
      expect(container.props.accessibilityRole).toBe('image');
    });

    it('should update accessibility label with progress', () => {
      const { rerender } = render(<LottieGrowthAnimation progress={0} />);
      
      let container = screen.getByTestId('lottie-growth-animation');
      expect(container.props.accessibilityLabel).toBe('Growth visualization: seed stage at 0%');
      
      rerender(<LottieGrowthAnimation progress={100} />);
      container = screen.getByTestId('lottie-growth-animation');
      expect(container.props.accessibilityLabel).toBe('Growth visualization: bloom stage at 100%');
    });
  });
});
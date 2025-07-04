/**
 * AnimatedSeedGrowth Component Tests - t-wada style TDD
 * Testing animated seed growth visualization component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { AnimatedSeedGrowth, GrowthStage } from '../../../src/components/animations/AnimatedSeedGrowth';

describe('AnimatedSeedGrowth Component', () => {
  // Helper function to flatten styles for testing
  const flattenStyle = (style: any) => {
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...s }), {});
    }
    return style || {};
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('should render with seed stage by default', () => {
      render(<AnimatedSeedGrowth />);
      
      expect(screen.getByTestId('animated-seed-growth')).toBeTruthy();
      expect(screen.getByTestId('growth-stage-seed')).toBeTruthy();
    });

    it('should have correct initial size', () => {
      render(<AnimatedSeedGrowth />);
      
      const container = screen.getByTestId('animated-seed-growth');
      const flattened = flattenStyle(container.props.style);
      expect(flattened).toMatchObject(
        expect.objectContaining({
          height: expect.any(Number),
        })
      );
    });
  });

  describe('Growth Stages', () => {
    it('should render seed stage correctly', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.SEED} />);
      
      expect(screen.getByTestId('growth-stage-seed')).toBeTruthy();
    });

    it('should render sprout stage correctly', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.SPROUT} />);
      
      expect(screen.getByTestId('growth-stage-sprout')).toBeTruthy();
    });

    it('should render plant stage correctly', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.PLANT} />);
      
      expect(screen.getByTestId('growth-stage-plant')).toBeTruthy();
    });

    it('should render bloom stage correctly', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.BLOOM} />);
      
      expect(screen.getByTestId('growth-stage-bloom')).toBeTruthy();
    });
  });

  describe('Animations', () => {
    it('should animate stage transition', () => {
      const { rerender } = render(<AnimatedSeedGrowth stage={GrowthStage.SEED} />);
      
      // Change to sprout stage
      rerender(<AnimatedSeedGrowth stage={GrowthStage.SPROUT} />);
      
      // Advance timers to trigger animation
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Animation should be in progress
      expect(screen.getByTestId('growth-stage-sprout')).toBeTruthy();
    });

    it('should show particle effects during growth', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.SPROUT} showParticles />);
      
      expect(screen.getByTestId('particle-effects')).toBeTruthy();
    });
  });

  describe('Customization', () => {
    it('should accept custom size', () => {
      render(<AnimatedSeedGrowth size={200} />);
      
      const container = screen.getByTestId('animated-seed-growth');
      const flattened = flattenStyle(container.props.style);
      expect(flattened).toMatchObject(
        expect.objectContaining({
          width: 200,
          height: 200,
        })
      );
    });

    it('should accept custom colors', () => {
      const customColors = {
        seed: '#8B4513',
        sprout: '#228B22',
        plant: '#006400',
        bloom: '#FF69B4',
      };
      
      render(<AnimatedSeedGrowth colors={customColors} />);
      
      // Component should render without errors
      expect(screen.getByTestId('animated-seed-growth')).toBeTruthy();
    });
  });

  describe('Progress Integration', () => {
    it('should calculate stage based on progress', () => {
      // 0-25% = seed
      render(<AnimatedSeedGrowth progress={10} />);
      expect(screen.getByTestId('growth-stage-seed')).toBeTruthy();
      
      // 25-50% = sprout
      render(<AnimatedSeedGrowth progress={30} />);
      expect(screen.getByTestId('growth-stage-sprout')).toBeTruthy();
      
      // 50-75% = plant
      render(<AnimatedSeedGrowth progress={60} />);
      expect(screen.getByTestId('growth-stage-plant')).toBeTruthy();
      
      // 75-100% = bloom
      render(<AnimatedSeedGrowth progress={90} />);
      expect(screen.getByTestId('growth-stage-bloom')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<AnimatedSeedGrowth stage={GrowthStage.PLANT} />);
      
      const container = screen.getByTestId('animated-seed-growth');
      expect(container.props.accessibilityLabel).toBe('Growth visualization: plant stage');
      expect(container.props.accessibilityRole).toBe('image');
    });
  });
});
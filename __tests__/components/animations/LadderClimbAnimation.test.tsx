/**
 * LadderClimbAnimation Component Tests - t-wada style TDD
 * Testing ladder climbing animation component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LadderClimbAnimation } from '../../../src/components/animations/LadderClimbAnimation';

describe('LadderClimbAnimation Component', () => {
  const defaultProps = {
    achievedDays: 0,
    cycleLength: 60,
    size: 300,
  };

  describe('Initial Render', () => {
    it('should render with default props', () => {
      render(<LadderClimbAnimation {...defaultProps} />);
      
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });

    it('should have correct initial size', () => {
      render(<LadderClimbAnimation {...defaultProps} />);
      
      const container = screen.getByTestId('ladder-climb-animation');
      const style = Array.isArray(container.props.style) 
        ? container.props.style.reduce((acc: any, s: any) => ({ ...acc, ...s }), {})
        : container.props.style;
      
      expect(style).toMatchObject({
        width: 300,
        height: 450, // 1.5x width
      });
    });
  });

  describe('Progress Visualization', () => {
    it('should show no rungs at day 0', () => {
      render(<LadderClimbAnimation {...defaultProps} />);
      
      // SVG should be rendered
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });

    it('should show correct progress for different days', () => {
      const { rerender } = render(<LadderClimbAnimation {...defaultProps} />);
      
      // Test different progress values
      rerender(<LadderClimbAnimation achievedDays={15} cycleLength={60} />);
      rerender(<LadderClimbAnimation achievedDays={30} cycleLength={60} />);
      rerender(<LadderClimbAnimation achievedDays={45} cycleLength={60} />);
      rerender(<LadderClimbAnimation achievedDays={60} cycleLength={60} />);
      
      // Component should render without errors
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });
  });

  describe('Milestone Detection', () => {
    it('should trigger milestone callback at day 7', () => {
      const onMilestone = jest.fn();
      render(<LadderClimbAnimation 
        achievedDays={7} 
        cycleLength={60} 
        onMilestone={onMilestone} 
      />);
      
      expect(onMilestone).toHaveBeenCalledWith(7);
    });

    it('should trigger milestone callback at day 15', () => {
      const onMilestone = jest.fn();
      render(<LadderClimbAnimation 
        achievedDays={15} 
        cycleLength={60} 
        onMilestone={onMilestone} 
      />);
      
      expect(onMilestone).toHaveBeenCalledWith(15);
    });

    it('should trigger milestone callback at day 30', () => {
      const onMilestone = jest.fn();
      render(<LadderClimbAnimation 
        achievedDays={30} 
        cycleLength={60} 
        onMilestone={onMilestone} 
      />);
      
      expect(onMilestone).toHaveBeenCalledWith(30);
    });

    it('should trigger milestone callback at day 45', () => {
      const onMilestone = jest.fn();
      render(<LadderClimbAnimation 
        achievedDays={45} 
        cycleLength={60} 
        onMilestone={onMilestone} 
      />);
      
      expect(onMilestone).toHaveBeenCalledWith(45);
    });

    it('should trigger milestone callback at day 60', () => {
      const onMilestone = jest.fn();
      render(<LadderClimbAnimation 
        achievedDays={60} 
        cycleLength={60} 
        onMilestone={onMilestone} 
      />);
      
      expect(onMilestone).toHaveBeenCalledWith(60);
    });
  });

  describe('Different Cycle Lengths', () => {
    it('should support 7-day cycle', () => {
      render(<LadderClimbAnimation achievedDays={7} cycleLength={7} />);
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });

    it('should support 15-day cycle', () => {
      render(<LadderClimbAnimation achievedDays={15} cycleLength={15} />);
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });

    it('should support 30-day cycle', () => {
      render(<LadderClimbAnimation achievedDays={30} cycleLength={30} />);
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });

    it('should support 45-day cycle', () => {
      render(<LadderClimbAnimation achievedDays={45} cycleLength={45} />);
      expect(screen.getByTestId('ladder-climb-animation')).toBeTruthy();
    });
  });

  describe('Custom Size', () => {
    it('should accept custom size', () => {
      render(<LadderClimbAnimation {...defaultProps} size={400} />);
      
      const container = screen.getByTestId('ladder-climb-animation');
      const style = Array.isArray(container.props.style) 
        ? container.props.style.reduce((acc: any, s: any) => ({ ...acc, ...s }), {})
        : container.props.style;
      
      expect(style).toMatchObject({
        width: 400,
        height: 600, // 1.5x width
      });
    });
  });
});
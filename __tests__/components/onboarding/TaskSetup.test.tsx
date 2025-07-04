/**
 * TaskSetup OnBoarding Component Tests - t-wada style TDD
 * Testing the first onboarding step: task creation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskSetup } from '../../../src/components/onboarding/TaskSetup';
import { VisualType } from '../../../src/types/database';

describe('TaskSetup OnBoarding Component', () => {
  const mockOnNext = jest.fn();
  const defaultProps = {
    onNext: mockOnNext,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render task setup form elements', () => {
      render(<TaskSetup {...defaultProps} />);

      // Check for essential form elements
      expect(screen.getByText('Create Your First Habit')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter habit name')).toBeTruthy();
      expect(screen.getByText('Cycle Length')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    });

    it('should have default cycle length of 30 days', () => {
      render(<TaskSetup {...defaultProps} />);
      
      // Should show 30 days as default
      expect(screen.getByDisplayValue('30')).toBeTruthy();
    });

    it('should show cycle length slider range 3-180', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const slider = screen.getByTestId('cycle-length-slider');
      expect(slider).toBeTruthy();
      expect(slider.props.minimumValue).toBe(3);
      expect(slider.props.maximumValue).toBe(180);
    });
  });

  describe('Form Validation', () => {
    it('should disable Next button when title is empty', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton.props.disabled).toBe(true);
    });

    it('should enable Next button when title is provided', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Enter habit name');
      fireEvent.changeText(titleInput, 'Daily Exercise');
      
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton.props.disabled).toBe(false);
    });

    it('should show error for titles that are too long', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const longTitle = 'A'.repeat(101); // Over 100 character limit
      const titleInput = screen.getByPlaceholderText('Enter habit name');
      fireEvent.changeText(titleInput, longTitle);
      
      expect(screen.getByText('Title must be less than 100 characters')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should update cycle length when slider changes', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const slider = screen.getByTestId('cycle-length-slider');
      fireEvent(slider, 'onValueChange', 66);
      
      expect(screen.getByDisplayValue('66')).toBeTruthy();
      expect(screen.getByText('66 days')).toBeTruthy();
    });

    it('should call onNext with correct task data when Next is pressed', () => {
      render(<TaskSetup {...defaultProps} />);
      
      // Fill form
      const titleInput = screen.getByPlaceholderText('Enter habit name');
      fireEvent.changeText(titleInput, 'Morning Run');
      
      const slider = screen.getByTestId('cycle-length-slider');
      fireEvent(slider, 'onValueChange', 21);
      
      // Submit form
      const nextButton = screen.getByRole('button', { name: 'Next' });
      fireEvent.press(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        title: 'Morning Run',
        cycle_length: 21,
        visual_type: VisualType.TREE, // Default visual type
      });
    });

    it('should trim whitespace from task title', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Enter habit name');
      fireEvent.changeText(titleInput, '  Reading Books  ');
      
      const nextButton = screen.getByRole('button', { name: 'Next' });
      fireEvent.press(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        title: 'Reading Books',
        cycle_length: 30, // Default
        visual_type: VisualType.TREE,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Enter habit name');
      expect(titleInput.props.accessibilityLabel).toBe('Habit name input');
      
      const slider = screen.getByTestId('cycle-length-slider');
      expect(slider.props.accessibilityLabel).toBe('Cycle length slider');
    });

    it('should announce cycle length changes for screen readers', () => {
      render(<TaskSetup {...defaultProps} />);
      
      const slider = screen.getByTestId('cycle-length-slider');
      fireEvent(slider, 'onValueChange', 90);
      
      expect(screen.getByText('90 days')).toBeTruthy();
      // Accessibility announcement would be tested in integration
    });
  });
});
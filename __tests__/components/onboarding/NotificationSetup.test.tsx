/**
 * NotificationSetup OnBoarding Component Tests - t-wada style TDD
 * Testing the second onboarding step: notification settings
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NotificationSetup } from '../../../src/components/onboarding/NotificationSetup';

describe('NotificationSetup OnBoarding Component', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const defaultProps = {
    onNext: mockOnNext,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render notification setup elements', () => {
      render(<NotificationSetup {...defaultProps} />);

      expect(screen.getByText('Set Daily Reminder')).toBeTruthy();
      expect(screen.getByText('When would you like to be reminded?')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    });

    it('should have notification enabled by default', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      expect(enableSwitch.props.value).toBe(true);
    });

    it('should show default time as 9:00 AM', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      expect(screen.getByText('9:00 AM')).toBeTruthy();
    });
  });

  describe('Notification Toggle', () => {
    it('should disable time picker when notifications are off', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      fireEvent(enableSwitch, 'onValueChange', false);
      
      const timePicker = screen.getByTestId('time-picker-button');
      expect(timePicker.props.disabled).toBe(true);
    });

    it('should show disabled state styling when notifications are off', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      fireEvent(enableSwitch, 'onValueChange', false);
      
      expect(screen.getByText('Notifications disabled')).toBeTruthy();
    });

    it('should enable time picker when notifications are on', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      fireEvent(enableSwitch, 'onValueChange', false);
      fireEvent(enableSwitch, 'onValueChange', true);
      
      const timePicker = screen.getByTestId('time-picker-button');
      expect(timePicker.props.disabled).toBe(false);
    });
  });

  describe('Time Selection', () => {
    it('should show time picker when time button is pressed', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Check for time picker modal or selector
      expect(screen.getByTestId('time-picker-modal')).toBeTruthy();
    });

    it('should update displayed time when new time is selected', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Simulate time selection (6:30 PM)
      const mockTime = new Date();
      mockTime.setHours(18, 30, 0, 0);
      
      fireEvent(screen.getByTestId('time-picker'), 'onChange', {
        nativeEvent: { timestamp: mockTime.getTime() }
      });
      
      expect(screen.getByText('6:30 PM')).toBeTruthy();
    });

    it('should close time picker after time selection', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Select time and confirm
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      
      expect(screen.queryByTestId('time-picker-modal')).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when Back button is pressed', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const backButton = screen.getByRole('button', { name: 'Back' });
      fireEvent.press(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onNext with notification settings when Next is pressed', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      // Set custom time
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      const mockTime = new Date();
      mockTime.setHours(20, 0, 0, 0); // 8:00 PM
      
      fireEvent(screen.getByTestId('time-picker'), 'onChange', {
        nativeEvent: { timestamp: mockTime.getTime() }
      });
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      
      // Proceed to next step
      const nextButton = screen.getByRole('button', { name: 'Next' });
      fireEvent.press(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        enabled: true,
        time: '20:00', // 24-hour format for storage
      });
    });

    it('should call onNext with disabled notifications when toggled off', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      // Disable notifications
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      fireEvent(enableSwitch, 'onValueChange', false);
      
      // Proceed to next step
      const nextButton = screen.getByRole('button', { name: 'Next' });
      fireEvent.press(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        enabled: false,
        time: null,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      expect(enableSwitch.props.accessibilityLabel).toBe('Enable daily reminders');
      
      const timePicker = screen.getByTestId('time-picker-button');
      expect(timePicker.props.accessibilityLabel).toBe('Select reminder time');
    });

    it('should announce notification state changes', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const enableSwitch = screen.getByTestId('notification-enable-switch');
      fireEvent(enableSwitch, 'onValueChange', false);
      
      expect(enableSwitch.props.accessibilityValue?.text).toBe('Notifications disabled');
    });
  });

  describe('Time Format', () => {
    it('should display time in 12-hour format with AM/PM', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      // Test various times
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Test midnight
      let mockTime = new Date();
      mockTime.setHours(0, 0, 0, 0);
      fireEvent(screen.getByTestId('time-picker'), 'onChange', {
        nativeEvent: { timestamp: mockTime.getTime() }
      });
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      expect(screen.getByText('12:00 AM')).toBeTruthy();
      
      // Test noon
      fireEvent.press(timePicker);
      mockTime.setHours(12, 0, 0, 0);
      fireEvent(screen.getByTestId('time-picker'), 'onChange', {
        nativeEvent: { timestamp: mockTime.getTime() }
      });
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      expect(screen.getByText('12:00 PM')).toBeTruthy();
    });
  });
});
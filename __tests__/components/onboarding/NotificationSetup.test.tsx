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
      expect(screen.getByText('Back')).toBeTruthy();
      expect(screen.getByText('Next')).toBeTruthy();
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
      
      // When disabled, the time picker button disappears and shows disabled text
      expect(screen.queryByTestId('time-picker-button')).toBeFalsy();
      expect(screen.getByText('Notifications disabled')).toBeTruthy();
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
      
      // Select 6:30 PM using the custom time picker
      // Select hour 6
      fireEvent.press(screen.getByText('6'));
      // Select 30 minutes
      fireEvent.press(screen.getByText('30'));
      // Select PM
      fireEvent.press(screen.getByText('PM'));
      
      // Confirm the selection
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      
      expect(screen.getByText('6:30 PM')).toBeTruthy();
    });

    it('should close time picker after time selection', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Verify modal is open first
      expect(screen.getByTestId('time-picker-modal')).toBeTruthy();
      
      // Select time and confirm
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      
      // Check that the modal props.visible is false, even if the element still exists
      const modal = screen.getByTestId('time-picker-modal');
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should call onBack when Back button is pressed', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      const backButton = screen.getByText('Back');
      fireEvent.press(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onNext with notification settings when Next is pressed', () => {
      render(<NotificationSetup {...defaultProps} />);
      
      // Set custom time (8:00 PM)
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      // Select hour 8
      fireEvent.press(screen.getByText('8'));
      // Select 00 minutes
      fireEvent.press(screen.getByText('00'));
      // Select PM
      fireEvent.press(screen.getByText('PM'));
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      
      // Proceed to next step
      const nextButton = screen.getByText('Next');
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
      const nextButton = screen.getByText('Next');
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
      
      // Test midnight (12:00 AM)
      const timePicker = screen.getByTestId('time-picker-button');
      fireEvent.press(timePicker);
      
      fireEvent.press(screen.getByText('12'));
      fireEvent.press(screen.getByText('00'));
      fireEvent.press(screen.getByText('AM'));
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      expect(screen.getByText('12:00 AM')).toBeTruthy();
      
      // Test noon (12:00 PM)
      fireEvent.press(timePicker);
      fireEvent.press(screen.getByText('12'));
      fireEvent.press(screen.getByText('00'));
      fireEvent.press(screen.getByText('PM'));
      fireEvent.press(screen.getByTestId('time-picker-confirm'));
      expect(screen.getByText('12:00 PM')).toBeTruthy();
    });
  });
});
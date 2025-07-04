/**
 * VisualSetup OnBoarding Component Tests - t-wada style TDD
 * Testing the third onboarding step: visual type selection
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { VisualSetup } from '../../../src/components/onboarding/VisualSetup';
import { VisualType } from '../../../src/types/database';

describe('VisualSetup OnBoarding Component', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const defaultProps = {
    selectedType: VisualType.TREE,
    onNext: mockOnNext,
    onBack: mockOnBack,
    isPro: false,
  };

  const proProps = {
    ...defaultProps,
    isPro: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render visual type selection elements', () => {
      render(<VisualSetup {...defaultProps} />);

      expect(screen.getByText('Choose Your Growth Visual')).toBeTruthy();
      expect(screen.getByText('Select how you want to visualize your progress')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Finish Setup' })).toBeTruthy();
    });

    it('should display only tree visual type option for free users', () => {
      render(<VisualSetup {...defaultProps} />);

      // Check for visual type cards
      expect(screen.getByTestId('visual-option-tree')).toBeTruthy();
      expect(screen.queryByTestId('visual-option-garden')).toBeFalsy();
      expect(screen.queryByTestId('visual-option-pet')).toBeFalsy();
      expect(screen.queryByTestId('visual-option-progress')).toBeFalsy();
    });

    it('should display all visual type options for pro users', () => {
      render(<VisualSetup {...proProps} />);

      // Check for visual type cards
      expect(screen.getByTestId('visual-option-tree')).toBeTruthy();
      expect(screen.getByTestId('visual-option-garden')).toBeTruthy();
      expect(screen.getByTestId('visual-option-pet')).toBeTruthy();
      expect(screen.getByTestId('visual-option-progress')).toBeTruthy();
    });

    it('should have tree type selected by default', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const treeOption = screen.getByTestId('visual-option-tree');
      expect(treeOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should show visual type descriptions for free users', () => {
      render(<VisualSetup {...defaultProps} />);

      expect(screen.getByText('Watch your tree grow with each completed day')).toBeTruthy();
      expect(screen.queryByText('Cultivate a beautiful garden over time')).toBeFalsy();
      expect(screen.queryByText('Care for your virtual pet through consistency')).toBeFalsy();
      expect(screen.queryByText('Track your progress with a simple bar')).toBeFalsy();
    });

    it('should show all visual type descriptions for pro users', () => {
      render(<VisualSetup {...proProps} />);

      expect(screen.getByText('Watch your tree grow with each completed day')).toBeTruthy();
      expect(screen.getByText('Cultivate a beautiful garden over time')).toBeTruthy();
      expect(screen.getByText('Care for your virtual pet through consistency')).toBeTruthy();
      expect(screen.getByText('Track your progress with a simple bar')).toBeTruthy();
    });
  });

  describe('Visual Type Selection', () => {
    it('should select garden when garden option is pressed', () => {
      render(<VisualSetup {...proProps} />);
      
      const gardenOption = screen.getByTestId('visual-option-garden');
      fireEvent.press(gardenOption);
      
      expect(gardenOption.props.accessibilityState?.selected).toBe(true);
      
      // Tree should no longer be selected
      const treeOption = screen.getByTestId('visual-option-tree');
      expect(treeOption.props.accessibilityState?.selected).toBe(false);
    });

    it('should select pet when pet option is pressed', () => {
      render(<VisualSetup {...proProps} />);
      
      const petOption = screen.getByTestId('visual-option-pet');
      fireEvent.press(petOption);
      
      expect(petOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should select progress bar when progress option is pressed', () => {
      render(<VisualSetup {...proProps} />);
      
      const progressOption = screen.getByTestId('visual-option-progress');
      fireEvent.press(progressOption);
      
      expect(progressOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should update visual preview when selection changes', () => {
      render(<VisualSetup {...proProps} />);
      
      // Initial tree preview
      expect(screen.getByTestId('visual-preview-tree')).toBeTruthy();
      
      // Change to garden
      const gardenOption = screen.getByTestId('visual-option-garden');
      fireEvent.press(gardenOption);
      
      expect(screen.getByTestId('visual-preview-garden')).toBeTruthy();
      expect(screen.queryByTestId('visual-preview-tree')).toBeFalsy();
    });
  });

  describe('Visual Previews', () => {
    it('should show tree visual elements when tree is selected', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const treePreview = screen.getByTestId('visual-preview-tree');
      expect(treePreview).toBeTruthy();
      
      // Should show tree growth stages
      expect(screen.getByText('🌱')).toBeTruthy(); // seed
      expect(screen.getByText('🌿')).toBeTruthy(); // sprout
      expect(screen.getByText('🌳')).toBeTruthy(); // tree
    });

    it('should show garden visual elements when garden is selected', () => {
      render(<VisualSetup {...proProps} />);
      
      const gardenOption = screen.getByTestId('visual-option-garden');
      fireEvent.press(gardenOption);
      
      const gardenPreview = screen.getByTestId('visual-preview-garden');
      expect(gardenPreview).toBeTruthy();
      
      // Should show garden elements
      expect(screen.getByText('🌷')).toBeTruthy(); // flower
      expect(screen.getByText('🌻')).toBeTruthy(); // sunflower
      expect(screen.getByText('🌺')).toBeTruthy(); // hibiscus
    });

    it('should show pet visual elements when pet is selected', () => {
      render(<VisualSetup {...proProps} />);
      
      const petOption = screen.getByTestId('visual-option-pet');
      fireEvent.press(petOption);
      
      const petPreview = screen.getByTestId('visual-preview-pet');
      expect(petPreview).toBeTruthy();
      
      // Should show pet growth stages
      expect(screen.getByText('🥚')).toBeTruthy(); // egg
      expect(screen.getByText('🐣')).toBeTruthy(); // hatching
      expect(screen.getByText('🐱')).toBeTruthy(); // cat
    });

    it('should show progress bar when progress is selected', () => {
      render(<VisualSetup {...proProps} />);
      
      const progressOption = screen.getByTestId('visual-option-progress');
      fireEvent.press(progressOption);
      
      const progressPreview = screen.getByTestId('visual-preview-progress');
      expect(progressPreview).toBeTruthy();
      
      // Should show progress bar elements
      expect(screen.getByTestId('progress-bar-fill')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when Back button is pressed', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const backButton = screen.getByRole('button', { name: 'Back' });
      fireEvent.press(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onNext with tree visual type when Finish Setup is pressed', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const finishButton = screen.getByRole('button', { name: 'Finish Setup' });
      fireEvent.press(finishButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        visualType: VisualType.TREE,
      });
    });

    it('should call onNext with garden visual type when garden is selected', () => {
      render(<VisualSetup {...defaultProps} />);
      
      // Select garden
      const gardenOption = screen.getByTestId('visual-option-garden');
      fireEvent.press(gardenOption);
      
      // Finish setup
      const finishButton = screen.getByRole('button', { name: 'Finish Setup' });
      fireEvent.press(finishButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        visualType: VisualType.GARDEN,
      });
    });

    it('should call onNext with pet visual type when pet is selected', () => {
      render(<VisualSetup {...defaultProps} />);
      
      // Select pet
      const petOption = screen.getByTestId('visual-option-pet');
      fireEvent.press(petOption);
      
      // Finish setup
      const finishButton = screen.getByRole('button', { name: 'Finish Setup' });
      fireEvent.press(finishButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        visualType: VisualType.PET,
      });
    });

    it('should call onNext with progress visual type when progress is selected', () => {
      render(<VisualSetup {...proProps} />);
      
      // Select progress
      const progressOption = screen.getByTestId('visual-option-progress');
      fireEvent.press(progressOption);
      
      // Finish setup
      const finishButton = screen.getByRole('button', { name: 'Finish Setup' });
      fireEvent.press(finishButton);
      
      expect(mockOnNext).toHaveBeenCalledWith({
        visualType: VisualType.PROGRESS_BAR,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for visual options', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const treeOption = screen.getByTestId('visual-option-tree');
      expect(treeOption.props.accessibilityLabel).toBe('Select tree visual');
      expect(treeOption.props.accessibilityHint).toBe('Choose growing tree as your progress visualization');
      
      // Garden option is only available for pro users
      expect(screen.queryByTestId('visual-option-garden')).toBeFalsy();
    });

    it('should announce selection state changes', () => {
      render(<VisualSetup {...defaultProps} />);
      
      // Garden option should not exist for free users
      expect(screen.queryByTestId('visual-option-garden')).toBeFalsy();
      
      // Tree should remain selected
      const treeOption = screen.getByTestId('visual-option-tree');
      expect(treeOption.props.accessibilityState?.selected).toBe(true);
    });

    it('should have proper accessibility role for visual options', () => {
      render(<VisualSetup {...defaultProps} />);
      
      const treeOption = screen.getByTestId('visual-option-tree');
      expect(treeOption.props.accessibilityRole).toBe('radio');
    });
  });

  describe('Visual Type Information', () => {
    it('should show additional info when visual type is selected', () => {
      render(<VisualSetup {...defaultProps} />);
      
      // Tree should show growth stages info
      expect(screen.getByText('Growth Stages: 🌱 → 🌿 → 🌳')).toBeTruthy();
      
      // For free users, garden option doesn't exist
      expect(screen.queryByTestId('visual-option-garden')).toBeFalsy();
      
      // Tree stages info should be shown
      expect(screen.getByText('Growth Stages: 🌱 → 🌿 → 🌳')).toBeTruthy();
    });
  });
});
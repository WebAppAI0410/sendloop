/**
 * Database Service Tests - t-wada style TDD
 * Testing task creation functionality
 */

import { DatabaseService } from '../../src/services/database';
import { TaskCreateInput, VisualType } from '../../src/types/database';

// Mock SQLite
const mockDb = {
  getFirstSync: jest.fn(),
  getAllSync: jest.fn(),
  runSync: jest.fn(),
  prepareSync: jest.fn(() => ({
    executeSync: jest.fn(),
    finalizeSync: jest.fn(),
  })),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
}));

describe('DatabaseService - Task Creation', () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    databaseService = new DatabaseService(mockDb as any);
  });

  describe('createTask', () => {
    it('should create a new task with valid input', async () => {
      // Arrange
      const taskInput: TaskCreateInput = {
        title: 'Daily Exercise',
        cycle_length: 30,
        visual_type: VisualType.TREE,
      };

      const expectedTaskId = 'test-uuid-123';
      const expectedTask = {
        id: expectedTaskId,
        title: 'Daily Exercise',
        cycle_length: 30,
        visual_type: VisualType.TREE,
        start_date: expect.any(String),
        archived: false,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      };

      // Mock successful insertion
      mockDb.runSync.mockReturnValue({ lastInsertRowid: 1 });
      mockDb.getFirstSync.mockReturnValue(expectedTask);

      // Act
      const result = await databaseService.createTask(taskInput);

      // Assert
      expect(result).toEqual({
        success: true,
        data: expectedTask
      });
      expect(mockDb.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.arrayContaining([
          expect.any(String), // id
          'Daily Exercise',
          30,
          VisualType.TREE,
          expect.any(String), // start_date
          false,
          expect.any(String), // created_at
          expect.any(String), // updated_at
        ])
      );
    });

    it('should reject invalid cycle length (too short)', async () => {
      // Arrange
      const invalidTaskInput: TaskCreateInput = {
        title: 'Invalid Task',
        cycle_length: 2, // Less than minimum of 3
        visual_type: VisualType.TREE,
      };

      // Act
      const result = await databaseService.createTask(invalidTaskInput);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Cycle length must be between 3 and 60 days'
      });
    });

    it('should reject invalid cycle length (too long)', async () => {
      // Arrange
      const invalidTaskInput: TaskCreateInput = {
        title: 'Invalid Task',
        cycle_length: 61, // More than maximum of 60
        visual_type: VisualType.TREE,
      };

      // Act
      const result = await databaseService.createTask(invalidTaskInput);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Cycle length must be between 3 and 60 days'
      });
    });

    it('should reject empty task title', async () => {
      // Arrange
      const invalidTaskInput: TaskCreateInput = {
        title: '',
        cycle_length: 30,
        visual_type: VisualType.TREE,
      };

      // Act
      const result = await databaseService.createTask(invalidTaskInput);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Task title cannot be empty'
      });
    });
  });
});
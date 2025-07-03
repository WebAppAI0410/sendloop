/**
 * sendloop Database Provider
 * React Context for database access with SQLiteProvider integration
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { DatabaseService } from '../services/database';
import { migrateDatabase, validateDatabaseSchema } from './migrations';

interface DatabaseContextType {
  service: DatabaseService;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * Database initialization and migration handler
 */
async function initializeDatabase(db: any) {
  console.log('Initializing sendloop database...');
  
  try {
    // Run migrations
    await migrateDatabase(db);
    
    // Validate schema
    const isValid = await validateDatabaseSchema(db);
    if (!isValid) {
      throw new Error('Database schema validation failed');
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Inner provider that has access to SQLite context
 */
function DatabaseContextProvider({ children }: DatabaseProviderProps) {
  const db = useSQLiteContext();
  const service = new DatabaseService(db);

  return (
    <DatabaseContext.Provider value={{ service }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Main database provider that wraps SQLiteProvider
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider 
      databaseName="sendloop.db" 
      onInit={initializeDatabase}
      useSuspense={false}
    >
      <DatabaseContextProvider>
        {children}
      </DatabaseContextProvider>
    </SQLiteProvider>
  );
}

/**
 * Hook to access database service
 */
export function useDatabase(): DatabaseService {
  const context = useContext(DatabaseContext);
  
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  
  return context.service;
}

/**
 * Hook to access raw SQLite database (for advanced operations)
 */
export function useSQLiteDB() {
  return useSQLiteContext();
}
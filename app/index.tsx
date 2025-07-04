/**
 * sendloop Entry Point
 * Routes to OnBoarding or Home based on app state using AppNavigator
 */

import React from 'react';
import { AppNavigator } from '../src/components/AppNavigator';

export default function IndexScreen() {
  return <AppNavigator />;
}

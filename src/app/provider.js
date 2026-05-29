import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '../features/users/context/auth-context';

export const AppProvider = ({ children }) => {
  const primeReactConfig = {
    ripple: true,
    inputStyle: 'outlined',
    locale: 'en',
    appendTo: 'self',
  };

  return (
    <PrimeReactProvider value={primeReactConfig}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrimeReactProvider>
  );
};

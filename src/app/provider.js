import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '../features/users/context/auth-context';

export const AppProvider = ({ children }) => {
  // PrimeReact configuration
  const primeReactConfig = {
    ripple: true,
    inputStyle: 'outlined', // Use outlined input style
    locale: 'en',
    appendTo: 'self', // Append overlays to component itself
  };

  return (
    <PrimeReactProvider value={primeReactConfig}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrimeReactProvider>
  );
};

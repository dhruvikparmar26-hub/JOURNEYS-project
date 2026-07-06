import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Convenience hook for accessing the auth context.
 * Throws if used outside of <AuthProvider>.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};

export default useAuth;

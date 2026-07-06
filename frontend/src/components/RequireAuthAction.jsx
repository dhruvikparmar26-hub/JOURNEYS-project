import React from 'react';
import useAuth from '../hooks/useAuth.js';

/**
 * RequireAuthAction Wrapper Component.
 *
 * Gates interactive buttons or triggers (like Save or Book).
 * If the user is authenticated, runs onAuthed immediately.
 * If not, opens the global auth modal with a contextual message,
 * and defers calling onAuthed until successful login.
 */
const RequireAuthAction = ({ children, onAuthed, contextMessage }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleAction = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (isAuthenticated) {
      if (onAuthed) onAuthed();
    } else {
      if (openAuthModal) {
        openAuthModal(contextMessage || 'Please sign in to proceed.', onAuthed);
      }
    }
  };

  // Inject handleAction as onClick to the child element
  return React.cloneElement(React.Children.only(children), {
    onClick: handleAction,
  });
};

export default RequireAuthAction;

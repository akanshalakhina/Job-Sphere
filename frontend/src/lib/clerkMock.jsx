import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a mock context for auth/user
const MockClerkContext = createContext(null);

export const ClerkProvider = ({ children }) => {
  const [sessionUser, setSessionUser] = useState(() => {
    const stored = window.localStorage.getItem('clerk_mock_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse clerk_mock_user from localStorage", e);
      }
    }
    // Fallback default mock user if none set
    return {
      id: 'mock_candidate_vansh',
      email: 'vansh.karnwal@gmail.com',
      name: 'Vansh Karnwal',
      role: window.localStorage.getItem('userRole') || 'candidate',
    };
  });

  useEffect(() => {
    const checkUser = () => {
      const stored = window.localStorage.getItem('clerk_mock_user');
      let nextUser = null;
      if (stored) {
        try {
          nextUser = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse clerk_mock_user from localStorage", e);
        }
      } else {
        // Fallback default mock user if none set
        nextUser = {
          id: 'mock_candidate_vansh',
          email: 'vansh.karnwal@gmail.com',
          name: 'Vansh Karnwal',
          role: window.localStorage.getItem('userRole') || 'candidate',
        };
      }

      setSessionUser(prev => {
        if (!prev && !nextUser) return null;
        if (!prev || !nextUser) return nextUser;
        // Compare essential fields to avoid reference change when fields are identical
        if (
          prev.id === nextUser.id &&
          prev.email === nextUser.email &&
          prev.name === nextUser.name &&
          prev.role === nextUser.role &&
          prev.avatar === nextUser.avatar
        ) {
          return prev;
        }
        return nextUser;
      });
    };

    checkUser();
    const interval = setInterval(checkUser, 200);
    return () => clearInterval(interval);
  }, []);

  const value = React.useMemo(() => {
    return {
      isSignedIn: !!sessionUser,
      isLoaded: true,
      user: sessionUser ? {
        id: sessionUser.id,
        fullName: sessionUser.name,
        firstName: sessionUser.name ? sessionUser.name.split(' ')[0] : '',
        lastName: sessionUser.name ? sessionUser.name.split(' ').slice(1).join(' ') : '',
        primaryEmailAddress: { emailAddress: sessionUser.email },
        imageUrl: sessionUser.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        publicMetadata: { role: sessionUser.role },
        unsafeMetadata: {},
      } : null,
      signOut: () => {
        window.localStorage.removeItem('clerk_mock_user');
        window.localStorage.removeItem('userRole');
        setSessionUser(null);
      },
      getToken: async () => 'mock_jwt_token'
    };
  }, [sessionUser]);

  return (
    <MockClerkContext.Provider value={value}>
      {children}
    </MockClerkContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(MockClerkContext);
  return {
    isSignedIn: ctx?.isSignedIn ?? false,
    isLoaded: ctx?.isLoaded ?? true,
    signOut: ctx?.signOut ?? (() => {}),
    getToken: ctx?.getToken ?? (async () => 'mock_jwt_token'),
  };
};

export const useUser = () => {
  const ctx = useContext(MockClerkContext);
  return {
    isSignedIn: ctx?.isSignedIn ?? false,
    isLoaded: ctx?.isLoaded ?? true,
    user: ctx?.user ?? null,
  };
};

export const SignedIn = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }) => {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
};

export const SignIn = () => {
  return <div data-testid="mock-signin">Sign In Component</div>;
};

export const SignUp = () => {
  return <div data-testid="mock-signup">Sign Up Component</div>;
};

import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';

/**
 * RoleGuard wraps admin UI and redirects non-admin users to the Main app or Auth.
 * Use it around admin navigators or screens to enforce client-side gating.
 */
const RoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      // If the user is not an admin, send them to the main screen (or Auth if unauthenticated)
      // We use reset to avoid leaving admin routes in history
      navigation.reset({ index: 0, routes: [{ name: isAuthenticated ? 'Main' : 'Auth' } as any] });
    }
  }, [isAuthenticated, user, navigation]);

  return <>{children}</>;
};

export default RoleGuard;

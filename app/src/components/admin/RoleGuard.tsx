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
      // Use the root navigator to perform the reset so the RESET action is handled.
      try {
        // climb to the root navigator
        let rootNav: any = navigation as any;
        while (rootNav.getParent && rootNav.getParent()) {
          rootNav = rootNav.getParent();
        }
        rootNav.reset({ index: 0, routes: [{ name: isAuthenticated ? 'Main' : 'Auth' } as any] });
      } catch (e) {
        // fallback: try original navigation.reset
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigation as any).reset({ index: 0, routes: [{ name: isAuthenticated ? 'Main' : 'Auth' } as any] });
      }
    }
  }, [isAuthenticated, user, navigation]);

  return <>{children}</>;
};

export default RoleGuard;

import React, { useEffect, useState, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Permission, UserRole } from '../../types/roles';
import { hasPermission, hasAnyPermission, getUserRole } from '../../services/permissions';
import { theme } from '../../theme';

interface PermissionGateProps {
  children: ReactNode;
  /** Single permission required */
  permission?: Permission;
  /** Multiple permissions - user needs ANY of these */
  anyPermission?: Permission[];
  /** Multiple permissions - user needs ALL of these */
  allPermissions?: Permission[];
  /** Specific roles allowed */
  roles?: UserRole[];
  /** Component to render when access is denied (default: null) */
  fallback?: ReactNode;
  /** Show loading indicator while checking permissions */
  showLoading?: boolean;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 *
 * Usage:
 * <PermissionGate permission="view_member_directory">
 *   <MemberDirectoryButton />
 * </PermissionGate>
 *
 * <PermissionGate roles={['pastor', 'admin']}>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * <PermissionGate anyPermission={['take_kids_attendance', 'take_sunday_service_attendance']}>
 *   <AttendanceButton />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  roles,
  fallback = null,
  showLoading = false,
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check role-based access
        if (roles && roles.length > 0) {
          const userRole = await getUserRole();
          if (roles.includes(userRole)) {
            setHasAccess(true);
            return;
          }
        }

        // Check single permission
        if (permission) {
          const allowed = await hasPermission(permission);
          setHasAccess(allowed);
          return;
        }

        // Check any permission
        if (anyPermission && anyPermission.length > 0) {
          const allowed = await hasAnyPermission(anyPermission);
          setHasAccess(allowed);
          return;
        }

        // Check all permissions
        if (allPermissions && allPermissions.length > 0) {
          const results = await Promise.all(
            allPermissions.map((p) => hasPermission(p))
          );
          setHasAccess(results.every((r) => r));
          return;
        }

        // No permission criteria specified - deny by default
        setHasAccess(false);
      } catch (error) {
        console.error('Permission check error:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [permission, anyPermission, allPermissions, roles]);

  // Still checking permissions
  if (hasAccess === null) {
    if (showLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    return null;
  }

  // Access denied
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // Access granted
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: theme.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Avatar } from '../../components';
import { RoleBadge } from '../../components/common/RoleBadge';
import { theme } from '../../theme';
import { UserRole } from '../../types/roles';
import {
  getUserRole,
  isPastor,
  canManageSundaySchool,
  canTakeKidsAttendance,
  clearPermissionCache,
} from '../../services/permissions';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const [userRole, setUserRole] = useState<UserRole>('member');
  const [canManageSS, setCanManageSS] = useState(false);
  const [canTakeSSAttendance, setCanTakeSSAttendance] = useState(false);
  const [isPastorUser, setIsPastorUser] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const [role, manageSS, takeAttendance, pastorCheck] = await Promise.all([
      getUserRole(),
      canManageSundaySchool(),
      canTakeKidsAttendance(),
      isPastor(),
    ]);
    setUserRole(role);
    setCanManageSS(manageSS);
    setCanTakeSSAttendance(takeAttendance);
    setIsPastorUser(pastorCheck);
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            clearPermissionCache();
            await signOut(auth);
            // Navigation handled automatically by auth state listener
          } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      {showArrow && <Text style={styles.menuArrow}>→</Text>}
    </TouchableOpacity>
  );

  const MenuSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            imageUrl={user?.photoURL || undefined}
            name={user?.displayName || 'User'}
            size="large"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.displayName || 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            {userRole !== 'member' && (
              <View style={styles.roleBadgeContainer}>
                <RoleBadge role={userRole} size="small" />
              </View>
            )}
          </View>
        </View>

        {/* My Profile */}
        <MenuSection title="My Profile">
          <MenuItem
            icon="👤"
            title="View/Edit Profile"
            onPress={() => Alert.alert('Coming Soon', 'Profile editing feature')}
          />
          <MenuItem
            icon="⚙️"
            title="App Preferences"
            onPress={() => Alert.alert('Coming Soon', 'App preferences feature')}
          />
          <MenuItem
            icon="💾"
            title="Saved Content"
            onPress={() => Alert.alert('Coming Soon', 'Saved content feature')}
          />
          <MenuItem
            icon="🔔"
            title="Notification Settings"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings')}
          />
        </MenuSection>

        {/* Administration (Pastor/Admin only) */}
        {isPastorUser && (
          <MenuSection title="Administration">
            <MenuItem
              icon="👥"
              title="Member Directory"
              onPress={() => navigation.navigate('MemberDirectory')}
            />
            <MenuItem
              icon="⚙️"
              title="Role Management"
              onPress={() => Alert.alert('Coming Soon', 'Role management feature')}
            />
          </MenuSection>
        )}

        {/* Sunday School Management (SS Head + Pastor) */}
        {(canManageSS || canTakeSSAttendance) && (
          <MenuSection title="Sunday School Management">
            <MenuItem
              icon="📊"
              title="Dashboard"
              onPress={() => navigation.navigate('SundaySchoolDashboard')}
            />
            {canTakeSSAttendance && (
              <MenuItem
                icon="✅"
                title="Take Attendance"
                onPress={() => navigation.navigate('KidsCheckIn')}
              />
            )}
            {canManageSS && (
              <MenuItem
                icon="👶"
                title="Register Child"
                onPress={() => navigation.navigate('ChildRegistration')}
              />
            )}
          </MenuSection>
        )}

        {/* Sunday School (for all users) */}
        <MenuSection title="Sunday School">
          <MenuItem
            icon="📚"
            title="Details"
            onPress={() => Alert.alert('Coming Soon', 'Sunday School details')}
          />
          <MenuItem
            icon="📅"
            title="Class Schedules"
            onPress={() => Alert.alert('Coming Soon', 'Class schedules')}
          />
          <MenuItem
            icon="✍️"
            title="Register My Child"
            onPress={() => navigation.navigate('ChildRegistration')}
          />
        </MenuSection>

        {/* Volunteer with Us */}
        <MenuSection title="Volunteer with Us">
          <MenuItem
            icon="🎪"
            title="Events"
            onPress={() => Alert.alert('Coming Soon', 'Volunteer events')}
          />
          <MenuItem
            icon="❤️"
            title="Charity Activities"
            onPress={() => Alert.alert('Coming Soon', 'Charity activities')}
          />
        </MenuSection>

        {/* Donate */}
        <MenuSection title="Donate to us">
          <MenuItem
            icon="💰"
            title="Tithes/Offerings"
            onPress={() => Alert.alert('Coming Soon', 'Donation feature with Stripe')}
          />
        </MenuSection>

        {/* About the Church */}
        <MenuSection title="About the Church">
          <MenuItem
            icon="✨"
            title="Mission & Vision"
            onPress={() => Alert.alert('Coming Soon', 'Mission & vision')}
          />
          <MenuItem
            icon="📖"
            title="History"
            onPress={() => Alert.alert('Coming Soon', 'Church history')}
          />
        </MenuSection>

        {/* Contact & Support */}
        <MenuSection title="Contact & Support">
          <MenuItem
            icon="📧"
            title="Get in touch"
            onPress={() => Alert.alert('Coming Soon', 'Contact feature')}
          />
          <MenuItem
            icon="🤝"
            title="Request Help"
            onPress={() => Alert.alert('Coming Soon', 'Request help feature')}
          />
        </MenuSection>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  closeIcon: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[20],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.white,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[6],
    ...theme.shadows.card,
  },
  profileInfo: {
    marginLeft: theme.spacing[4],
    flex: 1,
  },
  userName: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  userEmail: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
  },
  roleBadgeContainer: {
    marginTop: theme.spacing[2],
  },
  menuSection: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[3],
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[50],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing[3],
  },
  menuTitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  menuArrow: {
    fontSize: 18,
    color: theme.colors.text.tertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.white,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing[4],
    ...theme.shadows.card,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: theme.spacing[2],
  },
  logoutText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.status.error,
  },
  version: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing[6],
  },
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SermonsScreen } from '../screens/sermons/SermonsScreen';
import { PrayerWallScreen } from '../screens/prayers/PrayerWallScreen';
import { UpdatesScreen } from '../screens/updates/UpdatesScreen';
import { LifeGroupsScreen } from '../screens/lifegroups/LifeGroupsScreen';
import DonationScreen from '../screens/donations/DonationScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primaryAccent,
        tabBarInactiveTintColor: theme.colors.gray[700],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sermons"
        component={SermonsScreen}
        options={{
          tabBarLabel: 'Sermons',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Give"
        component={DonationScreen}
        options={{
          tabBarLabel: 'Give',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Prayer Wall"
        component={PrayerWallScreen}
        options={{
          tabBarLabel: 'Prayer',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hand-right" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Life Groups"
        component={LifeGroupsScreen}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdatesScreen}
        options={{
          tabBarLabel: 'Updates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    height: theme.layout.navigationBar,
    backgroundColor: theme.colors.background.white,
    borderTopLeftRadius: theme.borderRadius.navigationBar,
    borderTopRightRadius: theme.borderRadius.navigationBar,
    ...theme.shadows.navigation,
    paddingTop: 10,
    paddingBottom: 25,
  },
  tabBarLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  tabBarIcon: {
    marginBottom: -5,
  },
});

/**
 * components/AppDrawerContent.js
 *
 * Shared custom drawer content for BOTH InternDrawer and StaffDrawer -
 * standard nav items on top (via Paper's default DrawerItemList,
 * preserving each Drawer.Screen's own icon/label/active-state styling),
 * a divider, then a gradient Logout button pinned at the bottom. Kept in
 * one file so intern and staff drawers can't drift into two different
 * logout implementations.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { logoutThunk, selectCurrentUser } from '../store/slices/authSlice';
import { PIAColors, PIAGradients } from '../theme/theme';

export default function AppDrawerContent(props) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const displayName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';

  return (
    <View style={styles.flexFill}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {displayName ? (
          <View style={styles.profileBlock}>
            <View style={styles.avatarCircle}>
              <Icon name="account" size={28} color={PIAColors.green} />
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        ) : null}

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableRipple
          onPress={() => dispatch(logoutThunk())}
          borderless
          style={styles.logoutWrapper}
        >
          <LinearGradient
            colors={PIAGradients.primaryDark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutButton}
          >
            <Icon name="logout" size={18} color={PIAColors.white} style={styles.logoutIcon} />
            <Text style={styles.logoutLabel}>Log Out</Text>
          </LinearGradient>
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  scrollContent: { paddingTop: 0 },

  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: PIAColors.ink + '14',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PIAColors.greenLight + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileName: { fontWeight: '700', fontSize: 15, flex: 1 },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: PIAColors.ink + '14',
  },
  logoutWrapper: { borderRadius: 14, overflow: 'hidden' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutIcon: { marginRight: 8 },
  logoutLabel: { color: PIAColors.white, fontWeight: '700', fontSize: 15 },
});
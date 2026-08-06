/**
 * components/AppDrawerContent.js
 *
 * Shared custom drawer content for BOTH InternDrawer and StaffDrawer.
 *
 * CHANGES this update:
 *   - Logout now requires confirmation (Dialog) before dispatching
 *     logoutThunk - previously it fired immediately on tap, which is
 *     what was read as "doesn't do anything" (it worked, but with zero
 *     visible feedback/ceremony for a destructive action, it can feel
 *     like a no-op even when it isn't).
 *   - Added top padding above the item list and vertical spacing between
 *     items (via drawerItemStyle in each Drawer.Navigator's
 *     screenOptions - see InternDrawer.js/StaffDrawer.js).
 *   - ComingSoonDrawerLabel exported for use on any Drawer.Screen whose
 *     component is still a placeholder, so the drawer visually
 *     distinguishes working pages from under-construction ones instead
 *     of presenting them identically.
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Button, Dialog, Portal, Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { logoutThunk, selectCurrentUser } from '../store/slices/authSlice';
import { PIAColors, PIAGradients } from '../theme/theme';

/**
 * Drop into any Drawer.Screen's options as:
 *   options={{ drawerLabel: (props) => <ComingSoonDrawerLabel {...props} label="Profile" /> }}
 */
export function ComingSoonDrawerLabel({ label, color }) {
  return (
    <View style={labelStyles.row}>
      <Text style={[labelStyles.label, { color }]}>{label}</Text>
      <View style={labelStyles.badge}>
        <Text style={labelStyles.badgeText}>Soon</Text>
      </View>
    </View>
  );
}

export default function AppDrawerContent(props) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const displayName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';

  const handleConfirmLogout = () => {
    setConfirmVisible(false);
    dispatch(logoutThunk());
  };

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

        <View style={styles.topSpacer} />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableRipple
          onPress={() => setConfirmVisible(true)}
          borderless
          rippleColor={PIAColors.white + '55'}
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

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Log out?</Dialog.Title>
          <Dialog.Content>
            <Text>You'll need to sign in again to access your account.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button onPress={handleConfirmLogout} textColor={PIAColors.error}>
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  scrollContent: { paddingTop: 0 },
  topSpacer: { height: 12 },

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

const labelStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  label: { fontSize: 14, flex: 1 },
  badge: {
    backgroundColor: PIAColors.gold + '26',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: PIAColors.gold },
});
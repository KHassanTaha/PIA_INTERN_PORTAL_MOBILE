import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, Badge, Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientHeader } from '../../components/Gradients';
import { NOTIFICATION_TYPE_META } from '../../constants/notificationTypes';
import {
  fetchNotificationsThunk,
  markNotificationReadThunk,
  selectAllNotifications,
  selectNotificationsError,
  selectNotificationsStatus,
} from '../../store/slices/notificationsSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const status = useSelector(selectNotificationsStatus);
  const error = useSelector(selectNotificationsError);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const handlePress = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationReadThunk(notification.id));
    }
    const meta = NOTIFICATION_TYPE_META[notification.type];
    if (meta?.navigateTo) {
      navigation.navigate(meta.navigateTo.drawerScreen, {
        screen: meta.navigateTo.stackScreen,
      });
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Notifications" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => dispatch(fetchNotificationsThunk())}
            colors={[PIAColors.green]}
          />
        }
        renderItem={({ item }) => {
          const meta = NOTIFICATION_TYPE_META[item.type];
          return (
            <TouchableRipple onPress={() => handlePress(item)} style={styles.rowWrapper}>
              <View style={[styles.row, !item.read && styles.rowUnread]}>
                <View style={[styles.iconCircle, { backgroundColor: meta.color + '22' }]}>
                  <Icon name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={styles.textBlock}>
                  <Text variant="bodyMedium" style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.body} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
                {!item.read && <Badge size={10} style={styles.unreadDot} />}
              </View>
            </TouchableRipple>
          );
        }}
        ListEmptyComponent={
          status === 'loading' ? null : (
            <View style={styles.emptyState}>
              <Icon name="bell-outline" size={40} color={PIAColors.ink + '55'} />
              <Text style={styles.mutedText}>
                {error ? `Couldn't load notifications: ${error}` : "You're all caught up."}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },

  listContent: { paddingVertical: 4 },
  rowWrapper: { paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: PIAColors.ink + '10',
  },
  rowUnread: { backgroundColor: PIAColors.greenLight + '0D' },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: { flex: 1 },
  title: { fontWeight: '700' },
  body: { opacity: 0.65, marginTop: 2 },
  timestamp: { opacity: 0.45, marginTop: 4 },

  unreadDot: { backgroundColor: PIAColors.green, marginLeft: 8, marginTop: 6 },

  emptyState: { alignItems: 'center', paddingVertical: 64 },
  mutedText: { opacity: 0.6, marginTop: 12 },
});
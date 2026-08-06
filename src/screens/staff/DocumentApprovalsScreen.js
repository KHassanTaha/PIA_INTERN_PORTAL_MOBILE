import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import FilePreview from '../../components/documents/FilePreview';
import { UPLOAD_TYPE_META, REQUEST_TYPE_META, DocumentStatus } from '../../constants/documentTypes';
import { fetchPendingQueueThunk, selectQueue, selectQueueError, selectQueueStatus } from '../../store/slices/documentsAdminSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const FILTER_ALL = 'ALL';
const FILTER_UPLOADS = 'upload';
const FILTER_REQUESTS = 'request';

function typeMetaFor(item) {
  return item.category === 'upload' ? UPLOAD_TYPE_META[item.type] : REQUEST_TYPE_META[item.type];
}

function timeAgo(isoString) {
  const hours = Math.floor((Date.now() - new Date(isoString).getTime()) / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DocumentApprovalsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const queue = useSelector(selectQueue);
  const status = useSelector(selectQueueStatus);
  const error = useSelector(selectQueueError);

  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  useEffect(() => {
    dispatch(fetchPendingQueueThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (activeFilter === FILTER_ALL) return queue;
    return queue.filter((item) => item.category === activeFilter);
  }, [queue, activeFilter]);

  const filterOptions = [
    { key: FILTER_ALL, label: `All (${queue.length})`, color: PIAColors.ink },
    { key: FILTER_UPLOADS, label: 'Uploads', color: PIAColors.green },
    { key: FILTER_REQUESTS, label: 'Requests', color: PIAColors.gold },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Document Approvals" titleStyle={styles.headerTitle} />
      </GradientHeader>

      {/* Fixed, non-scrolling, wraps rather than scrolls - same pattern
          established for TasksScreen's filter row. */}
      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <StatusChip
            key={option.key}
            label={option.label}
            color={option.color}
            selected={activeFilter === option.key}
            onPress={() => setActiveFilter(option.key)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.category}-${item.id}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={status === 'loading'} onRefresh={() => dispatch(fetchPendingQueueThunk())} colors={[PIAColors.green]} />
        }
        renderItem={({ item }) => {
          const typeMeta = typeMetaFor(item);
          return (
            <TouchableRipple
              onPress={() => navigation.navigate('DocumentReview', { id: item.id, category: item.category })}
              style={styles.rowWrapper}
            >
              <View style={styles.row}>
                {item.category === 'upload' ? (
                  <FilePreview fileUri={item.fileUri} fileName={item.fileName} fileMimeType={item.fileMimeType} size="thumbnail" />
                ) : (
                  <View style={styles.requestIconCircle}>
                    <StatusChip label="" icon={typeMeta.icon} color={PIAColors.gold} style={styles.iconOnlyChip} />
                  </View>
                )}

                <View style={styles.rowTextBlock}>
                  <Text variant="bodyMedium" style={styles.rowTitle}>
                    {typeMeta.label}
                  </Text>
                  <Text variant="bodySmall" style={styles.rowSubtitle}>
                    {item.category === 'upload' ? 'Document upload' : 'Document request'} • {timeAgo(item.submittedAt)}
                  </Text>
                  <StatusChip
                    label={item.status === DocumentStatus.IN_REVIEW ? 'In review' : 'Pending'}
                    color={item.status === DocumentStatus.IN_REVIEW ? PIAColors.goldLight : PIAColors.gold}
                    style={styles.statusChipSpacing}
                  />
                </View>
              </View>
            </TouchableRipple>
          );
        }}
        ListEmptyComponent={
          status === 'loading' ? null : (
            <View style={styles.emptyState}>
              <Text style={styles.mutedText}>
                {error ? `Couldn't load the queue: ${error}` : 'Nothing pending review right now.'}
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

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 2,
    backgroundColor: PIAColors.offWhite,
  },

  listContent: { padding: 16, paddingTop: 8 },
  rowWrapper: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PIAColors.white,
    borderRadius: 16,
    padding: 12,
  },
  requestIconCircle: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconOnlyChip: { marginRight: 0 },
  rowTextBlock: { flex: 1, marginLeft: 12 },
  rowTitle: { fontWeight: '700' },
  rowSubtitle: { opacity: 0.6, marginTop: 2, marginBottom: 6 },
  statusChipSpacing: { alignSelf: 'flex-start' },

  emptyState: { padding: 32, alignItems: 'center' },
  mutedText: { opacity: 0.6, textAlign: 'center' },
});
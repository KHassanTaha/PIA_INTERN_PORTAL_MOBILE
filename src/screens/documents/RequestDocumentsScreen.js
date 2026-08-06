import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { GradientAccentBar, GradientButton, GradientHeader, IconBadge } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import IssuedDocumentModal from '../../components/documents/IssuedDocumentModal';
import { DocumentStatus, RequestDocumentType, REQUEST_TYPE_META } from '../../constants/documentTypes';
import { getIssuedDocument } from '../../services/documents';
import {
  fetchMyDocumentsThunk,
  selectActionError,
  selectActionStatus,
  selectMyRequests,
  submitRequestThunk,
  withdrawRequestThunk,
} from '../../store/slices/documentsSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const STATUS_CHIP_META = {
  [DocumentStatus.PENDING]: { label: 'Submitted — awaiting review', color: PIAColors.gold, icon: 'progress-clock' },
  [DocumentStatus.IN_REVIEW]: { label: 'In review', color: PIAColors.goldLight, icon: 'eye-outline' },
  [DocumentStatus.APPROVED]: { label: 'Approved', color: PIAColors.green, icon: 'check-circle-outline' },
  [DocumentStatus.REJECTED]: { label: 'Rejected', color: PIAColors.error, icon: 'close-circle-outline' },
};

const ACCENTS = {
  [RequestDocumentType.ID_CARD]: PIAGradients.primary,
  [RequestDocumentType.GATE_PASS]: PIAGradients.accent,
  [RequestDocumentType.LETTER_OF_INTERNSHIP]: PIAGradients.primaryDark,
};

function RequestTypeCard({ type }) {
  const dispatch = useDispatch();
  const typeMeta = REQUEST_TYPE_META[type];
  const requests = useSelector(selectMyRequests);
  const actionStatus = useSelector((s) => selectActionStatus(s, type));
  const actionError = useSelector((s) => selectActionError(s, type));

  const [viewerVisible, setViewerVisible] = useState(false);
  const [issuedFile, setIssuedFile] = useState(null);
  const [issuedLoading, setIssuedLoading] = useState(false);
  const [issuedError, setIssuedError] = useState(null);

  const record = requests
    .filter((r) => r.type === type)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const isActive = record && (record.status === DocumentStatus.PENDING || record.status === DocumentStatus.IN_REVIEW);
  const isSubmitting = actionStatus === 'loading';

  const handleRequest = () => dispatch(submitRequestThunk(type));
  const handleWithdraw = () => record && dispatch(withdrawRequestThunk(record.id));

  const handleView = async () => {
    setViewerVisible(true);
    setIssuedLoading(true);
    setIssuedError(null);
    try {
      const file = await getIssuedDocument(record.id);
      setIssuedFile(file);
    } catch (err) {
      setIssuedError(err.message || 'Could not load document.');
    } finally {
      setIssuedLoading(false);
    }
  };

  return (
    <View style={styles.optionCard}>
      <GradientAccentBar gradient={ACCENTS[type]} />
      <View style={styles.optionCardContent}>
        <View style={styles.optionHeaderRow}>
          <IconBadge icon={typeMeta.icon} tint={PIAColors.greenLight + '26'} color={PIAColors.green} />
          <View style={styles.optionHeaderText}>
            <Text variant="titleMedium" style={styles.optionTitle}>
              {typeMeta.label}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {typeMeta.description}
            </Text>
          </View>
        </View>

        {record ? (
          <View style={styles.statusBlock}>
            <StatusChip
              label={STATUS_CHIP_META[record.status].label}
              icon={STATUS_CHIP_META[record.status].icon}
              color={STATUS_CHIP_META[record.status].color}
            />

            {record.status === DocumentStatus.REJECTED && record.decisionNote ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{record.decisionNote}</Text>
              </View>
            ) : null}

            {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

            {record.status === DocumentStatus.APPROVED && (
              <View style={styles.actionRow}>
                <GradientButton icon="eye-outline" label="View & Download" gradient={ACCENTS[type]} onPress={handleView} />
              </View>
            )}

            {record.status === DocumentStatus.PENDING && (
              <View style={styles.withdrawRow}>
                <Text onPress={handleWithdraw} style={styles.withdrawText}>
                  Withdraw request
                </Text>
              </View>
            )}

            {record.status === DocumentStatus.REJECTED && (
              <View style={styles.actionRow}>
                <GradientButton
                  icon="refresh"
                  label={isSubmitting ? 'Submitting…' : 'Request Again'}
                  gradient={ACCENTS[type]}
                  disabled={isSubmitting}
                  onPress={handleRequest}
                />
              </View>
            )}
          </View>
        ) : (
          <>
            {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
            <GradientButton
              icon={typeMeta.icon}
              label={isSubmitting ? 'Requesting…' : `Request ${typeMeta.label}`}
              gradient={ACCENTS[type]}
              disabled={isSubmitting}
              onPress={handleRequest}
            />
          </>
        )}
      </View>

      <IssuedDocumentModal
        visible={viewerVisible}
        onDismiss={() => setViewerVisible(false)}
        documentLabel={typeMeta.label}
        file={issuedFile}
        loading={issuedLoading}
        error={issuedError}
      />
    </View>
  );
}

export default function RequestDocumentsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyDocumentsThunk());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Request Documents" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.values(RequestDocumentType).map((type) => (
          <RequestTypeCard key={type} type={type} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 32 },

  optionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PIAColors.white,
  },
  optionCardContent: { padding: 16, paddingTop: 18 },
  optionHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  optionHeaderText: { flex: 1, marginLeft: 12 },
  optionTitle: { fontWeight: '700', letterSpacing: 0.2 },
  mutedText: { opacity: 0.65, marginTop: 4, lineHeight: 18 },

  statusBlock: { marginTop: 14 },
  noteBox: { marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: PIAColors.error + '14' },
  noteText: { color: PIAColors.error, fontSize: 12 },
  errorText: { color: PIAColors.error, fontSize: 12, marginTop: 8 },

  actionRow: { marginTop: 10 },
  withdrawRow: { marginTop: 10 },
  withdrawText: { color: PIAColors.error, fontSize: 12, fontWeight: '600' },
});
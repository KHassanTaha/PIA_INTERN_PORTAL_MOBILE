import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Card, Chip, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { OfflineBanner } from '../../components/OfflineBanner';
import { GradientAccentBar, GradientButton, GradientHeader, IconBadge } from '../../components/Gradients';
import { submitDocumentRequestOffline } from '../../store/slices/documentRequestsSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const DOCUMENT_LABELS = {
  ID_CARD: 'ID Card',
  LETTER_OF_INTERNSHIP: 'Letter of Internship',
};

function statusChip(request) {
  if (request.syncStatus === 'pending') {
    return (
      <Chip icon="clock-outline" compact style={styles.chipQueued}>
        Queued — will submit when online
      </Chip>
    );
  }
  if (request.syncStatus === 'failed') {
    return (
      <Chip icon="alert-circle-outline" compact style={styles.chipFailed}>
        Sync failed — will retry
      </Chip>
    );
  }
  switch (request.status) {
    case 'approved':
      return (
        <Chip icon="check-circle-outline" compact style={styles.chipApproved}>
          Approved
        </Chip>
      );
    case 'rejected':
      return (
        <Chip icon="close-circle-outline" compact style={styles.chipRejected}>
          Rejected
        </Chip>
      );
    default:
      return (
        <Chip icon="progress-clock" compact style={styles.chipPending}>
          Submitted — awaiting review
        </Chip>
      );
  }
}

export default function RequestDocumentsScreen({ navigation }) {
  const dispatch = useDispatch();
  const requests = useSelector((s) => s.documentRequests.requests);
  const [letterNote, setLetterNote] = useState('');

  // A document type is "locked" while it has a request that's neither
  // approved nor rejected yet (covers both server-pending and
  // still-queued-offline items, since both start life with status
  // 'pending'). Re-requesting is only allowed again once that request is
  // resolved one way or the other.
  const pendingByType = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      if (r.status !== 'approved' && r.status !== 'rejected') {
        map[r.type] = r;
      }
    });
    return map;
  }, [requests]);

  const idCardPending = pendingByType.ID_CARD;
  const letterPending = pendingByType.LETTER_OF_INTERNSHIP;

  const handleRequest = (type, note = '') => {
    dispatch(submitDocumentRequestOffline(type, note));
    if (type === 'LETTER_OF_INTERNSHIP') setLetterNote('');
  };

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Request Documents" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <OfflineBanner />

      <FlatList
        contentContainerStyle={styles.content}
        data={requests}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Card style={styles.optionCard} mode="elevated">
              <GradientAccentBar gradient={PIAGradients.primary} />
              <Card.Content style={styles.optionCardContent}>
                <View style={styles.optionHeaderRow}>
                  <IconBadge
                    icon="card-account-details-outline"
                    tint={PIAColors.greenLight + '26'}
                    color={PIAColors.green}
                  />
                  <View style={styles.optionHeaderText}>
                    <Text variant="titleMedium" style={styles.optionTitle}>
                      ID Card
                    </Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      Generates a soft-copy ID card with your current
                      department and mentor details.
                    </Text>
                  </View>
                </View>

                {idCardPending ? (
                  <View style={styles.pendingNotice}>
                    <Text variant="bodySmall" style={styles.pendingNoticeText}>
                      Your request is already awaiting review — you'll be
                      able to request again if it's rejected.
                    </Text>
                  </View>
                ) : (
                  <GradientButton
                    icon="card-account-details-outline"
                    label="Request ID Card"
                    gradient={PIAGradients.primary}
                    onPress={() => handleRequest('ID_CARD')}
                  />
                )}
              </Card.Content>
            </Card>

            <Card style={styles.optionCard} mode="elevated">
              <GradientAccentBar gradient={PIAGradients.accent} />
              <Card.Content style={styles.optionCardContent}>
                <View style={styles.optionHeaderRow}>
                  <IconBadge
                    icon="file-document-outline"
                    tint={PIAColors.goldLight + '3D'}
                    color={PIAColors.gold}
                  />
                  <View style={styles.optionHeaderText}>
                    <Text variant="titleMedium" style={styles.optionTitle}>
                      Letter of Internship
                    </Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      Requires mentor sign-off. Briefly describe your tech
                      stack / project so your mentor can review it.
                    </Text>
                  </View>
                </View>

                {letterPending ? (
                  <View style={styles.pendingNotice}>
                    <Text variant="bodySmall" style={styles.pendingNoticeText}>
                      Your request is already awaiting review — you'll be
                      able to request again if it's rejected.
                    </Text>
                  </View>
                ) : (
                  <>
                    <TextInput
                      mode="outlined"
                      placeholder="e.g. React Native, Node.js, SQL Server"
                      value={letterNote}
                      onChangeText={setLetterNote}
                      style={styles.noteInput}
                      outlineStyle={styles.noteInputOutline}
                      multiline
                    />
                    <GradientButton
                      icon="file-document-outline"
                      label="Request Letter"
                      gradient={PIAGradients.accent}
                      disabled={letterNote.trim().length === 0}
                      onPress={() =>
                        handleRequest('LETTER_OF_INTERNSHIP', letterNote.trim())
                      }
                    />
                  </>
                )}
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.historyHeading}>
              Your Requests
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.mutedText}>No document requests yet.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.historyCard} mode="outlined">
            <Card.Content>
              <View style={styles.historyRow}>
                <View style={styles.historyTextBlock}>
                  <Text variant="bodyMedium" style={styles.historyTitle}>
                    {DOCUMENT_LABELS[item.type]}
                  </Text>
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {new Date(item.requestedAt).toLocaleString()}
                  </Text>
                  {item.note ? (
                    <Text variant="bodySmall" style={styles.noteText}>
                      {item.note}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.chipRow}>{statusChip(item)}</View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  content: { padding: 16, paddingBottom: 32 },

  headerTitle: { color: PIAColors.white, fontWeight: '700' },

  optionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PIAColors.white,
  },
  optionCardContent: { paddingTop: 18 },
  optionHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  optionHeaderText: { flex: 1, marginLeft: 12 },
  optionTitle: { fontWeight: '700', letterSpacing: 0.2 },

  mutedText: { opacity: 0.6, marginTop: 4, marginBottom: 4 },

  pendingNotice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: PIAColors.offWhite,
    borderWidth: 1,
    borderColor: PIAColors.greenLight + '33',
  },
  pendingNoticeText: { color: PIAColors.greenDark },

  noteInput: { marginTop: 6, backgroundColor: PIAColors.white },
  noteInputOutline: { borderRadius: 14 },

  historyHeading: { marginTop: 6, marginBottom: 10, fontWeight: '700' },
  historyCard: {
    marginBottom: 10,
    borderRadius: 16,
    borderColor: PIAColors.ink + '14',
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyTextBlock: { flex: 1 },
  historyTitle: { fontWeight: '600' },
  noteText: { marginTop: 4, fontStyle: 'italic' },
  chipRow: { marginTop: 10, flexDirection: 'row' },

  chipQueued: { backgroundColor: PIAColors.goldLight + '55' },
  chipFailed: { backgroundColor: PIAColors.error + '22' },
  chipApproved: { backgroundColor: PIAColors.greenLight + '33' },
  chipRejected: { backgroundColor: PIAColors.error + '22' },
  chipPending: { backgroundColor: PIAColors.goldLight + '55' },
});
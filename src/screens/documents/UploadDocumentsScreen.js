import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Chip, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { OfflineBanner } from '../../components/OfflineBanner';
import { submitUploadOffline } from '../../store/slices/documentUploadsSlice';

const UPLOAD_TYPES = [
  { key: 'profile_photo', label: 'Profile Photo', icon: 'account-box-outline' },
  { key: 'cnic_doc', label: 'CNIC', icon: 'card-account-details-outline' },
  { key: 'student_id_doc', label: 'Student ID', icon: 'school-outline' },
  { key: 'resume_doc', label: 'Resume', icon: 'file-account-outline' },
];

const LABEL_BY_TYPE = Object.fromEntries(
  UPLOAD_TYPES.map((t) => [t.key, t.label]),
);

function statusChip(upload) {
  if (upload.syncStatus === 'pending') {
    return (
      <Chip icon="clock-outline" compact>
        Queued — will submit when online
      </Chip>
    );
  }
  if (upload.syncStatus === 'failed') {
    return (
      <Chip icon="alert-circle-outline" compact>
        Sync failed — will retry
      </Chip>
    );
  }
  switch (upload.status) {
    case 'approved':
      return (
        <Chip icon="check-circle-outline" compact>
          Approved
        </Chip>
      );
    case 'rejected':
      return (
        <Chip icon="close-circle-outline" compact>
          Rejected
        </Chip>
      );
    default:
      return (
        <Chip icon="progress-clock" compact>
          Awaiting review
        </Chip>
      );
  }
}

export default function UploadDocumentsScreen({ navigation }) {
  const dispatch = useDispatch();
  const uploads = useSelector((s) => s.documentUploads.uploads);

  // Real file picker (camera / gallery / document picker, per document
  // type) is deferred for this proof-of-concept, matching how face capture
  // is stubbed on the Attendance screen — this simulates a picked file with
  // a static placeholder URI so the rest of the flow (queue, sync, status)
  // is fully demonstrable.
  const handleSimulatedPick = (documentType) => {
    dispatch(submitUploadOffline(documentType, `stub-file-uri-${documentType}`));
  };

  const pendingTypesInFlight = new Set(
    uploads.filter((u) => u.status === 'pending').map((u) => u.documentType),
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Upload Documents" />
      </Appbar.Header>

      <OfflineBanner />

      <FlatList
        contentContainerStyle={styles.content}
        data={uploads}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Card style={styles.optionCard} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionHeading}>
                  Select a document to upload
                </Text>
                {UPLOAD_TYPES.map((type) => {
                  const alreadyPending = pendingTypesInFlight.has(type.key);
                  return (
                    <Button
                      key={type.key}
                      mode="outlined"
                      icon={type.icon}
                      style={styles.uploadButton}
                      disabled={alreadyPending}
                      onPress={() => handleSimulatedPick(type.key)}
                    >
                      {alreadyPending
                        ? `${type.label} — already awaiting review`
                        : `Upload ${type.label}`}
                    </Button>
                  );
                })}
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.historyHeading}>
              Your Uploads
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.mutedText}>No documents uploaded yet.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.historyCard} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium">{LABEL_BY_TYPE[item.documentType]}</Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                {new Date(item.uploadedAt).toLocaleString()}
              </Text>
              {item.decisionNote ? (
                <Text variant="bodySmall" style={styles.noteText}>
                  {item.decisionNote}
                </Text>
              ) : null}
              <View style={styles.chipRow}>{statusChip(item)}</View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  optionCard: { marginBottom: 16 },
  sectionHeading: { marginBottom: 12 },
  uploadButton: { marginBottom: 10, borderRadius: 10 },
  mutedText: { opacity: 0.6, marginTop: 4 },
  historyHeading: { marginTop: 8, marginBottom: 8 },
  historyCard: { marginBottom: 10 },
  noteText: { marginTop: 4, fontStyle: 'italic' },
  chipRow: { marginTop: 10, flexDirection: 'row' },
});

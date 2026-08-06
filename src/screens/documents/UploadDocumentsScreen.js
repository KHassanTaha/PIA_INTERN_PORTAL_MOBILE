import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, ActivityIndicator, Menu, Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientButton, GradientHeader, IconBadge } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import FilePreview from '../../components/documents/FilePreview';
import IssuedDocumentModal from '../../components/documents/IssuedDocumentModal';
import { DocumentStatus, UPLOAD_TYPE_META, UploadDocumentType } from '../../constants/documentTypes';
import { pickDocument, pickFromCamera, pickFromGallery } from '../../services/filePicker';
import {
  amendUploadThunk,
  fetchMyDocumentsThunk,
  selectActionError,
  selectActionStatus,
  selectMyUploads,
  submitUploadThunk,
} from '../../store/slices/documentsSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const STATUS_CHIP_META = {
  [DocumentStatus.PENDING]: { label: 'Submitted — awaiting review', color: PIAColors.gold, icon: 'progress-clock' },
  [DocumentStatus.IN_REVIEW]: { label: 'In review', color: PIAColors.goldLight, icon: 'eye-outline' },
  [DocumentStatus.APPROVED]: { label: 'Approved', color: PIAColors.green, icon: 'check-circle-outline' },
  [DocumentStatus.REJECTED]: { label: 'Rejected', color: PIAColors.error, icon: 'close-circle-outline' },
};

function PickerMenu({ typeMeta, onPicked, disabled, label }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  const runPick = async (pickerFn) => {
    setVisible(false);
    setError(null);
    try {
      const file = await pickerFn(typeMeta);
      if (file) onPicked(file);
    } catch (err) {
      setError(err.message || 'Could not select that file.');
    }
  };

  const trigger = (
    <GradientButton
      icon="upload-outline"
      label={label}
      gradient={PIAGradients.primary}
      disabled={disabled}
      onPress={() => {
        if (typeMeta.pickerKind === 'document') {
          runPick(pickDocument);
        } else {
          setVisible(true);
        }
      }}
    />
  );

  return (
    <View>
      {typeMeta.pickerKind === 'document' ? (
        trigger
      ) : (
        <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={trigger}>
          <Menu.Item leadingIcon="camera-outline" title="Take Photo" onPress={() => runPick(pickFromCamera)} />
          <Menu.Item leadingIcon="image-outline" title="Choose from Gallery" onPress={() => runPick(pickFromGallery)} />
          {typeMeta.pickerKind === 'either' && (
            <Menu.Item leadingIcon="file-outline" title="Choose a File" onPress={() => runPick(pickDocument)} />
          )}
        </Menu>
      )}
      {error ? <Text style={styles.pickerError}>{error}</Text> : null}
      <Text style={styles.hintText}>
        {typeMeta.acceptedExtensionsLabel} • up to {(typeMeta.maxSizeBytes / (1024 * 1024)).toFixed(0)}MB
      </Text>
    </View>
  );
}

function UploadTypeCard({ type }) {
  const dispatch = useDispatch();
  const typeMeta = UPLOAD_TYPE_META[type];
  const uploads = useSelector(selectMyUploads);
  const actionStatus = useSelector((s) => selectActionStatus(s, type));
  const actionError = useSelector((s) => selectActionError(s, type));

  const [pendingFile, setPendingFile] = useState(null); // picked, awaiting confirm/submit
  const [viewerVisible, setViewerVisible] = useState(false);

  // Latest record for this type - most recent submittedAt.
  const record = uploads
    .filter((u) => u.type === type)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const canAmend =
    record && (record.status === DocumentStatus.PENDING || record.status === DocumentStatus.REJECTED);
  const isSubmitting = actionStatus === 'loading';

  const handleConfirmSubmit = () => {
    if (!pendingFile) return;
    const action = record && canAmend
      ? amendUploadThunk({ uploadId: record.id, file: pendingFile })
      : submitUploadThunk({ type, file: pendingFile });
    dispatch(action);
    setPendingFile(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <IconBadge icon={typeMeta.icon} tint={PIAColors.greenLight + '26'} color={PIAColors.green} />
        <View style={styles.cardHeaderText}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {typeMeta.label}
          </Text>
        </View>
      </View>

      {/* Pre-submit preview - the file is picked but NOT yet sent. This
          is the "view before pressing submit" requirement: nothing is
          dispatched to submitUploadThunk until Confirm is pressed. */}
      {pendingFile ? (
        <View style={styles.previewBlock}>
          <FilePreview
            fileUri={pendingFile.uri}
            fileName={pendingFile.name}
            fileMimeType={pendingFile.type}
            fileSize={pendingFile.size}
            size="large"
          />
          <View style={styles.previewActions}>
            <TouchableRipple onPress={() => setPendingFile(null)} style={styles.previewCancelButton}>
              <Text style={styles.previewCancelText}>Change</Text>
            </TouchableRipple>
            <View style={styles.previewSubmitWrapper}>
              <GradientButton
                icon="check"
                label={isSubmitting ? 'Submitting…' : 'Confirm & Submit'}
                gradient={PIAGradients.primary}
                disabled={isSubmitting}
                onPress={handleConfirmSubmit}
              />
            </View>
          </View>
        </View>
      ) : record ? (
        <View style={styles.recordBlock}>
          <View style={styles.recordRow}>
            <TouchableRipple onPress={() => setViewerVisible(true)}>
              <FilePreview
                fileUri={record.fileUri}
                fileName={record.fileName}
                fileMimeType={record.fileMimeType}
                size="thumbnail"
              />
            </TouchableRipple>
            <View style={styles.recordTextBlock}>
              <Text variant="bodySmall" style={styles.recordFileName} numberOfLines={1}>
                {record.fileName}
              </Text>
              <StatusChip
                label={STATUS_CHIP_META[record.status].label}
                icon={STATUS_CHIP_META[record.status].icon}
                color={STATUS_CHIP_META[record.status].color}
              />
            </View>
          </View>

          {record.status === DocumentStatus.REJECTED && record.decisionNote ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{record.decisionNote}</Text>
            </View>
          ) : null}

          {actionError ? <Text style={styles.pickerError}>{actionError}</Text> : null}

          <View style={styles.recordActionsRow}>
            <TouchableRipple onPress={() => setViewerVisible(true)} style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableRipple>
            {canAmend && (
              <PickerMenu
                typeMeta={typeMeta}
                onPicked={setPendingFile}
                disabled={isSubmitting}
                label={isSubmitting ? 'Submitting…' : 'Amend'}
              />
            )}
          </View>
        </View>
      ) : (
        <>
          {actionError ? <Text style={styles.pickerError}>{actionError}</Text> : null}
          <PickerMenu
            typeMeta={typeMeta}
            onPicked={setPendingFile}
            disabled={isSubmitting}
            label={isSubmitting ? 'Submitting…' : `Upload ${typeMeta.label}`}
          />
        </>
      )}

      {record && (
        <IssuedDocumentModal
          visible={viewerVisible}
          onDismiss={() => setViewerVisible(false)}
          documentLabel={typeMeta.label}
          file={{ uri: record.fileUri, name: record.fileName, mimeType: record.fileMimeType }}
        />
      )}
    </View>
  );
}

export default function UploadDocumentsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyDocumentsThunk());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Upload Documents" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.values(UploadDocumentType).map((type) => (
          <UploadTypeCard key={type} type={type} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 32 },

  card: { backgroundColor: PIAColors.white, borderRadius: 20, padding: 16, marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { marginLeft: 12 },
  cardTitle: { fontWeight: '700' },

  hintText: { fontSize: 11, opacity: 0.55, marginTop: 8 },
  pickerError: { color: PIAColors.error, fontSize: 12, marginTop: 6 },

  previewBlock: { alignItems: 'center' },
  previewActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, width: '100%' },
  previewCancelButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  previewCancelText: { color: PIAColors.ink, opacity: 0.6, fontWeight: '600' },
  previewSubmitWrapper: { flex: 1, marginLeft: 8 },

  recordBlock: {},
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  recordTextBlock: { marginLeft: 12, flex: 1 },
  recordFileName: { fontWeight: '600', marginBottom: 6 },

  noteBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: PIAColors.error + '14',
  },
  noteText: { color: PIAColors.error, fontSize: 12 },

  recordActionsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, gap: 10 },
  viewButton: {
    borderWidth: 1,
    borderColor: PIAColors.green + '55',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  viewButtonText: { color: PIAColors.green, fontWeight: '700' },
});
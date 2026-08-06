import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Menu, Text, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { GradientAccentBar, GradientButton, GradientHeader, IconBadge } from '../../components/Gradients';
import ScreenBackground from '../../components/ScreenBackground';
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
  withdrawUploadThunk,
} from '../../store/slices/documentsSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const STATUS_CHIP_META = {
  [DocumentStatus.PENDING]: { label: 'Submitted — awaiting review', color: PIAColors.gold, icon: 'progress-clock' },
  [DocumentStatus.IN_REVIEW]: { label: 'In review', color: PIAColors.goldLight, icon: 'eye-outline' },
  [DocumentStatus.APPROVED]: { label: 'Approved', color: PIAColors.green, icon: 'check-circle-outline' },
  [DocumentStatus.REJECTED]: { label: 'Rejected', color: PIAColors.error, icon: 'close-circle-outline' },
};

const ACCENTS = {
  [UploadDocumentType.PROFILE_PHOTO]: PIAGradients.primary,
  [UploadDocumentType.CNIC]: PIAGradients.accent,
  [UploadDocumentType.STUDENT_ID]: PIAGradients.primaryDark,
  [UploadDocumentType.RESUME]: PIAGradients.accent,
};

// Picker actions (camera/gallery/file) run async work before anything
// visibly changes on screen (permission dialogs, the camera app opening)
// - pickerLoading gives immediate visual feedback the tap registered,
// addressing "no feedback when Take Photo is pressed."
function PickerMenu({ typeMeta, onPicked, disabled, label }) {
  const [visible, setVisible] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [error, setError] = useState(null);

  const runPick = async (pickerFn) => {
    setVisible(false);
    setError(null);
    setPickerLoading(true);
    try {
      const file = await pickerFn(typeMeta);
      if (file) onPicked(file);
    } catch (err) {
      setError(err.message || 'Could not select that file.');
    } finally {
      setPickerLoading(false);
    }
  };

  const trigger = (
    <GradientButton
      icon="upload-outline"
      label={label}
      gradient={PIAGradients.primary}
      disabled={disabled}
      loading={pickerLoading}
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

  const [pendingFile, setPendingFile] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const record = uploads
    .filter((u) => u.type === type)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const canAmend = record && (record.status === DocumentStatus.PENDING || record.status === DocumentStatus.REJECTED);
  const canWithdraw = record && (record.status === DocumentStatus.PENDING || record.status === DocumentStatus.IN_REVIEW);
  const isSubmitting = actionStatus === 'loading';

  const handleConfirmSubmit = () => {
    if (!pendingFile) return;
    const action = record && canAmend
      ? amendUploadThunk({ uploadId: record.id, file: pendingFile })
      : submitUploadThunk({ type, file: pendingFile });
    dispatch(action);
    setPendingFile(null);
  };

  const handleWithdraw = () => record && dispatch(withdrawUploadThunk(record.id));

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
          </View>
        </View>

        {pendingFile ? (
          <View style={styles.previewBlock}>
            <FilePreview
              fileUri={pendingFile.uri}
              fileName={pendingFile.name}
              fileMimeType={pendingFile.type}
              fileSize={pendingFile.size}
              size="large"
            />
            {/* Both buttons in this row are the SAME height/no implicit
                margin now (see Gradients.js fix), so they align. */}
            <View style={styles.previewActionsRow}>
              <TouchableRipple
                onPress={() => setPendingFile(null)}
                rippleColor={PIAColors.ink + '22'}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Change</Text>
              </TouchableRipple>
              <View style={styles.primaryButtonFlex}>
                <GradientButton
                  icon="check"
                  label={isSubmitting ? 'Submitting…' : 'Confirm & Submit'}
                  gradient={ACCENTS[type]}
                  loading={isSubmitting}
                  onPress={handleConfirmSubmit}
                />
              </View>
            </View>
          </View>
        ) : record ? (
          <View style={styles.recordBlock}>
            <View style={styles.recordRow}>
              <TouchableRipple
                onPress={() => setViewerVisible(true)}
                rippleColor={PIAColors.ink + '22'}
                style={styles.thumbnailWrapper}
              >
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

            {/* Same row pattern as the pre-submit row above - fixed-
                height buttons, no baked-in offsets, so View/Amend/
                Withdraw all sit on the same baseline regardless of how
                many are shown. */}
            <View style={styles.recordActionsRow}>
              <TouchableRipple
                onPress={() => setViewerVisible(true)}
                rippleColor={PIAColors.ink + '22'}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>View</Text>
              </TouchableRipple>

              {canAmend && (
                <View style={styles.primaryButtonFlex}>
                  <PickerMenu
                    typeMeta={typeMeta}
                    onPicked={setPendingFile}
                    disabled={isSubmitting}
                    label={isSubmitting ? 'Submitting…' : 'Amend'}
                  />
                </View>
              )}

              {canWithdraw && (
                <TouchableRipple
                  onPress={handleWithdraw}
                  rippleColor={PIAColors.error + '22'}
                  style={styles.withdrawButton}
                >
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableRipple>
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
      </View>

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
    <ScreenBackground>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Upload Documents" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.values(UploadDocumentType).map((type) => (
          <UploadTypeCard key={type} type={type} />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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

  hintText: { fontSize: 11, opacity: 0.55, marginTop: 8 },
  pickerError: { color: PIAColors.error, fontSize: 12, marginTop: 6, marginBottom: 6 },

  previewBlock: { alignItems: 'center', marginTop: 14 },
  previewActionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, width: '100%' },

  recordBlock: { marginTop: 14 },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  thumbnailWrapper: { borderRadius: 12, overflow: 'hidden' },
  recordTextBlock: { marginLeft: 12, flex: 1 },
  recordFileName: { fontWeight: '600', marginBottom: 6 },

  noteBox: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: PIAColors.error + '14' },
  noteText: { color: PIAColors.error, fontSize: 12 },

  // Shared row layout for both the pre-submit and post-submit action
  // rows: every button here is height-consistent (secondaryButton and
  // GradientButton both render at the same vertical padding), so they
  // sit on one baseline instead of the earlier misalignment.
  recordActionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  primaryButtonFlex: { flex: 1 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: PIAColors.green + '55',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: PIAColors.green, fontWeight: '700' },
  withdrawButton: {
    borderWidth: 1,
    borderColor: PIAColors.error + '55',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: { color: PIAColors.error, fontWeight: '700', fontSize: 12 },
});
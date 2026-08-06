/**
 * components/documents/IssuedDocumentModal.js
 *
 * Full-screen modal for viewing/downloading an approved request's
 * generated file (ID card, gate pass, letter of internship).
 *
 * SCOPE NOTE, deliberately not silently expanded: this does NOT render
 * an actual in-app PDF preview - there's no PDF-rendering dependency in
 * the project (react-native-pdf or react-native-webview would both work,
 * neither is installed). Given how many native dependencies this project
 * has already picked up this session, I didn't want to add a fourth
 * without you weighing in. Right now this shows a file icon + name/size
 * and focuses on a REAL, working Download action (via react-native-fs,
 * already installed) - the person gets the actual file on their device
 * either way, just not a preview-before-downloading. Say the word if you
 * want a real in-app preview added and I'll wire up one of those two
 * libraries.
 */

import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Modal, Portal, Snackbar, Text } from 'react-native-paper';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientButton } from '../Gradients';
import FilePreview from './FilePreview';
import { PIAColors, PIAGradients } from '../../theme/theme';

async function saveDataUriToDevice(dataUri, fileName) {
  const match = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Unexpected file format.');
  const [, , base64Data] = match;

  const targetDir = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
  const targetPath = `${targetDir}/${fileName}`;
  await RNFS.writeFile(targetPath, base64Data, 'base64');
  return targetPath;
}

/**
 * @param {{
 *   visible: boolean,
 *   onDismiss: () => void,
 *   documentLabel: string,
 *   file: { uri: string, name: string, mimeType: string } | null,
 *   loading?: boolean,
 *   error?: string | null,
 * }} props
 */
export default function IssuedDocumentModal({ visible, onDismiss, documentLabel, file, loading, error }) {
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'done' | 'failed'
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  const handleDownload = async () => {
    if (!file) return;
    setDownloadState('downloading');
    try {
      let savedPath;
      if (file.uri.startsWith('data:')) {
        savedPath = await saveDataUriToDevice(file.uri, file.name);
      } else {
        const targetDir = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
        const targetPath = `${targetDir}/${file.name}`;
        await RNFS.downloadFile({ fromUrl: file.uri, toFile: targetPath }).promise;
        savedPath = targetPath;
      }
      setDownloadState('done');
      setSnackbarMessage(
        Platform.OS === 'android' ? 'Saved to your Downloads folder.' : `Saved to ${savedPath}`,
      );
    } catch (err) {
      setDownloadState('failed');
      setSnackbarMessage("Couldn't download the file. Please try again.");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {documentLabel}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <Text style={styles.mutedText}>Loading document…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Icon name="alert-circle-outline" size={40} color={PIAColors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : file ? (
          <>
            <View style={styles.previewArea}>
              <FilePreview
                fileUri={file.uri}
                fileName={file.name}
                fileMimeType={file.mimeType}
                size="large"
              />
            </View>

            <GradientButton
              icon="download-outline"
              label={
                downloadState === 'downloading'
                  ? 'Downloading…'
                  : downloadState === 'done'
                  ? 'Downloaded'
                  : 'Download'
              }
              gradient={PIAGradients.primary}
              disabled={downloadState === 'downloading'}
              onPress={handleDownload}
            />
          </>
        ) : null}
      </Modal>

      <Snackbar visible={Boolean(snackbarMessage)} onDismiss={() => setSnackbarMessage(null)} duration={3500}>
        {snackbarMessage}
      </Snackbar>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: PIAColors.white,
    margin: 24,
    borderRadius: 20,
    padding: 20,
  },
  header: { marginBottom: 16 },
  title: { fontWeight: '700' },
  centered: { alignItems: 'center', paddingVertical: 24 },
  mutedText: { opacity: 0.6 },
  errorText: { color: PIAColors.error, textAlign: 'center', marginTop: 12 },
  previewArea: { alignItems: 'center', marginBottom: 20 },
});
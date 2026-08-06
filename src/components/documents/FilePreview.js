/**
 * components/documents/FilePreview.js
 *
 * One component for every "show a file" moment in the document feature:
 * the pre-submit preview, each row in upload history, and the admin
 * review detail screen. Images render as an actual thumbnail; anything
 * else (PDF, Word doc) renders as a file-type icon + name + size, since
 * there's no in-app document renderer for non-images (see the note in
 * IssuedDocumentModal.js about not adding a PDF-viewer dependency yet).
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { formatBytes } from '../../utils/fileValidation';
import { PIAColors } from '../../theme/theme';

const isImage = (mimeType) => mimeType?.startsWith('image/');

/**
 * @param {{
 *   fileUri: string,
 *   fileName: string,
 *   fileMimeType: string,
 *   fileSize?: number,
 *   size?: 'thumbnail'|'large',
 * }} props
 */
export default function FilePreview({ fileUri, fileName, fileMimeType, fileSize, size = 'thumbnail' }) {
  const dimension = size === 'large' ? 180 : 48;

  if (isImage(fileMimeType)) {
    return (
      <Image
        source={{ uri: fileUri }}
        style={[styles.image, { width: dimension, height: dimension }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.fileBox, { width: size === 'large' ? '100%' : dimension, height: dimension }]}>
      <Icon name="file-document-outline" size={size === 'large' ? 40 : 22} color={PIAColors.green} />
      {size === 'large' && (
        <>
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>
          {fileSize ? <Text style={styles.fileSize}>{formatBytes(fileSize)}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { borderRadius: 12, backgroundColor: PIAColors.ink + '0D' },
  fileBox: {
    borderRadius: 12,
    backgroundColor: PIAColors.greenLight + '14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fileName: { fontSize: 12, fontWeight: '600', marginTop: 8, maxWidth: '90%' },
  fileSize: { fontSize: 10, opacity: 0.6, marginTop: 2 },
});
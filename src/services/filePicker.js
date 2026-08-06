/**
 * services/filePicker.js
 *
 * Wraps react-native-image-picker (camera/gallery) and
 * @react-native-documents/picker (arbitrary files) behind one normalized
 * interface, so screen code never touches either library directly and
 * never needs to branch on which one was used.
 *
 * NOTE: originally built against react-native-document-picker, which is
 * now deprecated/archived and does not compile on RN 0.78+ (relies on a
 * bridge class, GuardedResultAsyncTask, that Facebook removed) - this
 * project is on RN 0.86.0, so @react-native-documents/picker (the
 * maintainer's own successor package) is used instead. The API shape
 * differs: picking and "keep a local copy" are two separate calls here
 * (pick() + keepLocalCopy()), not one call with a copyTo option.
 *
 * Every picker function here returns null on cancellation (never
 * throws for "the person just closed the picker") and throws only for
 * genuine errors (permission denial, picker crash) or a failed
 * validateFile() check - callers should wrap calls in try/catch and
 * treat a null return as a silent no-op, not an error state.
 */

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { errorCodes, isErrorWithCode, keepLocalCopy, pick } from '@react-native-documents/picker';

import { validateFile } from '../utils/fileValidation';

/**
 * @typedef {Object} PickedFile
 * @property {string} uri
 * @property {string} name
 * @property {string} type - MIME type
 * @property {number} size - bytes
 */

function normalizeImagePickerAsset(asset) {
  return {
    uri: asset.uri,
    name: asset.fileName || `photo-${Date.now()}.jpg`,
    type: asset.type || 'image/jpeg',
    size: asset.fileSize || 0,
  };
}

function normalizeDocumentPickerResult(pickedFile, localCopy) {
  return {
    uri: localCopy.localUri,
    name: pickedFile.name,
    type: pickedFile.type,
    size: pickedFile.size || 0,
  };
}

/**
 * @param {import('../constants/documentTypes').UPLOAD_TYPE_META[string]} typeMeta
 * @returns {Promise<PickedFile|null>}
 */
export async function pickFromCamera(typeMeta) {
  const result = await launchCamera({ mediaType: 'photo', quality: 0.85, saveToPhotos: false });
  if (result.didCancel || !result.assets?.length) return null;
  if (result.errorCode) throw new Error(result.errorMessage || 'Camera error.');

  const file = normalizeImagePickerAsset(result.assets[0]);
  const { valid, error } = validateFile(file, typeMeta);
  if (!valid) throw new Error(error);
  return file;
}

/**
 * @param {import('../constants/documentTypes').UPLOAD_TYPE_META[string]} typeMeta
 * @returns {Promise<PickedFile|null>}
 */
export async function pickFromGallery(typeMeta) {
  const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85, selectionLimit: 1 });
  if (result.didCancel || !result.assets?.length) return null;
  if (result.errorCode) throw new Error(result.errorMessage || 'Could not open photo library.');

  const file = normalizeImagePickerAsset(result.assets[0]);
  const { valid, error } = validateFile(file, typeMeta);
  if (!valid) throw new Error(error);
  return file;
}

/**
 * @param {import('../constants/documentTypes').UPLOAD_TYPE_META[string]} typeMeta
 * @returns {Promise<PickedFile|null>}
 */
export async function pickDocument(typeMeta) {
  try {
    const [pickedFile] = await pick({ type: typeMeta.acceptedMimeTypes });

    // pick() returns a content://(Android)/file://(iOS) uri to the
    // original location, not a stable local copy - keepLocalCopy() is a
    // separate required step to get something we can reliably preview/
    // upload from later. This two-step shape (pick, then keepLocalCopy)
    // replaces the old package's single-call copyTo option, which
    // doesn't exist as a pick() parameter in this library.
    const [copyResult] = await keepLocalCopy({
      files: [{ uri: pickedFile.uri, fileName: pickedFile.name }],
      destination: 'cachesDirectory',
    });

    if (copyResult.status === 'error') {
      throw new Error(copyResult.copyError || 'Could not prepare that file.');
    }

    const file = normalizeDocumentPickerResult(pickedFile, copyResult);
    const { valid, error } = validateFile(file, typeMeta);
    if (!valid) throw new Error(error);
    return file;
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return null;
    throw err;
  }
}
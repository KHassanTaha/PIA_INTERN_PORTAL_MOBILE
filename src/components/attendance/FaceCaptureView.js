/**
 * components/attendance/FaceCaptureView.js
 *
 * Camera UI for the face check-in step: live preview, face-guide overlay,
 * shutter button, and the capture -> compare -> discard flow. The actual
 * comparison logic lives in services/faceRecognition.js (stub) - this
 * component only orchestrates calling it and enforces that the captured
 * file is deleted afterward regardless of outcome.
 *
 * Renders inside AttendanceScreen's check-in Dialog during the CAPTURING
 * stage - see AttendanceScreen.js.
 */

import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientButton } from '../Gradients';
import { compareLiveCapture, discardCapture } from '../../services/faceRecognition';
import { useReferenceFace } from '../../hooks/useReferenceFace';
import { PIAColors, PIAGradients } from '../../theme/theme';

// Local sub-stage machine, scoped to this component - distinct from
// AttendanceScreen's own Stage enum, which only needs to know whether
// this whole component is still "in progress" or has produced a final
// MATCHED / NOT_MATCHED result.
const CaptureStage = {
  LOADING_REFERENCE: 'LOADING_REFERENCE',
  REFERENCE_ERROR: 'REFERENCE_ERROR',
  REQUESTING_PERMISSION: 'REQUESTING_PERMISSION',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NO_DEVICE: 'NO_DEVICE',
  READY: 'READY', // live preview, waiting for shutter press
  COMPARING: 'COMPARING',
  RESULT: 'RESULT', // matched or not - see matchResult
};

/**
 * @param {{
 *   onMatched: (result: import('../../services/faceRecognition').FaceMatchResult) => void,
 *   onCancel: () => void,
 * }} props
 * onMatched fires once, only on a successful match - AttendanceScreen
 * moves on to submitting the check-in from there. A failed match keeps
 * the user on this component so they can retry without re-running the
 * geofence check that happens before this component even mounts.
 */
export default function FaceCaptureView({ onMatched, onCancel }) {
  const camera = useRef(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const { status: referenceStatus, referenceHandle, error: referenceError, reload: reloadReference } =
    useReferenceFace();

  const [stage, setStage] = useState(CaptureStage.READY);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState(null);

  const effectiveStage = (() => {
    if (referenceStatus === 'LOADING') return CaptureStage.LOADING_REFERENCE;
    if (referenceStatus === 'ERROR') return CaptureStage.REFERENCE_ERROR;
    if (!hasPermission) return CaptureStage.REQUESTING_PERMISSION;
    if (!device) return CaptureStage.NO_DEVICE;
    return stage;
  })();

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) setStage(CaptureStage.PERMISSION_DENIED);
  }, [requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!camera.current) return;

    let livePhotoUri = null;
    setStage(CaptureStage.COMPARING);
    setMatchError(null);

    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      livePhotoUri = `file://${photo.path}`;

      const result = await compareLiveCapture(livePhotoUri, referenceHandle);

      setMatchResult(result);
      setStage(CaptureStage.RESULT);

      if (result.matched) {
        onMatched(result);
      }
    } catch (err) {
      setMatchError(err);
      setMatchResult(null);
      setStage(CaptureStage.RESULT);
    } finally {
      // Runs on every exit path — success, no-match, and error — per the
      // no-persistence contract in services/faceRecognition.js.
      await discardCapture(livePhotoUri);
    }
  }, [referenceHandle, onMatched]);

  const handleRetry = useCallback(() => {
    setMatchResult(null);
    setMatchError(null);
    setStage(CaptureStage.READY);
  }, []);

  switch (effectiveStage) {
    case CaptureStage.LOADING_REFERENCE:
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PIAColors.green} />
          <Text style={styles.mutedText}>Loading your reference photo…</Text>
        </View>
      );

    case CaptureStage.REFERENCE_ERROR:
      return (
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={48} color={PIAColors.error} />
          <Text style={styles.centerText}>
            Couldn't load your reference photo{referenceError ? `: ${referenceError.message}` : '.'}
          </Text>
          <GradientButton
            icon="refresh"
            label="Retry"
            gradient={PIAGradients.primary}
            onPress={reloadReference}
          />
        </View>
      );

    case CaptureStage.REQUESTING_PERMISSION:
      return (
        <View style={styles.centered}>
          <Icon name="camera-outline" size={48} color={PIAColors.green} />
          <Text style={styles.centerText}>
            Camera access is needed to check in with face recognition.
          </Text>
          <GradientButton
            icon="camera-outline"
            label="Allow Camera Access"
            gradient={PIAGradients.primary}
            onPress={handleRequestPermission}
          />
        </View>
      );

    case CaptureStage.PERMISSION_DENIED:
      return (
        <View style={styles.centered}>
          <Icon name="camera-off-outline" size={48} color={PIAColors.error} />
          <Text style={styles.centerText}>
            Camera permission was denied. Please enable it in your device
            settings to check in.
          </Text>
        </View>
      );

    case CaptureStage.NO_DEVICE:
      return (
        <View style={styles.centered}>
          <Icon name="camera-off-outline" size={48} color={PIAColors.error} />
          <Text style={styles.centerText}>No front camera was found on this device.</Text>
        </View>
      );

    case CaptureStage.COMPARING:
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PIAColors.green} />
          <Text style={styles.mutedText}>Checking it's you…</Text>
        </View>
      );

    case CaptureStage.RESULT:
      if (matchError) {
        return (
          <View style={styles.centered}>
            <Icon name="alert-circle-outline" size={48} color={PIAColors.error} />
            <Text style={styles.centerText}>Something went wrong: {matchError.message}</Text>
            <GradientButton
              icon="refresh"
              label="Try Again"
              gradient={PIAGradients.primary}
              onPress={handleRetry}
            />
          </View>
        );
      }
      // matched===true briefly renders here before the parent (via
      // onMatched, already fired above) swaps this component out — kept
      // simple rather than adding a success animation for now.
      if (matchResult && !matchResult.matched) {
        return (
          <View style={styles.centered}>
            <Icon name="account-alert-outline" size={48} color={PIAColors.error} />
            <Text style={styles.centerText}>
              That didn't match your profile
              {matchResult.reason === 'LOW_QUALITY_CAPTURE'
                ? ' — try again with better lighting.'
                : '.'}
            </Text>
            {__DEV__ && (
              <Text style={styles.debugText}>
                confidence: {matchResult.confidence.toFixed(2)}
              </Text>
            )}
            <GradientButton
              icon="refresh"
              label="Try Again"
              gradient={PIAGradients.primary}
              onPress={handleRetry}
            />
          </View>
        );
      }
      return null;

    case CaptureStage.READY:
    default:
      return (
        <View style={styles.previewContainer}>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            photo
          />

          {/* Face guide overlay — purely visual, does not itself detect
              anything; a real-time in-frame indicator would need a
              frame processor wired to a face-detection model, which is
              a further step beyond this stub. */}
          <View pointerEvents="none" style={styles.overlay}>
            <View style={styles.faceOval} />
            <Text style={styles.overlayHint}>Position your face within the oval</Text>
          </View>

          <View style={styles.shutterRow}>
            <TouchableRipple onPress={onCancel} style={styles.cancelButton} borderless>
              <Icon name="close" size={24} color={PIAColors.white} />
            </TouchableRipple>

            <TouchableRipple onPress={handleCapture} style={styles.shutterButton} borderless>
              <View style={styles.shutterInner} />
            </TouchableRipple>

            {/* Spacer to visually balance the cancel button on the
                opposite side, keeping the shutter centered. */}
            <View style={styles.cancelButtonSpacer} />
          </View>
        </View>
      );
  }
}

const OVAL_WIDTH = 220;
const OVAL_HEIGHT = 280;

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  mutedText: { opacity: 0.6, marginTop: 12, textAlign: 'center' },
  centerText: { textAlign: 'center', marginTop: 12, marginBottom: 16 },
  debugText: { opacity: 0.5, fontSize: 12, marginBottom: 12 },

  previewContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PIAColors.ink,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    borderColor: PIAColors.white + 'CC',
  },
  overlayHint: {
    position: 'absolute',
    bottom: 84,
    color: PIAColors.white,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  shutterRow: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: PIAColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PIAColors.white,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PIAColors.ink + '66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonSpacer: { width: 44, height: 44 },
});
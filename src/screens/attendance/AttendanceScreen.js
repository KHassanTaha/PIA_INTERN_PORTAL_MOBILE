import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { OfflineBanner } from '../../components/OfflineBanner';
import FaceCaptureView from '../../components/attendance/FaceCaptureView';
import { checkInOffline } from '../../store/slices/attendanceSlice';
import { checkWithinGeofence } from '../../services/location';

// PLACEHOLDER — no live backend yet, so there's no real per-department
// coordinate to check against. Replace with the intern's actual assigned
// department's latitude/longitude (from GET /interns/me) once that's wired.
// These are arbitrary coordinates for demo purposes only.
const PLACEHOLDER_DEPARTMENT_LOCATION = {
  latitude: 24.894970,
  longitude: 67.152232,
};

const todayIso = () => new Date().toISOString().slice(0, 10);

// Distinct check-in flow states — drives which dialog content renders.
const Stage = {
  IDLE: 'IDLE',
  CHECKING_LOCATION: 'CHECKING_LOCATION',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  CAPTURING: 'CAPTURING',
  FINALIZING: 'FINALIZING',
  RECHECK_FAILED: 'RECHECK_FAILED',
};

function statusChip(syncStatus) {
  switch (syncStatus) {
    case 'pending':
      return (
        <Chip icon="clock-outline" compact>
          Pending sync
        </Chip>
      );
    case 'synced':
      return (
        <Chip icon="check-circle-outline" compact>
          Present
        </Chip>
      );
    case 'failed':
      return (
        <Chip icon="alert-circle-outline" compact>
          Sync failed — will retry
        </Chip>
      );
    default:
      return null;
  }
}

export default function AttendanceScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const records = useSelector((s) => s.attendance.records);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [stage, setStage] = useState(Stage.IDLE);
  const [lastDistance, setLastDistance] = useState(null);

  const alreadyCheckedInToday = records.some((r) => r.date === todayIso());

  const beginCheckIn = async () => {
    setDialogVisible(true);
    setStage(Stage.CHECKING_LOCATION);

    // FIRST geofence check — before the camera ever opens. If the intern
    // is nowhere near their department, there's no point spending a face
    // capture on it.
    const preCheck = await checkWithinGeofence(
      PLACEHOLDER_DEPARTMENT_LOCATION.latitude,
      PLACEHOLDER_DEPARTMENT_LOCATION.longitude,
    );

    if (preCheck.reason === 'PERMISSION_DENIED') {
      setStage(Stage.PERMISSION_DENIED);
      return;
    }
    if (!preCheck.allowed) {
      setLastDistance(preCheck.distance);
      setStage(
        preCheck.reason === 'OUTSIDE_GEOFENCE'
          ? Stage.OUT_OF_RANGE
          : Stage.POSITION_UNAVAILABLE,
      );
      return;
    }

    setStage(Stage.CAPTURING);
  };

  // Fired by FaceCaptureView only on a successful match — a failed match
  // keeps the user inside FaceCaptureView to retry without re-running the
  // geofence check above, so this only ever runs once per check-in.
  const handleFaceMatched = async (matchResult) => {
    setStage(Stage.FINALIZING);

    // SECOND geofence check — right at the moment of a successful face
    // match, not reused from the pre-camera check above. Catches the case
    // where the first reading was spoofed to pass, then reality
    // reasserts itself (or the intern physically moved out of range
    // between the two checks).
    const recheck = await checkWithinGeofence(
      PLACEHOLDER_DEPARTMENT_LOCATION.latitude,
      PLACEHOLDER_DEPARTMENT_LOCATION.longitude,
    );

    if (!recheck.allowed) {
      setLastDistance(recheck.distance);
      setStage(Stage.RECHECK_FAILED);
      return;
    }

    // No facePhotoUri here, deliberately — the live capture was already
    // discarded inside FaceCaptureView per the no-persistence contract in
    // services/faceRecognition.js. Only the match outcome and location
    // travel with the check-in.
    dispatch(
      checkInOffline({
        faceMatchConfidence: matchResult.confidence,
        latitude: recheck.position.latitude,
        longitude: recheck.position.longitude,
        distanceMeters: recheck.distance,
      }),
    );

    setDialogVisible(false);
    setStage(Stage.IDLE);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setStage(Stage.IDLE);
  };

  const renderDialogContent = () => {
    switch (stage) {
      case Stage.CHECKING_LOCATION:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="crosshairs-gps" size={48} iconColor={theme.colors.primary} />
            <Text style={styles.mutedText}>Checking your location…</Text>
          </View>
        );

      case Stage.PERMISSION_DENIED:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="map-marker-off-outline" size={48} iconColor={theme.colors.error} />
            <Text style={styles.centerText}>
              Location permission is required to check in. Please grant it in your
              device settings and try again.
            </Text>
          </View>
        );

      case Stage.OUT_OF_RANGE:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="map-marker-alert-outline" size={48} iconColor={theme.colors.error} />
            <Text style={styles.centerText}>
              You're about {Math.round(lastDistance)}m from your department. Move
              closer and try again.
            </Text>
          </View>
        );

      case Stage.POSITION_UNAVAILABLE:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="crosshairs-question" size={48} iconColor={theme.colors.error} />
            <Text style={styles.centerText}>
              Couldn't determine your location. Check that GPS is enabled and try
              again.
            </Text>
          </View>
        );

      case Stage.RECHECK_FAILED:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="map-marker-alert-outline" size={48} iconColor={theme.colors.error} />
            <Text style={styles.centerText}>
              Your location changed unexpectedly during capture and is no longer
              within range (about {Math.round(lastDistance)}m away). Please try
              checking in again.
            </Text>
          </View>
        );

      case Stage.FINALIZING:
        return (
          <View style={styles.captureArea}>
            <IconButton icon="check-decagram-outline" size={48} iconColor={theme.colors.primary} />
            <Text style={styles.mutedText}>Confirming your location…</Text>
          </View>
        );

      case Stage.CAPTURING:
      default:
        return <FaceCaptureView onMatched={handleFaceMatched} onCancel={closeDialog} />;
    }
  };

  const canRetryLocation = [
    Stage.OUT_OF_RANGE,
    Stage.POSITION_UNAVAILABLE,
    Stage.RECHECK_FAILED,
  ].includes(stage);

  // FaceCaptureView has its own Cancel button built into the camera UI,
  // so the dialog's own action row is hidden while it's showing — avoids
  // a confusing double-cancel-button situation.
  const showDialogActions = stage !== Stage.CAPTURING;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Attendance" />
      </Appbar.Header>

      <OfflineBanner />

      <View style={styles.content}>
        <Card style={styles.statusCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">Today</Text>
            <Text variant="bodyMedium" style={styles.mutedText}>
              {new Date().toDateString()}
            </Text>

            {alreadyCheckedInToday ? (
              <View style={styles.checkedInRow}>
                <IconButton icon="check-decagram" size={28} iconColor={theme.colors.primary} />
                <Text variant="bodyLarge">You're checked in for today.</Text>
              </View>
            ) : (
              <Button
                mode="contained"
                icon="face-recognition"
                style={styles.checkInButton}
                contentStyle={styles.checkInButtonContent}
                onPress={beginCheckIn}
              >
                Check In
              </Button>
            )}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.historyHeading}>
          History
        </Text>
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <Text style={styles.mutedText}>No attendance records yet.</Text>
          }
          renderItem={({ item }) => (
            <Card style={styles.historyCard} mode="outlined">
              <Card.Content style={styles.historyCardContent}>
                <View>
                  <Text variant="bodyMedium">{item.date}</Text>
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {new Date(item.checkInTime).toLocaleTimeString()}
                  </Text>
                </View>
                {statusChip(item.syncStatus)}
              </Card.Content>
            </Card>
          )}
        />
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Face Check-In</Dialog.Title>
          <Dialog.Content>{renderDialogContent()}</Dialog.Content>
          {showDialogActions && (
            <Dialog.Actions>
              <Button onPress={closeDialog}>Close</Button>
              {canRetryLocation && <Button onPress={beginCheckIn}>Retry</Button>}
            </Dialog.Actions>
          )}
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  statusCard: { marginBottom: 20 },
  mutedText: { opacity: 0.6 },
  centerText: { textAlign: 'center', marginTop: 4 },
  checkedInRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkInButton: { marginTop: 16, borderRadius: 10 },
  checkInButtonContent: { paddingVertical: 6 },
  historyHeading: { marginBottom: 8 },
  historyList: { paddingBottom: 24 },
  historyCard: { marginBottom: 10 },
  historyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureArea: { alignItems: 'center', paddingVertical: 12 },
});
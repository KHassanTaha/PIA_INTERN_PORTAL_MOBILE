import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import { GradientButton, GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import FilePreview from '../../components/documents/FilePreview';
import { REQUEST_TYPE_META, UPLOAD_TYPE_META } from '../../constants/documentTypes';
import { decideThunk, markInReviewThunk, selectIsDeciding, selectQueue } from '../../store/slices/documentsAdminSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

export default function DocumentReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { id, category } = route.params;

  const queue = useSelector(selectQueue);
  const isDeciding = useSelector((s) => selectIsDeciding(s, id));

  const item = queue.find((q) => q.id === id && q.category === category);
  const typeMeta = item ? (category === 'upload' ? UPLOAD_TYPE_META[item.type] : REQUEST_TYPE_META[item.type]) : null;

  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState(null);

  // Mark in-review the moment the reviewer opens this item, so the queue
  // reflects "someone's looking at this" - see markInReviewThunk's own
  // comment for why this state exists.
  useEffect(() => {
    if (item) dispatch(markInReviewThunk({ id, category }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!item) {
    // Already decided (removed from the queue) or navigated to directly
    // with a stale id - rather than crash on undefined fields below.
    return (
      <View style={styles.container}>
        <GradientHeader gradient={PIAGradients.primaryDark}>
          <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
          <Appbar.Content title="Review" titleStyle={styles.headerTitle} />
        </GradientHeader>
        <View style={styles.centered}>
          <Text style={styles.mutedText}>This item has already been reviewed.</Text>
        </View>
      </View>
    );
  }

  const handleDecide = (decision) => {
    if (decision === 'reject' && note.trim().length === 0) {
      setLocalError('Please add a note explaining the rejection so the intern knows what to fix.');
      return;
    }
    setLocalError(null);
    dispatch(decideThunk({ id, category, decision, note: note.trim() || null })).then((result) => {
      if (!result.error) navigation.goBack();
    });
  };

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title={typeMeta.label} titleStyle={styles.headerTitle} />
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.content}>
        <StatusChip label={category === 'upload' ? 'Document Upload' : 'Document Request'} color={PIAColors.green} />

        {category === 'upload' && (
          <View style={styles.previewBlock}>
            <FilePreview
              fileUri={item.fileUri}
              fileName={item.fileName}
              fileMimeType={item.fileMimeType}
              fileSize={item.fileSize}
              size="large"
            />
          </View>
        )}

        {category === 'request' && (
          <Text style={styles.requestNote}>
            This is a generation request — approving it issues a new {typeMeta.label.toLowerCase()} for the
            intern; there's no uploaded file to review here.
          </Text>
        )}

        <TextInput
          mode="outlined"
          label="Decision note (required if rejecting)"
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.noteInput}
          outlineStyle={styles.noteInputOutline}
        />
        {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

        <View style={styles.decisionRow}>
          <View style={styles.decisionButton}>
            <GradientButton
              icon="close"
              label={isDeciding ? '…' : 'Reject'}
              gradient={[PIAColors.error, PIAColors.error]}
              disabled={isDeciding}
              onPress={() => handleDecide('reject')}
            />
          </View>
          <View style={styles.decisionButton}>
            <GradientButton
              icon="check"
              label={isDeciding ? '…' : 'Approve'}
              gradient={PIAGradients.primary}
              disabled={isDeciding}
              onPress={() => handleDecide('approve')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mutedText: { opacity: 0.6 },

  previewBlock: { alignItems: 'center', marginVertical: 20 },
  requestNote: { opacity: 0.7, lineHeight: 20, marginVertical: 20 },

  noteInput: { backgroundColor: PIAColors.white, marginTop: 8 },
  noteInputOutline: { borderRadius: 14 },
  errorText: { color: PIAColors.error, fontSize: 12, marginTop: 6 },

  decisionRow: { flexDirection: 'row', marginTop: 24, gap: 12 },
  decisionButton: { flex: 1 },
});
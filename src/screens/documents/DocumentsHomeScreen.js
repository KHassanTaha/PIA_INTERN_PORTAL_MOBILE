import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Card, IconButton, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function DocumentsHomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Documents" />
      </Appbar.Header>

      <OfflineBanner />

      <View style={styles.content}>
        <Card
          style={styles.optionCard}
          mode="elevated"
          onPress={() => navigation.navigate('UploadDocuments')}
        >
          <Card.Content style={styles.optionRow}>
            <IconButton icon="cloud-upload-outline" size={32} />
            <View style={styles.optionTextBlock}>
              <Text variant="titleMedium">Upload Documents</Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                Submit your profile photo, CNIC, student ID, or resume for
                review.
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={styles.optionCard}
          mode="elevated"
          onPress={() => navigation.navigate('RequestDocuments')}
        >
          <Card.Content style={styles.optionRow}>
            <IconButton icon="file-document-outline" size={32} />
            <View style={styles.optionTextBlock}>
              <Text variant="titleMedium">Request Documents</Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                Request your ID card or a letter of internship.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  optionCard: { marginBottom: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionTextBlock: { flex: 1, marginLeft: 4 },
  mutedText: { opacity: 0.6, marginTop: 2 },
});

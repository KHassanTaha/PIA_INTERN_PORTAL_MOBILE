/**
 * components/ComingSoonScreen.js
 *
 * Reusable placeholder for any drawer destination that has navigation
 * wired up but no real screen built yet (everything in StaffDrawer.js
 * except this comment currently). Keeps the drawer itself fully
 * navigable and demo-able while each real screen gets built out
 * individually, without every placeholder reinventing the same layout.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientHeader } from './Gradients';
import { PIAColors, PIAGradients } from '../theme/theme';

export default function ComingSoonScreen({ title, icon = 'progress-wrench' }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title={title} titleStyle={styles.headerTitle} />
      </GradientHeader>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={40} color={PIAColors.green} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>This screen is being built — check back soon.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PIAColors.greenLight + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { textAlign: 'center', opacity: 0.6 },
});
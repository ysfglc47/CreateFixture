import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../components/I18nPrimitives';

function formatValue(value) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}

function ExportTable({ title, headers, rows }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.tableHeader}>
        {headers.map(header => (
          <Text key={header.key} style={[styles.headerCell, { flex: header.flex }]}>
            {header.label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`${row.team || rowIndex}_${rowIndex}`} style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowAlt]}>
          {headers.map(header => (
            <Text key={header.key} style={[styles.bodyCell, header.key === 'team' && styles.teamCell, { flex: header.flex }]} numberOfLines={1}>
              {formatValue(row[header.key])}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function TableExportCard({
  title,
  subtitle,
  metaItems = [],
  tables = [],
  ruleLines = [],
}) {
  return (
    <View style={styles.card}>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.brand}>CreateFixture</Text>
          <Text style={styles.brandSub}>Turnuva tablo çıktısı</Text>
        </View>
        <Text style={styles.date}>{new Date().toLocaleDateString('tr-TR')}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.metaGrid}>
        {metaItems.map(item => (
          <View key={item.label} style={styles.metaBox}>
            <Text style={styles.metaLabel}>{item.label}</Text>
            <Text style={styles.metaValue}>{formatValue(item.value)}</Text>
          </View>
        ))}
      </View>

      {tables.map((table, index) => (
        <ExportTable
          key={`${table.title || 'table'}_${index}`}
          title={table.title}
          headers={table.headers}
          rows={table.rows}
        />
      ))}

      <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>Tablo Kuralları</Text>
        {ruleLines.map(line => (
          <Text key={line} style={styles.ruleLine}>{line}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 900,
    backgroundColor: '#f7f7fa',
    padding: 28,
  },
  brandRow: {
    backgroundColor: '#181818',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '900',
  },
  brandSub: {
    color: '#fff',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },
  date: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 14,
  },
  hero: {
    marginBottom: 14,
  },
  title: {
    color: '#222',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 140,
  },
  metaLabel: {
    color: '#777',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaValue: {
    color: '#222',
    fontSize: 14,
    fontWeight: '900',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#222',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  headerCell: {
    color: '#222',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 7,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#f5f5f5',
  },
  bodyCell: {
    color: '#222',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  teamCell: {
    textAlign: 'left',
  },
  rulesBox: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#FFD700',
  },
  rulesTitle: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  ruleLine: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
});

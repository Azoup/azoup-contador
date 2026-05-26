import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { downloadXml, openDanfe } from '@/services/nfeApi';
import { formatDateBR, formatMoney } from '@/utils/masks';
import { getStatusColor, getStatusLabel } from '@/utils/nfeStatus';
import type { NotaEnriquecida } from '@/types';

type Props = {
  nota: NotaEnriquecida;
};

export function NfeCard({ nota }: Props) {
  const { theme } = useTheme();
  const [loadingDanfe, setLoadingDanfe] = useState(false);
  const [loadingXml, setLoadingXml] = useState(false);

  const handleDanfe = async () => {
    try {
      setLoadingDanfe(true);
      openDanfe(nota);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível abrir o DANFE.');
    } finally {
      setLoadingDanfe(false);
    }
  };

  const handleXml = async () => {
    try {
      setLoadingXml(true);
      await downloadXml(nota);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível baixar o XML.');
    } finally {
      setLoadingXml(false);
    }
  };

  const copyChave = () => {
    if (!nota.chave_acesso) return;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(nota.chave_acesso);
      Alert.alert('Copiado', 'Chave copiada para a área de transferência.');
    }
  };

  const statusColor = getStatusColor(nota.status_sefaz, theme);
  const isCanceled = ['101', '135', '155'].includes(String(nota.status_sefaz));

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.rowBetween}>
        <Text style={[styles.cardTitle, { color: theme.secondary }]}>
          NF {nota.numero ?? '—'}
          {nota.serie != null ? ` / Série ${nota.serie}` : ''}
        </Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {getStatusLabel(nota.status_sefaz)}
        </Text>
      </View>

      {nota.codigoPedido ? (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Pedido {nota.codigoPedido}
        </Text>
      ) : null}

      {nota.tenantNome ? (
        <Text style={[styles.line, { color: theme.text }]}>
          <Text style={styles.label}>Conta: </Text>
          {nota.tenantNome}
        </Text>
      ) : null}

      <Text style={[styles.line, { color: theme.text }]}>
        <Text style={styles.label}>Cliente: </Text>
        {nota.clienteNome ?? '—'}
      </Text>
      <Text style={[styles.line, { color: theme.text }]}>
        <Text style={styles.label}>Empresa: </Text>
        {nota.empresaNome ?? '—'}
      </Text>
      <Text style={[styles.line, { color: theme.text }]}>
        <Text style={styles.label}>Valor: </Text>
        {formatMoney(nota.valor_total)}
      </Text>
      <Text style={[styles.line, { color: theme.text }]}>
        <Text style={styles.label}>Emissão: </Text>
        {formatDateBR(nota.data_emissao)}
      </Text>

      {nota.chave_acesso ? (
        <Pressable onPress={copyChave}>
          <Text
            style={[styles.chave, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {nota.chave_acesso}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          onPress={handleDanfe}
          disabled={loadingDanfe}
          style={[styles.actionBtn, styles.actionOutline]}
        >
          <Ionicons name="print-outline" size={16} color="#0D6EFD" />
          <Text style={styles.actionText}>
            {loadingDanfe ? 'Abrindo…' : 'Imprimir DANFE'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleXml}
          disabled={loadingXml}
          style={[styles.actionBtn, styles.actionOutline]}
        >
          <Ionicons name="download-outline" size={16} color="#0D6EFD" />
          <Text style={styles.actionText}>
            {loadingXml ? 'Baixando…' : isCanceled ? 'XML cancelamento' : 'Baixar XML'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
  },
  line: {
    fontSize: 13,
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
  },
  chave: {
    fontSize: 11,
    marginTop: 8,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionOutline: {
    borderWidth: 1,
    borderColor: '#0D6EFD',
  },
  actionText: {
    color: '#0D6EFD',
    fontSize: 13,
    fontWeight: '600',
  },
});

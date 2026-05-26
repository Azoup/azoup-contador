import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FilterFieldShell } from '@/components/FilterFieldShell';
import { FILTER_FONT_SIZE } from '@/constants/filterField';
import { useTheme } from '@/contexts/ThemeContext';
import type { ClienteAzoup, Empresa } from '@/types';

type Props = {
  empresas: Empresa[];
  clientes?: ClienteAzoup[];
  value: string | null;
  onChange: (id: string | null) => void;
};

const TODAS_LABEL = 'Todas as empresas';

function formatEmpresaLabel(
  empresa: Empresa,
  clientes: ClienteAzoup[],
  multiplosClientes: boolean
) {
  if (!multiplosClientes) return empresa.razao_social;
  const cliente = clientes.find((c) => c.id === empresa.cliente_id);
  const conta = cliente?.nome?.trim();
  return conta ? `${empresa.razao_social} — ${conta}` : empresa.razao_social;
}

export function EmpresaFilterSelect({ empresas, clientes = [], value, onChange }: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const multiplosClientes = useMemo(() => {
    const ids = new Set(empresas.map((e) => e.cliente_id));
    return ids.size > 1;
  }, [empresas]);

  const labelFor = (emp: Empresa) =>
    formatEmpresaLabel(emp, clientes, multiplosClientes);

  const selectedLabel = useMemo(() => {
    if (!value) return TODAS_LABEL;
    const emp = empresas.find((e) => e.id === value);
    if (!emp) return TODAS_LABEL;
    return labelFor(emp);
  }, [empresas, value, clientes, multiplosClientes]);

  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <FilterFieldShell label="Empresa" style={styles.empresaWrap}>
          <Pressable
            onPress={() => setOpen(true)}
            style={styles.trigger}
            accessibilityRole="button"
          >
            <Text
              style={[styles.triggerText, { color: theme.text }]}
              numberOfLines={1}
            >
              {selectedLabel}
            </Text>
            <Ionicons name="chevron-down-outline" size={18} color={theme.textMuted} />
          </Pressable>
        </FilterFieldShell>

        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <View
              style={[
                styles.menu,
                { backgroundColor: theme.surface, borderColor: theme.borderInput },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Text style={[styles.menuTitle, { color: theme.textSecondary }]}>Empresa</Text>
              <ScrollView style={styles.menuScroll} keyboardShouldPersistTaps="handled">
                <Pressable
                  onPress={() => pick(null)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && { backgroundColor: theme.surfaceVariant },
                    !value && { backgroundColor: theme.surfaceVariant },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>{TODAS_LABEL}</Text>
                </Pressable>
                {empresas.map((e) => {
                  const label = labelFor(e);
                  const active = value === e.id;
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => pick(e.id)}
                      style={({ pressed }) => [
                        styles.option,
                        (pressed || active) && { backgroundColor: theme.surfaceVariant },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.text },
                          active && styles.optionTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <FilterFieldShell label="Empresa" style={styles.empresaWrap}>
      <Picker
        selectedValue={value ?? ''}
        onValueChange={(v) => onChange(v || null)}
        style={[styles.picker, { color: theme.text }]}
        dropdownIconColor={theme.textSecondary}
      >
        <Picker.Item label={TODAS_LABEL} value="" />
        {empresas.map((e) => (
          <Picker.Item
            key={e.id}
            label={labelFor(e)}
            value={e.id}
          />
        ))}
      </Picker>
    </FilterFieldShell>
  );
}

const styles = StyleSheet.create({
  empresaWrap: {
    flexBasis: 220,
    minWidth: 200,
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: '100%',
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: FILTER_FONT_SIZE,
  },
  picker: {
    width: '100%',
    height: 42,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menu: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  menuScroll: {
    maxHeight: 320,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: FILTER_FONT_SIZE,
  },
  optionTextActive: {
    fontWeight: '700',
  },
});

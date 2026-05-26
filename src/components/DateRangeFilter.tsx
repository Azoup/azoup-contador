import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { FilterFieldShell } from '@/components/FilterFieldShell';
import { DateRangeCalendar } from '@/components/DateRangeCalendar';
import { useTheme } from '@/contexts/ThemeContext';
import { FILTER_FONT_SIZE } from '@/constants/filterField';
import {
  DATE_PRESETS,
  detectActivePreset,
  formatRangeLabel,
  getPresetRange,
  type DatePresetId,
  type DateRangeValue,
} from '@/utils/dateRange';

type Props = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
};

function DateRangePickerPanel({
  draft,
  onDraftChange,
  stacked,
}: {
  draft: DateRangeValue;
  onDraftChange: (range: DateRangeValue) => void;
  stacked: boolean;
}) {
  const { theme } = useTheme();
  const activePreset = useMemo(() => detectActivePreset(draft), [draft]);

  const applyPreset = (id: DatePresetId) => {
    onDraftChange(getPresetRange(id));
  };

  return (
    <View style={[styles.panelRow, stacked && styles.panelRowStacked]}>
      <View style={[styles.presets, stacked && styles.presetsStacked]}>
        {DATE_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => applyPreset(preset.id)}
              style={({ pressed }) => [
                styles.presetBtn,
                {
                  backgroundColor: active ? theme.primary : theme.surfaceVariant,
                  borderColor: active ? theme.primary : theme.border,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  { color: active ? '#FFFFFF' : theme.text },
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.calendarCol, stacked && styles.calendarColStacked]}>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.borderStrong },
            stacked && styles.dividerH,
          ]}
        />
        <DateRangeCalendar value={draft} onChange={onDraftChange} theme={theme} />
      </View>
    </View>
  );
}

export function DateRangeFilter({ value, onChange }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const modalStacked = width < 720;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const openModal = () => setOpen(true);

  const closeModal = () => setOpen(false);

  const apply = () => {
    onChange(draft);
    closeModal();
  };

  const label = formatRangeLabel(value);

  return (
    <>
      <FilterFieldShell label="Período" style={styles.periodWrap}>
        <Pressable
          onPress={openModal}
          style={styles.trigger}
          accessibilityRole="button"
          accessibilityLabel={`Período: ${label}`}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
          <Text style={[styles.triggerText, { color: theme.text }]} numberOfLines={1}>
            {label}
          </Text>
          <Ionicons name="chevron-down-outline" size={18} color={theme.textMuted} />
        </Pressable>
      </FilterFieldShell>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.overlay} onPress={closeModal}>
          <View
            style={[
              styles.popup,
              { backgroundColor: theme.surface, borderColor: theme.borderInput },
              modalStacked && styles.popupStacked,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.popupHeader}>
              <Text style={[styles.popupTitle, { color: theme.text }]}>Selecionar período</Text>
              <Pressable
                onPress={closeModal}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close-outline" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.popupPreview, { color: theme.textMuted }]}>
              {formatRangeLabel(draft)}
            </Text>

            <DateRangePickerPanel
              draft={draft}
              onDraftChange={setDraft}
              stacked={modalStacked}
            />

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.footerBtn,
                  styles.footerBtnGhost,
                  { borderColor: theme.border },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.footerBtnText, { color: theme.textSecondary }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={apply}
                style={({ pressed }) => [
                  styles.footerBtn,
                  { backgroundColor: theme.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.footerBtnText, styles.footerBtnTextPrimary]}>
                  Aplicar
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  periodWrap: {
    flexBasis: 240,
    minWidth: 200,
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: FILTER_FONT_SIZE,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popup: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    maxHeight: '92%',
  },
  popupStacked: {
    maxWidth: 400,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  popupPreview: {
    fontSize: 13,
    marginBottom: 12,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  panelRowStacked: {
    flexDirection: 'column',
  },
  presets: {
    width: 168,
    minWidth: 148,
    gap: 6,
  },
  presetsStacked: {
    width: '100%',
    minWidth: '100%',
  },
  presetBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  presetText: {
    fontSize: FILTER_FONT_SIZE,
    fontWeight: '500',
  },
  calendarCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 280,
  },
  calendarColStacked: {
    minWidth: '100%',
    flexDirection: 'column',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginRight: 12,
  },
  dividerH: {
    width: '100%',
    height: 1,
    marginRight: 0,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  footerBtnGhost: {
    borderWidth: 1,
  },
  footerBtnText: {
    fontSize: FILTER_FONT_SIZE,
    fontWeight: '600',
  },
  footerBtnTextPrimary: {
    color: '#FFFFFF',
  },
});

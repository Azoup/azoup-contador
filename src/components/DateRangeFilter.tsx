import { Calendar, ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DateRangeCalendar } from '@/components/DateRangeCalendar';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  DATE_PRESETS,
  detectActivePreset,
  formatRangeLabel,
  getPresetRange,
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

  return (
    <div className={`date-panel ${stacked ? 'date-panel--stacked' : ''}`}>
      <div className="date-presets">
        {DATE_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${active ? 'preset-btn--active' : ''}`}
              onClick={() => onDraftChange(getPresetRange(preset.id))}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className={`date-calendar-col ${stacked ? 'date-panel--stacked' : ''}`}>
        <div className="date-divider" aria-hidden />
        <DateRangeCalendar value={draft} onChange={onDraftChange} theme={theme} />
      </div>
    </div>
  );
}

export function DateRangeFilter({ value, onChange }: Props) {
  const modalStacked = useMediaQuery('(max-width: 719px)');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const label = formatRangeLabel(value);

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <div className="filter-field filter-field--period">
        <label>Período</label>
        <div className="filter-control">
          <button type="button" className="filter-trigger" onClick={() => setOpen(true)}>
            <Calendar size={18} color="var(--color-text-muted)" />
            <span>{label}</span>
            <ChevronDown size={18} color="var(--color-text-muted)" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className={`modal-panel ${modalStacked ? 'modal-panel--narrow' : ''}`}
            role="dialog"
            aria-labelledby="period-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="period-modal-title" className="modal-title">
                Selecionar período
              </h2>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            <p className="modal-preview">{formatRangeLabel(draft)}</p>
            <DateRangePickerPanel
              draft={draft}
              onDraftChange={setDraft}
              stacked={modalStacked}
            />
            <div className="modal-footer">
              <button type="button" className="btn btn--ghost-border" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primary" style={{ width: 'auto' }} onClick={apply}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

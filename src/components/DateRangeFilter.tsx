import { Calendar, ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DateRangeCalendar } from '@/components/DateRangeCalendar';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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

export function DateRangeFilter({ value, onChange }: Props) {
  const { theme } = useTheme();
  const isCompact = useMediaQuery('(max-width: 900px)');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);

  const activePreset = useMemo(() => detectActivePreset(value), [value]);
  const draftPreset = useMemo(() => detectActivePreset(draft), [draft]);
  const label = formatRangeLabel(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const applyPreset = (id: DatePresetId) => {
    onChange(getPresetRange(id));
  };

  const applyDraft = () => {
    onChange(draft);
    setOpen(false);
  };

  const modal = open
    ? createPortal(
        <div
          className={`modal-overlay ${isCompact ? 'modal-overlay--sheet' : ''}`}
          role="presentation"
          onClick={close}
        >
          <div
            className={`modal-panel modal-panel--period ${isCompact ? 'modal-panel--sheet' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {isCompact ? <div className="modal-sheet-handle" aria-hidden /> : null}
            <div className="modal-header">
              <h2 id="period-modal-title" className="modal-title">
                Selecionar período
              </h2>
              <button type="button" className="btn btn--ghost" onClick={close} aria-label="Fechar">
                <X size={24} />
              </button>
            </div>
            <p className="modal-preview">{formatRangeLabel(draft)}</p>

            <div className={`date-panel ${isCompact ? 'date-panel--stacked' : ''}`}>
              <div className={`date-presets ${isCompact ? 'date-presets--grid' : ''}`}>
                {DATE_PRESETS.map((preset) => {
                  const active = draftPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`preset-btn ${active ? 'preset-btn--active' : ''}`}
                      onClick={() => setDraft(getPresetRange(preset.id))}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="date-calendar-section">
                <DateRangeCalendar value={draft} onChange={setDraft} theme={theme} />
              </div>
            </div>

            <div className={`modal-footer ${isCompact ? 'modal-footer--sticky' : ''}`}>
              <button type="button" className="btn btn--ghost-border" onClick={close}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary modal-footer__apply"
                onClick={applyDraft}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="period-filter">
      <div className="filter-field filter-field--period">
        <label htmlFor="period-trigger">Período</label>
        <div className="filter-control">
          <button
            id="period-trigger"
            type="button"
            className="filter-trigger"
            onClick={() => setOpen(true)}
          >
            <Calendar size={18} color="var(--color-text-muted)" aria-hidden />
            <span>{label}</span>
            <ChevronDown size={18} color="var(--color-text-muted)" aria-hidden />
          </button>
        </div>
      </div>

      <div className="period-filter__presets" role="group" aria-label="Atalhos de período">
        {DATE_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`period-chip ${active ? 'period-chip--active' : ''}`}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {modal}
    </div>
  );
}

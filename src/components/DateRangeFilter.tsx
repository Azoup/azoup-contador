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
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const [showCalendar, setShowCalendar] = useState(false);

  const activePreset = useMemo(() => detectActivePreset(draft), [draft]);
  const label = formatRangeLabel(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setShowCalendar(false);
    }
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

  const apply = (range: DateRangeValue) => {
    onChange(range);
    setOpen(false);
  };

  const selectPreset = (id: DatePresetId) => {
    const range = getPresetRange(id);
    setDraft(range);
    if (isMobile) {
      apply(range);
    }
  };

  const modal = open
    ? createPortal(
        <div
          className={`modal-overlay ${isMobile ? 'modal-overlay--sheet' : ''}`}
          role="presentation"
          onClick={close}
        >
          <div
            className={`modal-panel modal-panel--period ${isMobile ? 'modal-panel--sheet' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-sheet-handle" aria-hidden />

            <div className="modal-header">
              <h2 id="period-modal-title" className="modal-title">
                Período
              </h2>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={close}
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>

            <p className="modal-preview">{formatRangeLabel(draft)}</p>

            <div className="date-presets date-presets--grid">
              {DATE_PRESETS.map((preset) => {
                const active = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-btn ${active ? 'preset-btn--active' : ''}`}
                    onClick={() => selectPreset(preset.id)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {isMobile ? (
              <button
                type="button"
                className="date-toggle-calendar"
                onClick={() => setShowCalendar((v) => !v)}
              >
                {showCalendar ? 'Ocultar calendário' : 'Escolher no calendário'}
              </button>
            ) : null}

            {(!isMobile || showCalendar) && (
              <div className="date-calendar-section">
                <DateRangeCalendar value={draft} onChange={setDraft} theme={theme} />
              </div>
            )}

            {(!isMobile || showCalendar) && (
              <div className="modal-footer modal-footer--sticky">
                <button type="button" className="btn btn--ghost-border" onClick={close}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn--primary modal-footer__apply"
                  onClick={() => apply(draft)}
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
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
      {modal}
    </>
  );
}

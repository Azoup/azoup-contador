import { ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
  const isMobile = useMediaQuery('(max-width: 767px)');
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  const modal = open
    ? createPortal(
        <div
          className={`modal-overlay ${isMobile ? 'modal-overlay--sheet' : ''}`}
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className={`modal-panel ${isMobile ? 'modal-panel--sheet' : 'modal-panel--narrow'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="empresa-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-sheet-handle" aria-hidden />
            <div className="modal-header">
              <h2 id="empresa-modal-title" className="modal-title">
                Empresa
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
            <div className="modal-options">
              <button
                type="button"
                className={`modal-option ${!value ? 'modal-option--active' : ''}`}
                onClick={() => pick(null)}
              >
                {TODAS_LABEL}
              </button>
              {empresas.map((e) => {
                const label = labelFor(e);
                const active = value === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={`modal-option ${active ? 'modal-option--active' : ''}`}
                    onClick={() => pick(e.id)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="filter-field filter-field--empresa">
        <label htmlFor="empresa-trigger">Empresa</label>
        <div className="filter-control">
          <button
            id="empresa-trigger"
            type="button"
            className="filter-trigger"
            onClick={() => setOpen(true)}
          >
            <span>{selectedLabel}</span>
            <ChevronDown size={18} color="var(--color-text-muted)" aria-hidden />
          </button>
        </div>
      </div>
      {modal}
    </>
  );
}

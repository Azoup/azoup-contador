import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
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

  return (
    <>
      <div className="filter-field filter-field--empresa">
        <label>Empresa</label>
        <div className="filter-control">
          <button type="button" className="filter-trigger" onClick={() => setOpen(true)}>
            <span>{selectedLabel}</span>
            <ChevronDown size={18} color="var(--color-text-muted)" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modal-panel modal-panel--narrow"
            role="dialog"
            aria-labelledby="empresa-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="empresa-modal-title" className="modal-menu-title">
              Empresa
            </p>
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
        </div>
      ) : null}
    </>
  );
}

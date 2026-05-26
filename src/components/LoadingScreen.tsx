type Props = {
  message?: string;
};

export function LoadingScreen({ message }: Props) {
  return (
    <div className="page-center">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="spinner" aria-hidden />
        {message ? (
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}

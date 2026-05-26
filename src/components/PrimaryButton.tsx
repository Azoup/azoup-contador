type Props = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  className?: string;
};

export function PrimaryButton({
  label,
  onClick,
  type = 'button',
  loading,
  disabled,
  variant = 'primary',
  className = '',
}: Props) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : label}
    </button>
  );
}

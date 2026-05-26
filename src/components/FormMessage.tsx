type Props = {
  type: 'error' | 'success' | 'info';
  message: string;
};

export function FormMessage({ type, message }: Props) {
  return <div className={`form-message form-message--${type}`}>{message}</div>;
}

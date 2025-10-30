/**
 * FormContainer Component
 *
 * Container component organizing form fields with consistent spacing and layout.
 * Groups related fields logically and provides visual structure.
 */

interface FormContainerProps {
  children: React.ReactNode;
}

export default function FormContainer({ children }: FormContainerProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <div className="space-y-6">{children}</div>
    </div>
  );
}

/**
 * PageHeader Component
 *
 * Header section displaying page title and optional description/instructions for the form.
 * Used at the top of form pages to provide context to users.
 */

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
    </header>
  );
}

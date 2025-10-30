/**
 * PageHeader Component
 *
 * Presentational component displaying the page title for the directory.
 */

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {description && <p className="text-gray-600">{description}</p>}
    </header>
  );
}

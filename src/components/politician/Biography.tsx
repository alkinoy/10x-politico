/**
 * Biography Component
 *
 * Displays full biography text with proper paragraph formatting.
 * Handles null/empty biography gracefully.
 */

interface BiographyProps {
  biography: string | null;
}

export default function Biography({ biography }: BiographyProps) {
  // Handle null or empty biography
  if (!biography || biography.trim() === "") {
    return <div className="text-gray-500 italic text-sm">No biography available</div>;
  }

  // Split by double newlines to create paragraphs
  const paragraphs = biography.split(/\n\n+/);

  return (
    <div className="space-y-3 text-gray-700 leading-relaxed">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-sm md:text-base">
          {paragraph.trim()}
        </p>
      ))}
    </div>
  );
}

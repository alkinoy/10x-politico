/**
 * BiographyPreview Component
 *
 * Displays truncated biography text (approximately 150 characters).
 * Provides quick context about the politician.
 */

interface BiographyPreviewProps {
  biography: string | null;
  maxLength?: number;
}

export default function BiographyPreview({ biography, maxLength = 150 }: BiographyPreviewProps) {
  // Handle null or empty biography
  if (!biography || biography.trim() === "") {
    return <p className="text-sm text-gray-500 italic">No biography available</p>;
  }

  // Truncate if longer than maxLength
  const truncated = biography.length > maxLength ? `${biography.substring(0, maxLength).trim()}...` : biography;

  return <p className="text-sm text-gray-600 line-clamp-3">{truncated}</p>;
}

/**
 * PoliticianAvatar Component
 *
 * Displays politician avatar as initials (first + last name) or image (future enhancement).
 * Provides visual identification with consistent sizing and styling.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PoliticianAvatarProps {
  name: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
  xl: "size-24 text-lg",
};

export default function PoliticianAvatar({
  name,
  firstName,
  lastName,
  imageUrl,
  size = "md",
  "data-testid": dataTestId,
}: PoliticianAvatarProps) {
  // Generate initials from first and last name
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

  return (
    <Avatar className={sizeClasses[size]} data-testid={dataTestId} aria-label={name}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className="bg-blue-600 text-white font-semibold">{initials}</AvatarFallback>
    </Avatar>
  );
}

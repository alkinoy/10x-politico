/**
 * ProfileHeader Component
 *
 * Displays user's profile information including avatar (initials),
 * display name, email, and member since date.
 * Allows inline editing of display name.
 */

import { useState, useMemo, useCallback } from "react";
import type { ProfileDTO, UpdateProfileCommand } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/EditProfileForm";

interface ProfileHeaderProps {
  profile: ProfileDTO;
  onUpdate: (profile: ProfileDTO) => void;
}

export default function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Generate initials from display name
  const initials = useMemo(() => {
    if (!profile.display_name) return "?";

    const words = profile.display_name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }, [profile.display_name]);

  // Format member since date
  const memberSinceDate = useMemo(() => {
    try {
      const date = new Date(profile.created_at);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  }, [profile.created_at]);

  // Handle profile update
  const handleSaveProfile = useCallback(
    async (newDisplayName: string) => {
      const command: UpdateProfileCommand = {
        display_name: newDisplayName,
      };

      const response = await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || "Failed to update profile";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onUpdate(data.data);
      setIsEditing(false);
      setUpdateSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    },
    [onUpdate]
  );

  // Handle edit button click
  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setUpdateSuccess(false);
  }, []);

  // Handle cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="size-20 text-2xl">
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>

          {/* Profile Info */}
          <div className="flex-1">
            <CardTitle className="text-3xl">{profile.display_name || "Anonymous User"}</CardTitle>
            <CardDescription className="mt-2 space-y-1">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{profile.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Member since:</span>
                <span className="text-sm">{memberSinceDate}</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Edit Profile Section */}
        <div className="space-y-4">
          {updateSuccess && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200"
            >
              Profile updated successfully!
            </div>
          )}

          {isEditing ? (
            <EditProfileForm
              currentDisplayName={profile.display_name || ""}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Display Name</p>
                <p className="text-sm text-muted-foreground">{profile.display_name || "Not set"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditClick} aria-label="Edit display name">
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

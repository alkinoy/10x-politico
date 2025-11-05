/**
 * API Endpoint: /api/profiles/me
 *
 * GET - Retrieve authenticated user's profile
 * PATCH - Update authenticated user's profile
 */

import type { APIRoute } from "astro";
import { getAuthenticatedUser } from "../../../lib/utils/auth";
import { getAuthenticatedProfile, updateProfile } from "../../../lib/services/profile-service";
import type { UpdateProfileCommand } from "../../../types";

/**
 * GET /api/profiles/me
 * Retrieve the authenticated user's profile
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = locals.runtime?.env;
    // Authenticate user
    const authHeader = request.headers.get("Authorization");
    const userId = await getAuthenticatedUser(authHeader, runtime);

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Authentication required",
            code: "AUTHENTICATION_REQUIRED",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch profile
    const profile = await getAuthenticatedProfile(userId, runtime);

    if (!profile) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Profile not found",
            code: "NOT_FOUND",
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ data: profile }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to retrieve profile",
          code: "INTERNAL_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PATCH /api/profiles/me
 * Update the authenticated user's profile
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = locals.runtime?.env;
    // Authenticate user
    const authHeader = request.headers.get("Authorization");
    const userId = await getAuthenticatedUser(authHeader, runtime);

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Authentication required",
            code: "AUTHENTICATION_REQUIRED",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let command: UpdateProfileCommand;

    try {
      command = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid JSON in request body",
            code: "VALIDATION_ERROR",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update profile
    try {
      const updatedProfile = await updateProfile(userId, command, runtime);

      if (!updatedProfile) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Profile not found",
              code: "NOT_FOUND",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ data: updatedProfile }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle validation errors from service
      if (error instanceof Error) {
        if (
          error.message.includes("Display name cannot be empty") ||
          error.message.includes("Display name cannot exceed")
        ) {
          return new Response(
            JSON.stringify({
              error: {
                message: error.message,
                code: "VALIDATION_ERROR",
                details: {
                  field: "display_name",
                },
              },
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      throw error; // Re-throw for general error handler
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to update profile",
          code: "INTERNAL_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

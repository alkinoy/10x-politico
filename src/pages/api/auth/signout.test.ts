/**
 * Tests for Sign-Out API Endpoint
 * POST /api/auth/signout
 *
 * Note: The application primarily uses client-side sign-out (in NavContent.tsx)
 * for proper localStorage cleanup. This API endpoint serves as a backup/alternative
 * method and is tested here for completeness.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";

// Mock the Supabase client
vi.mock("@/db/client", () => ({
  getSupabaseClientAnon: vi.fn(() => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

import { POST } from "./signout";

// Type for mocked APIContext
type MockAPIContext = Pick<APIContext, "cookies" | "redirect" | "locals">;

describe("POST /api/auth/signout", () => {
  let mockCookies: {
    delete: ReturnType<typeof vi.fn>;
  };
  let mockRedirect: ReturnType<typeof vi.fn>;
  let mockContext: MockAPIContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCookies = {
      delete: vi.fn(),
    };

    mockRedirect = vi.fn((url: string, status: number) => {
      return new Response(null, {
        status,
        headers: { Location: url },
      });
    });

    mockContext = {
      cookies: mockCookies,
      redirect: mockRedirect,
      locals: {
        runtime: {
          env: {},
        },
      },
    };
  });

  it("should sign out user and redirect to home page", async () => {
    // Act
    await POST(mockContext);

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("/", 303);
    expect(mockCookies.delete).toHaveBeenCalledTimes(3);
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-access-token", { path: "/" });
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-refresh-token", { path: "/" });
    expect(mockCookies.delete).toHaveBeenCalledWith("supabase-auth-token", { path: "/" });
  });

  it("should redirect to home page even if sign-out fails", async () => {
    // Arrange
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    const { getSupabaseClientAnon } = await import("@/db/client");
    vi.mocked(getSupabaseClientAnon).mockReturnValue({
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: new Error("Sign-out failed"),
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Act
    await POST(mockContext);

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("/", 303);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error signing out:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it("should handle unexpected errors gracefully", async () => {
    // Arrange
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    const { getSupabaseClientAnon } = await import("@/db/client");
    vi.mocked(getSupabaseClientAnon).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    // Act
    await POST(mockContext);

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("/", 303);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Unexpected error during sign-out:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});

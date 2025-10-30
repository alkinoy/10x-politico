import { describe, it, expect } from "vitest";
import type { APIContext } from "astro";
import { GET } from "./health";

describe("Health API Endpoint", () => {
  it("should return 200 status", async () => {
    const response = await GET({} as APIContext);
    expect(response.status).toBe(200);
  });

  it("should return ok status in response body", async () => {
    const response = await GET({} as APIContext);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  it("should return timestamp in response body", async () => {
    const response = await GET({} as APIContext);
    const body = await response.json();
    expect(body.timestamp).toBeDefined();
    expect(typeof body.timestamp).toBe("string");
  });

  it("should return valid ISO timestamp", async () => {
    const response = await GET({} as APIContext);
    const body = await response.json();
    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBe(body.timestamp);
  });

  it("should return Content-Type header as application/json", async () => {
    const response = await GET({} as APIContext);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });
});

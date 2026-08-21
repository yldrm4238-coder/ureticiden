import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const mockUser = { id: "user-1" };

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const selectMock = vi.fn();
const eqSelectMock = vi.fn();
const deleteMock = vi.fn();
const insertMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (_table: string) => ({
      select: selectMock,
      delete: deleteMock,
      insert: insertMock,
    }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReturnValue({
      eq: eqSelectMock.mockResolvedValue({ data: [{ product_id: "p1" }] }),
    });
    // Insert/delete never resolve during these tests so we can inspect the
    // optimistic cache state before the (mocked) network call settles.
    insertMock.mockReturnValue(new Promise(() => {}));
    deleteMock.mockReturnValue({
      eq: () => ({ eq: () => new Promise(() => {}) }),
    });
  });

  it("loads the current user's favorite ids", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.favoriteIds).toEqual(["p1"]));
    expect(result.current.isFavorite("p1")).toBe(true);
    expect(result.current.isFavorite("p2")).toBe(false);
  });

  it("optimistically adds a product before the insert resolves", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.favoriteIds).toEqual(["p1"]));

    act(() => {
      result.current.toggle("p2");
    });

    // Optimistic update applies synchronously, ahead of the network call resolving.
    await waitFor(() => expect(result.current.isFavorite("p2")).toBe(true));
    expect(insertMock).toHaveBeenCalledWith({ user_id: "user-1", product_id: "p2" });
  });

  it("optimistically removes a product that is already a favorite", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.favoriteIds).toEqual(["p1"]));

    act(() => {
      result.current.toggle("p1");
    });

    await waitFor(() => expect(result.current.isFavorite("p1")).toBe(false));
  });
});

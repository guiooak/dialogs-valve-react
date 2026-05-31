import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parsePropValue,
  extractDialogProps,
  getActiveDialogKeys,
  cleanUpQueryParams,
  validateDialogKeys,
  buildDialogUrl,
  buildCloseDialogUrl,
  buildCloseAllDialogsUrl,
} from "../services";

vi.mock("../browser", () => ({
  getLocationSearch: vi.fn(() => ""),
}));

import { getLocationSearch } from "../browser";

// ---------------------------------------------------------------------------
// parsePropValue
// ---------------------------------------------------------------------------

describe("parsePropValue", () => {
  it("returns boolean true for the bool.true sentinel", () => {
    // Arrange
    const input = "bool.true";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe(true);
  });

  it("returns boolean false for the bool.false sentinel", () => {
    // Arrange
    const input = "bool.false";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe(false);
  });

  it("returns a number for the number. sentinel prefix", () => {
    // Arrange
    const input = "number.42";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe(42);
  });

  it("returns 0 for number.0", () => {
    // Arrange
    const input = "number.0";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe(0);
  });

  it("returns the string as-is for a plain string value", () => {
    // Arrange
    const input = "hello world";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe("hello world");
  });

  it("returns an empty string as-is", () => {
    // Arrange
    const input = "";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe("");
  });

  it("does not treat 'bool.maybe' as a boolean — it has no matching sentinel", () => {
    // Arrange
    const input = "bool.maybe";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe("bool.maybe");
  });

  it("does not treat 'number.abc' as a number — regex requires digits only", () => {
    // Arrange
    const input = "number.abc";
    // Act
    const result = parsePropValue(input);
    // Assert
    expect(result).toBe("number.abc");
  });
});

// ---------------------------------------------------------------------------
// extractDialogProps
// ---------------------------------------------------------------------------

describe("extractDialogProps", () => {
  it("returns an empty object when the search string contains no props for the dialog", () => {
    // Arrange
    const search = "?dialog=my-dialog";
    // Act
    const result = extractDialogProps(search, "my-dialog");
    // Assert
    expect(result).toEqual({});
  });

  it("returns an empty object for an empty search string", () => {
    // Arrange / Act
    const result = extractDialogProps("", "any-dialog");
    // Assert
    expect(result).toEqual({});
  });

  it("extracts a string prop keyed by the dialog-prefixed param", () => {
    // Arrange
    const search = "?dialog=d&d.title=Hello";
    // Act
    const result = extractDialogProps(search, "d");
    // Assert
    expect(result).toEqual({ title: "Hello" });
  });

  it("parses a boolean true prop", () => {
    // Arrange
    const search = "?dialog=d&d.active=bool.true";
    // Act
    const result = extractDialogProps(search, "d");
    // Assert
    expect(result).toEqual({ active: true });
  });

  it("parses a boolean false prop", () => {
    // Arrange
    const search = "?dialog=d&d.active=bool.false";
    // Act
    const result = extractDialogProps(search, "d");
    // Assert
    expect(result).toEqual({ active: false });
  });

  it("parses a number prop", () => {
    // Arrange
    const search = "?dialog=d&d.count=number.7";
    // Act
    const result = extractDialogProps(search, "d");
    // Assert
    expect(result).toEqual({ count: 7 });
  });

  it("extracts multiple props in a single call", () => {
    // Arrange
    const search = "?dialog=d&d.title=Hi&d.active=bool.true&d.count=number.3";
    // Act
    const result = extractDialogProps(search, "d");
    // Assert
    expect(result).toEqual({ title: "Hi", active: true, count: 3 });
  });

  it("ignores props that belong to a different dialog key", () => {
    // Arrange
    const search = "?dialog=a&dialog=b&a.title=ForA&b.title=ForB";
    // Act
    const result = extractDialogProps(search, "a");
    // Assert
    expect(result).toEqual({ title: "ForA" });
  });
});

// ---------------------------------------------------------------------------
// getActiveDialogKeys
// ---------------------------------------------------------------------------

describe("getActiveDialogKeys", () => {
  it("returns an empty array when no dialog param is present", () => {
    // Arrange
    const search = "?other=value";
    // Act
    const result = getActiveDialogKeys(search, "dialog");
    // Assert
    expect(result).toEqual([]);
  });

  it("returns an empty array for an empty search string", () => {
    // Arrange / Act
    const result = getActiveDialogKeys("", "dialog");
    // Assert
    expect(result).toEqual([]);
  });

  it("returns a single key", () => {
    // Arrange
    const search = "?dialog=my-dialog";
    // Act
    const result = getActiveDialogKeys(search, "dialog");
    // Assert
    expect(result).toEqual(["my-dialog"]);
  });

  it("returns multiple keys from repeated dialog params", () => {
    // Arrange
    const search = "?dialog=dialog-a&dialog=dialog-b";
    // Act
    const result = getActiveDialogKeys(search, "dialog");
    // Assert
    expect(result).toEqual(["dialog-a", "dialog-b"]);
  });

  it("deduplicates the same key appearing more than once", () => {
    // Arrange
    const search = "?dialog=my-dialog&dialog=my-dialog";
    // Act
    const result = getActiveDialogKeys(search, "dialog");
    // Assert
    expect(result).toEqual(["my-dialog"]);
  });

  it("respects a custom dialog param key", () => {
    // Arrange
    const search = "?dlg=custom-dialog";
    // Act
    const result = getActiveDialogKeys(search, "dlg");
    // Assert
    expect(result).toEqual(["custom-dialog"]);
  });
});

// ---------------------------------------------------------------------------
// cleanUpQueryParams
// ---------------------------------------------------------------------------

describe("cleanUpQueryParams", () => {
  it("removes the targeted dialog key from the dialog param list", () => {
    // Arrange
    const search = "?dialog=my-dialog";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "my-dialog");
    // Assert
    expect(result).toBe("");
  });

  it("removes only the targeted key, leaving other dialog keys intact", () => {
    // Arrange
    const search = "?dialog=dialog-a&dialog=dialog-b";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "dialog-a");
    // Assert
    const params = new URLSearchParams(result);
    expect(params.getAll("dialog")).toEqual(["dialog-b"]);
  });

  it("keeps other dialog keys even when the closed key is a substring of 'dialog'", () => {
    // Arrange — closing single-char "a": a naive includes() match would also drop
    // the "dialog" param ("dialog".includes("a")) and wipe "dialog=b"
    const search = "?dialog=a&dialog=b";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "a");
    // Assert
    const params = new URLSearchParams(result);
    expect(params.getAll("dialog")).toEqual(["b"]);
  });

  it("preserves an unrelated param whose name merely contains the dialog key", () => {
    // Arrange — closing "user" must not delete "username"
    const search = "?dialog=user&username=bob";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "user");
    // Assert
    const params = new URLSearchParams(result);
    expect(params.get("username")).toBe("bob");
  });

  it("removes prop params that are prefixed with the dialog key", () => {
    // Arrange
    const search = "?dialog=d&d.title=Hi&d.count=number.5";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "d");
    // Assert
    expect(result).toBe("");
  });

  it("leaves unrelated query params intact", () => {
    // Arrange
    const search = "?dialog=my-dialog&utm_source=google";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "my-dialog");
    // Assert
    const params = new URLSearchParams(result);
    expect(params.get("utm_source")).toBe("google");
  });

  it("returns an empty string (not '?') when all params are cleared", () => {
    // Arrange
    const search = "?dialog=my-dialog";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "my-dialog");
    // Assert
    expect(result).toBe("");
  });
});

// ---------------------------------------------------------------------------
// validateDialogKeys
// ---------------------------------------------------------------------------

describe("validateDialogKeys", () => {
  it("returns only the keys that are present in the valid set", () => {
    // Arrange
    const keys = ["a", "b", "unknown"];
    const validKeys = ["a", "b"];
    // Act
    const result = validateDialogKeys(keys, validKeys);
    // Assert
    expect(result).toEqual(["a", "b"]);
  });

  it("returns an empty array when none of the provided keys are valid", () => {
    // Arrange
    const keys = ["x", "y"];
    const validKeys = ["a", "b"];
    // Act
    const result = validateDialogKeys(keys, validKeys);
    // Assert
    expect(result).toEqual([]);
  });

  it("returns all keys when every key is valid", () => {
    // Arrange
    const keys = ["a", "b", "c"];
    const validKeys = ["a", "b", "c"];
    // Act
    const result = validateDialogKeys(keys, validKeys);
    // Assert
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("emits a console.warn for each invalid key", () => {
    // Arrange
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const keys = ["valid", "bad-1", "bad-2"];
    const validKeys = ["valid"];
    // Act
    validateDialogKeys(keys, validKeys);
    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it("does not warn for valid keys", () => {
    // Arrange
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Act
    validateDialogKeys(["a"], ["a"]);
    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// buildDialogUrl
// ---------------------------------------------------------------------------

describe("buildDialogUrl", () => {
  beforeEach(() => {
    vi.mocked(getLocationSearch).mockReturnValue("");
  });

  it("builds a relative (search-only) URL so the router keeps the current path and basename", () => {
    // Arrange / Act
    const result = buildDialogUrl("my-dialog");
    // Assert — relative, not an absolute pathname (which would double a basename)
    expect(result).toBe("?dialog=my-dialog");
  });

  it("serializes a string prop into the query string", () => {
    // Arrange / Act
    const result = buildDialogUrl("d", { props: { title: "Hello" } });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("d.title")).toBe("Hello");
  });

  it("serializes a boolean true prop with the bool. prefix", () => {
    // Arrange / Act
    const result = buildDialogUrl("d", { props: { active: true } });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("d.active")).toBe("bool.true");
  });

  it("serializes a boolean false prop with the bool. prefix", () => {
    // Arrange / Act
    const result = buildDialogUrl("d", { props: { active: false } });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("d.active")).toBe("bool.false");
  });

  it("serializes a number prop with the number. prefix", () => {
    // Arrange / Act
    const result = buildDialogUrl("d", { props: { count: 7 } });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("d.count")).toBe("number.7");
  });

  it("appends to existing dialog params when overlap is true (default)", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=existing");
    // Act
    const result = buildDialogUrl("new-dialog");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toContain("existing");
    expect(url.searchParams.getAll("dialog")).toContain("new-dialog");
  });

  it("treats an empty options object as overlap=true (appends)", () => {
    // Arrange — explicitly confirm the default is append, not replace
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=existing");
    // Act
    const result = buildDialogUrl("new-dialog", {});
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toContain("existing");
    expect(url.searchParams.getAll("dialog")).toContain("new-dialog");
  });

  it("does not duplicate a key that is already in the URL when overlap is true", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=my-dialog");
    // Act
    const result = buildDialogUrl("my-dialog");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toEqual(["my-dialog"]);
  });

  it("replaces all existing dialog params when overlap is false", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=existing");
    // Act
    const result = buildDialogUrl("new-dialog", { overlap: false });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toEqual(["new-dialog"]);
  });

  it("uses a custom dialogParamKey instead of the default 'dialog'", () => {
    // Arrange / Act
    const result = buildDialogUrl("my-dialog", {}, "dlg");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("dlg")).toBe("my-dialog");
    expect(url.searchParams.has("dialog")).toBe(false);
  });

  it("roots the URL at pathName when provided", () => {
    // Arrange / Act
    const result = buildDialogUrl("user-create", { pathName: "/admin/users" });
    // Assert
    expect(result).toBe("/admin/users?dialog=user-create");
  });

  it("serializes props onto a pathName-rooted URL", () => {
    // Arrange / Act
    const result = buildDialogUrl("user-create", {
      props: { tab: "details" },
      pathName: "/admin/users",
    });
    // Assert
    expect(result).toBe(
      "/admin/users?dialog=user-create&user-create.tab=details",
    );
  });

  it("does not merge the current location's params when pathName is provided", () => {
    // Arrange — the current route already has an open dialog
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=existing");
    // Act — building a cross-route link should start from a clean query
    const result = buildDialogUrl("user-create", { pathName: "/admin/users" });
    // Assert
    const url = new URL(result, "http://x");
    expect(url.pathname).toBe("/admin/users");
    expect(url.searchParams.getAll("dialog")).toEqual(["user-create"]);
  });

  it("combines pathName with a custom dialogParamKey", () => {
    // Arrange / Act
    const result = buildDialogUrl("user-create", { pathName: "/admin" }, "dlg");
    // Assert
    expect(result).toBe("/admin?dlg=user-create");
  });
});

// ---------------------------------------------------------------------------
// buildCloseDialogUrl
// ---------------------------------------------------------------------------

describe("buildCloseDialogUrl", () => {
  it('returns "?" (clearing the query, not "") when the closed dialog was the only param', () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=my-dialog");
    // Act
    const result = buildCloseDialogUrl("my-dialog");
    // Assert — "?" clears the query on every navigation path (navigate, Link,
    // pushState); "" would leave the query in place under the pushState fallback
    expect(result).toBe("?");
  });

  it("returns a relative query so the router keeps the current path and basename", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=dialog-a&dialog=dialog-b",
    );
    // Act
    const result = buildCloseDialogUrl("dialog-a");
    // Assert
    expect(result).toBe("?dialog=dialog-b");
  });

  it("removes only the target dialog key, leaving others in place", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=dialog-a&dialog=dialog-b",
    );
    // Act
    const result = buildCloseDialogUrl("dialog-a");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toEqual(["dialog-b"]);
  });

  it("preserves unrelated query params, including names that contain the dialog key", () => {
    // Arrange — closing "user" must keep both "utm_source" and "username"
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=user&user.id=number.9&utm_source=google&username=bob",
    );
    // Act
    const result = buildCloseDialogUrl("user");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("utm_source")).toBe("google");
    expect(url.searchParams.get("username")).toBe("bob");
    expect(url.searchParams.has("user.id")).toBe(false);
    expect(url.searchParams.has("dialog")).toBe(false);
  });

  it("does not drop other dialog keys when the closed key is a substring of 'dialog'", () => {
    // Arrange — single-char "a"; a naive includes() match would wipe "dialog=b"
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=a&dialog=b&keep=1");
    // Act
    const result = buildCloseDialogUrl("a");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toEqual(["b"]);
    expect(url.searchParams.get("keep")).toBe("1");
  });

  it("removes prop params associated with the closed dialog", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=d&d.title=Hi&d.count=number.5",
    );
    // Act
    const result = buildCloseDialogUrl("d");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.has("d.title")).toBe(false);
    expect(url.searchParams.has("d.count")).toBe(false);
  });

  it("preserves props of other dialogs when closing one", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=a&dialog=b&a.title=ForA&b.title=ForB",
    );
    // Act
    const result = buildCloseDialogUrl("a");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.get("b.title")).toBe("ForB");
  });

  it("uses a custom dialogParamKey", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dlg=my-dialog");
    // Act
    const result = buildCloseDialogUrl("my-dialog", "dlg");
    // Assert
    expect(result).toBe("?");
  });
});

// ---------------------------------------------------------------------------
// buildCloseAllDialogsUrl
// ---------------------------------------------------------------------------

describe("buildCloseAllDialogsUrl", () => {
  it('returns "?" when only dialog params are present', () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=a&dialog=b");
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert — relative "?" so the router stays on the current path/basename and
    // the query is reliably cleared (unlike "", which the pushState fallback and
    // `<a href="">` resolve to the current/origin URL with the query intact)
    expect(result).toBe("?");
  });

  it("removes every dialog key and its props but keeps unrelated query params", () => {
    // Arrange — two open dialogs with props, alongside unrelated params
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=a&dialog=b&a.id=number.1&b.title=Hi&utm_source=google&tab=2",
    );
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.has("dialog")).toBe(false);
    expect(url.searchParams.has("a.id")).toBe(false);
    expect(url.searchParams.has("b.title")).toBe(false);
    expect(url.searchParams.get("utm_source")).toBe("google");
    expect(url.searchParams.get("tab")).toBe("2");
  });

  it("preserves an unrelated param whose name contains a dialog key", () => {
    // Arrange — closing the "user" dialog must keep "username"
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=user&username=bob");
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.has("dialog")).toBe(false);
    expect(url.searchParams.get("username")).toBe("bob");
  });

  it("uses a custom dialogParamKey", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dlg=a&dlg=b&keep=1");
    // Act
    const result = buildCloseAllDialogsUrl("dlg");
    // Assert — only the custom-keyed dialog params are stripped
    const url = new URL(result, "http://x");
    expect(url.searchParams.has("dlg")).toBe(false);
    expect(url.searchParams.get("keep")).toBe("1");
  });
});

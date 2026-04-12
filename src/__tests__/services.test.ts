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
  getLocationPathname: vi.fn(() => "/"),
}));

import { getLocationSearch, getLocationPathname } from "../browser";

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
    // Arrange — uses realistic keys to avoid the substring-match edge case in prop cleanup
    const search = "?dialog=dialog-a&dialog=dialog-b";
    // Act
    const result = cleanUpQueryParams(search, "dialog", "dialog-a");
    // Assert
    const params = new URLSearchParams(result);
    expect(params.getAll("dialog")).toEqual(["dialog-b"]);
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
    vi.mocked(getLocationPathname).mockReturnValue("/app");
  });

  it("builds a URL with the dialog key in the query string", () => {
    // Arrange / Act
    const result = buildDialogUrl("my-dialog");
    // Assert
    expect(result).toBe("/app?dialog=my-dialog");
  });

  it("uses the provided pathName option over the current pathname", () => {
    // Arrange / Act
    const result = buildDialogUrl("d", { pathName: "/custom" });
    // Assert
    expect(result).toContain("/custom?");
    expect(result).toContain("dialog=d");
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
});

// ---------------------------------------------------------------------------
// buildCloseDialogUrl
// ---------------------------------------------------------------------------

describe("buildCloseDialogUrl", () => {
  beforeEach(() => {
    vi.mocked(getLocationPathname).mockReturnValue("/app");
  });

  it("returns just the pathname when the closed dialog was the only param", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=my-dialog");
    // Act
    const result = buildCloseDialogUrl("my-dialog");
    // Assert
    expect(result).toBe("/app");
  });

  it("removes only the target dialog key, leaving others in place", () => {
    // Arrange — uses realistic keys to avoid the substring-match edge case in prop cleanup
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=dialog-a&dialog=dialog-b");
    // Act
    const result = buildCloseDialogUrl("dialog-a");
    // Assert
    const url = new URL(result, "http://x");
    expect(url.searchParams.getAll("dialog")).toEqual(["dialog-b"]);
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
    expect(result).toBe("/app");
  });
});

// ---------------------------------------------------------------------------
// buildCloseAllDialogsUrl
// ---------------------------------------------------------------------------

describe("buildCloseAllDialogsUrl", () => {
  beforeEach(() => {
    vi.mocked(getLocationPathname).mockReturnValue("/app");
  });

  it("returns just the pathname, stripping all query params", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=a&dialog=b&a.title=Hi",
    );
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    expect(result).toBe("/app");
  });

  it("returns the pathname when there are no params to begin with", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("");
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    expect(result).toBe("/app");
  });

  it("removes unrelated query params too — total cleanup behaviour", () => {
    // Arrange — buildCloseAllDialogsUrl deletes everything, not just dialog params
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=a&utm_source=google",
    );
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    expect(result).toBe("/app");
  });

  it("uses a custom dialogParamKey", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dlg=a&dlg=b");
    // Act
    const result = buildCloseAllDialogsUrl("dlg");
    // Assert
    expect(result).toBe("/app");
  });
});

import * as lib from "../index";

describe("public API surface", () => {
  it("exports DialogsValveProvider", () => {
    expect(typeof lib.DialogsValveProvider).toBe("function");
  });

  it("exports useDialogsValve", () => {
    expect(typeof lib.useDialogsValve).toBe("function");
  });

  it("exports buildDialogUrl", () => {
    expect(typeof lib.buildDialogUrl).toBe("function");
  });

  it("exports buildCloseDialogUrl", () => {
    expect(typeof lib.buildCloseDialogUrl).toBe("function");
  });

  it("exports buildCloseAllDialogsUrl", () => {
    expect(typeof lib.buildCloseAllDialogsUrl).toBe("function");
  });

  it("exports extractDialogProps", () => {
    expect(typeof lib.extractDialogProps).toBe("function");
  });

  it("exports getActiveDialogKeys", () => {
    expect(typeof lib.getActiveDialogKeys).toBe("function");
  });

  it("exports cleanUpQueryParams", () => {
    expect(typeof lib.cleanUpQueryParams).toBe("function");
  });

  it("exports validateDialogKeys", () => {
    expect(typeof lib.validateDialogKeys).toBe("function");
  });

  it("exports parsePropValue", () => {
    expect(typeof lib.parsePropValue).toBe("function");
  });

  it("exports DIALOG_MAIN_KEY", () => {
    expect(lib.DIALOG_MAIN_KEY).toBe("dialog");
  });

  it("exports DIALOG_DELAY_TO_CLOSE", () => {
    expect(typeof lib.DIALOG_DELAY_TO_CLOSE).toBe("number");
  });

  it("does not export initDialogsValve", () => {
    expect("initDialogsValve" in lib).toBe(false);
  });
});

/**
 * Default query param key used to identify the active dialog.
 * e.g. `?dlg=my-dialog`
 *
 * Can be overridden via `DialogsValveConfig.dialogParamKey`.
 */
export const DIALOG_MAIN_KEY = "dlg";

/**
 * Default delay (in milliseconds) before unmounting a dialog after close.
 * This gives close animations time to play before the component is removed from the DOM.
 *
 * Can be overridden via `DialogsValveConfig.closeDelay`.
 */
export const DIALOG_DELAY_TO_CLOSE = 300;

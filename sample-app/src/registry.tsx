import { DialogMap, createDialogsValve } from "@dialogs-valve/react";

import DrawerContent1 from "./components/DrawerContent/DrawerContent1";
import DrawerContent2 from "./components/DrawerContent/DrawerContent2";
import DrawerContent3 from "./components/DrawerContent/DrawerContent3";
import DrawerContent4 from "./components/DrawerContent/DrawerContent4";
import DrawerContent5 from "./components/DrawerContent/DrawerContent5";
import DrawerContent6 from "./components/DrawerContent/DrawerContent6";
import DrawerContent7 from "./components/DrawerContent/DrawerContent7";
import DrawerContent8 from "./components/DrawerContent/DrawerContent8";
import DrawerContent9 from "./components/DrawerContent/DrawerContent9";
import DrawerContent10 from "./components/DrawerContent/DrawerContent10";
import DrawerContent11 from "./components/DrawerContent/DrawerContent11";
import DrawerContent12 from "./components/DrawerContent/DrawerContent12";

export const dialogs = {
  "drawer-1": { Component: DrawerContent1 },
  "drawer-2": { Component: DrawerContent2 },
  "drawer-3": { Component: DrawerContent3 },
  "drawer-4": { Component: DrawerContent4 },
  "drawer-5": { Component: DrawerContent5 },
  "drawer-6": { Component: DrawerContent6 },
  "drawer-7": { Component: DrawerContent7 },
  "drawer-8": { Component: DrawerContent8 },
  "drawer-9": { Component: DrawerContent9 },
  "drawer-10": { Component: DrawerContent10 },
  "drawer-11": { Component: DrawerContent11 },
  "drawer-12": { Component: DrawerContent12 },
} as const satisfies DialogMap;

export type AppDialogKeys = keyof typeof dialogs;

export const { useDialogs } = createDialogsValve<AppDialogKeys>();

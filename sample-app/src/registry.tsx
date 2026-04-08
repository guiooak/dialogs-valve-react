import { DialogMap, createDialogsValve } from "@dialogs-valve/react";

import Drawer from "./components/Drawer";
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
  "drawer-1": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Welcome Drawer">
        <DrawerContent1 />
      </Drawer>
    ),
  },
  "drawer-2": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Feature List">
        <DrawerContent2 />
      </Drawer>
    ),
  },
  "drawer-3": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Statistics">
        <DrawerContent3 />
      </Drawer>
    ),
  },
  "drawer-4": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Settings">
        <DrawerContent4 />
      </Drawer>
    ),
  },
  "drawer-5": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="About">
        <DrawerContent5 />
      </Drawer>
    ),
  },
  "drawer-6": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Contact">
        <DrawerContent6 />
      </Drawer>
    ),
  },
  "drawer-7": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Quick Tips">
        <DrawerContent7 />
      </Drawer>
    ),
  },
  "drawer-8": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Recent Activity">
        <DrawerContent8 />
      </Drawer>
    ),
  },
  "drawer-9": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="FAQ">
        <DrawerContent9 />
      </Drawer>
    ),
  },
  "drawer-10": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Final Message">
        <DrawerContent10 />
      </Drawer>
    ),
  },
  "drawer-11": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="System Status">
        <DrawerContent11 />
      </Drawer>
    ),
  },
  "drawer-12": {
    Component: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
      <Drawer open={open} onClose={onClose} title="Resources">
        <DrawerContent12 />
      </Drawer>
    ),
  },
} as const satisfies DialogMap;

export type AppDialogKeys = keyof typeof dialogs;

export const { useDialogs } = createDialogsValve<AppDialogKeys>();

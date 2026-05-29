import type { DialogMap } from "@dialogs-valve/react";

import HelloModal from "./dialogs/basic/HelloModal";
import InfoDrawer from "./dialogs/basic/InfoDrawer";
import TipRollover from "./dialogs/basic/TipRollover";
import OverlapDrawerA from "./dialogs/overlap/OverlapDrawerA";
import OverlapDrawerB from "./dialogs/overlap/OverlapDrawerB";
import ReplacementDrawerA from "./dialogs/replacement/ReplacementDrawerA";
import ReplacementDrawerB from "./dialogs/replacement/ReplacementDrawerB";
import UserProfileDrawer from "./dialogs/props/UserProfileDrawer";
import PublicInfoDrawer from "./dialogs/permissions/PublicInfoDrawer";
import AdminPanelDrawer from "./dialogs/permissions/AdminPanelDrawer";
import CrossRouteDrawer from "./dialogs/cross-route/CrossRouteDrawer";

export type AppPermissions = { isAdmin: boolean };

export const dialogs = {
  "hello-modal": { Component: HelloModal },
  "info-drawer": { Component: InfoDrawer },
  "tip-rollover": { Component: TipRollover },
  "overlap-drawer-a": { Component: OverlapDrawerA },
  "overlap-drawer-b": { Component: OverlapDrawerB },
  "replacement-a": { Component: ReplacementDrawerA },
  "replacement-b": { Component: ReplacementDrawerB },
  "user-profile": { Component: UserProfileDrawer },
  "public-info": { Component: PublicInfoDrawer },
  "admin-panel": {
    Component: AdminPanelDrawer,
    canShow: (p: AppPermissions) => p.isAdmin,
  },
  "cross-route-drawer": { Component: CrossRouteDrawer },
} as const satisfies DialogMap<string, AppPermissions>;

declare module "@dialogs-valve/react" {
  interface DialogsValveRegistry {
    dialogs: typeof dialogs;
  }
}

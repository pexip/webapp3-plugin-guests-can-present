import { RPCCallPayload } from "@pexip/plugin-api";
import { toolbarIconActive } from "./toolbarIcon";

export const ToolbarButton = (state: boolean): RPCCallPayload<"ui:button:add"> => ({
    position: "toolbar",
    icon: { custom: toolbarIconActive }, // Use a valid icon name or custom icon object
    tooltip: (state ? "Disable" : "Enable") + " screen sharing for guests",
    roles: ['chair'],
    isActive: state,
})
import {
  registerPlugin,
} from "@pexip/plugin-api";
import { ToolbarButton } from "./forms";

let guests_can_present: boolean | undefined = undefined;

let initialized = false;

let role: undefined | 'guest' | 'chair';

// Register the plugin with the Pexip Infinity Plugin API
const plugin = await registerPlugin({
  id: "webapp3-plugin-guests-can-present",
  version: 1,
});

// Get the current participant's role
plugin.events.me.add(async (me) => {
  role = me.participant.role;
})

// Create a toolbar button to toggle guest presentation rights
// The button will be enabled or disabled based on the guests_can_present variable
// and will send a request to the conference to change the setting when clicked
const init = async () => {

  const toggleGuestCanPresentationButton = await plugin.ui.addButton(
    ToolbarButton(guests_can_present === true),
  );

  plugin.events.conferenceStatus.add(async ({ status }) => {

    if (toggleGuestCanPresentationButton === undefined) {
      return;
    }

    if (guests_can_present != (status.rawData as any)?.guests_can_present && role === "chair") {
      guests_can_present = (status.rawData as any)?.guests_can_present as boolean;
      plugin.ui.showToast({
        message:
          `Guests can ${guests_can_present ? "now" : "no longer"
          } present`,
      });
    }

    if (guests_can_present !== undefined) {
      toggleGuestCanPresentationButton.update(ToolbarButton(guests_can_present));
    }

  });

  // Request is not part of the plugin API, so we need to use the conference.sendRequest method
  toggleGuestCanPresentationButton.onClick.add(async () => {
    const payload = {
      path: "set_guests_can_present",
      method: "POST",
      payload: { "setting": !guests_can_present },
    };

    await plugin.conference.sendRequest(payload);

  });

}

// Initialize the plugin when the conference status is received
// This is necessary to ensure that the guests_can_present variable is set
// and the toolbar button is created only once the conference status is available.
// When no guest_cam_present os undefined, we do not initialize the plugin (e.g. direct media or < v38)
plugin.events.conferenceStatus.add(async ({ status }) => {

  if (!initialized && (status.rawData as any)?.guests_can_present !== undefined) {
    guests_can_present = (status.rawData as any)?.guests_can_present as boolean;
    initialized = true;
    await init();
  }

}); 
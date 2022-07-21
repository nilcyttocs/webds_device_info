import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { deviceInfoIcon } from "./icons";

import { DeviceInfoWidget } from "./widget_container";

namespace Attributes {
  export const command = "webds_device_info:open";
  export const id = "webds_device_info_widget";
  export const label = "Device Info";
  export const caption = "Device Info";
  export const category = "Touch - Assessment";
  export const rank = 40;
}

/**
 * Initialization data for the @webds/device_info extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/device_info:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/device_info is activated!");

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? deviceInfoIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new DeviceInfoWidget(service);
          widget = new WebDSWidget<DeviceInfoWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = deviceInfoIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;

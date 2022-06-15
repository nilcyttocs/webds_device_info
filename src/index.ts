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
    const command: string = "webds_device_info:open";
    commands.addCommand(command, {
      label: "Device Info",
      caption: "Device Info",
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? deviceInfoIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new DeviceInfoWidget(app, service);
          widget = new WebDSWidget<DeviceInfoWidget>({ content });
          widget.id = "webds_device_info_widget";
          widget.title.label = "Device Info";
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
      category: "WebDS - Exploration"
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: "webds_device_info"
    });
    restorer.restore(tracker, {
      command,
      name: () => "webds_device_info"
    });
  }
};

export default plugin;

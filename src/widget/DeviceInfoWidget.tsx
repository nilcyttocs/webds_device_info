import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import DeviceInfoComponent from "./DeviceInfoComponent";

export class DeviceInfoWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    webdsService = this.service;
    return (
      <div id={this.id + "_component"}>
        <DeviceInfoComponent />
      </div>
    );
  }
}

export default DeviceInfoWidget;

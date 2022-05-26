import React, { useEffect, useState } from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import Alert from "@mui/material/Alert";

import Button from "@mui/material/Button";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import { WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { requestAPI } from "./handler";

let alertMessage = "";

const alertMessageIdentify = "Failed to read identify report from device.";

const alertMessageAppInfo = "Failed to read application info from device.";

const alertMessageBootInfo = "Failed to read bootloader info from device.";

const alertMessageUnknownMode = "Unknown firmware mode.";

const getIdentify = async (): Promise<any> => {
  try {
    return await requestAPI<any>("command?query=identify");
  } catch (error) {
    console.error(`Error - GET /webds/command?query=identify\n${error}`);
    return Promise.reject("Failed to get Identify report");
  }
};

const getAppInfo = async (): Promise<any> => {
  try {
    return await requestAPI<any>("command?query=getAppInfo");
  } catch (error) {
    console.error(`Error - GET /webds/command?query=getAppInfo\n${error}`);
    return Promise.reject("Failed to get Application Info");
  }
};

const getBootInfo = async (): Promise<any> => {
  try {
    return await requestAPI<any>("command?query=getBootInfo");
  } catch (error) {
    console.error(`Error - GET /webds/command?query=getBootInfo\n${error}`);
    return Promise.reject("Failed to get Bootloader Info");
  }
};

const DeviceInfoContainer = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [identify, setIdentify] = useState<any>({});
  const [modeInfo, setModeInfo] = useState<any>({});

  const getData = async () => {
    setAlert(false);
    let identifyReport: any;
    try {
      identifyReport = await getIdentify();
      setIdentify(identifyReport);
    } catch (error) {
      console.error(error);
      alertMessage = alertMessageIdentify;
      setAlert(true);
      setInitialized(false);
      return;
    }
    if (identifyReport.mode === "application") {
      try {
        const info = await getAppInfo();
        setModeInfo(info);
      } catch (error) {
        console.error(error);
        alertMessage = alertMessageAppInfo;
        setAlert(true);
        setInitialized(false);
        return;
      }
    } else if (identifyReport.mode === "bootloader") {
      try {
        const info = await getBootInfo();
        setModeInfo(info);
      } catch (error) {
        console.error(error);
        alertMessage = alertMessageBootInfo;
        setAlert(true);
        setInitialized(false);
        return;
      }
    } else {
      console.error("Unknown firmware mode");
      alertMessage = alertMessageUnknownMode;
      setAlert(true);
      setInitialized(false);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    getData();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
        {initialized ? (
          <Landing identify={identify} modeInfo={modeInfo} getData={getData} />
        ) : (
          <>
            {alert ? (
              <>
                <Alert
                  severity="error"
                  onClose={() => setAlert(false)}
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {alertMessage}
                </Alert>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <Button
                    onClick={(event) => getData()}
                    sx={{ width: "100px" }}
                  >
                    Refresh
                  </Button>
                </div>
              </>
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)"
                }}
              >
                <CircularProgress color="primary" />
              </div>
            )}
          </>
        )}
      </ThemeProvider>
    </div>
  );
};

export class DeviceInfoWidget extends ReactWidget {
  frontend: JupyterFrontEnd | null = null;
  service: WebDSService | null = null;

  constructor(app: JupyterFrontEnd, service: WebDSService) {
    super();
    this.frontend = app;
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div className="jp-webds-widget">
        <DeviceInfoContainer frontend={this.frontend} service={this.service} />
      </div>
    );
  }
}

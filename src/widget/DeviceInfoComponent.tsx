import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Landing from "./Landing";

import { requestAPI } from "../handler";

let alertMessage = "";

const alertMessageIdentify = "Failed to read identify report from device.";

const alertMessageAppInfo = "Failed to read application info from device.";

const alertMessageBootInfo = "Failed to read bootloader info from device.";

const alertMessageUnknownMode = "Unknown firmware mode.";

const getIdentify = async (): Promise<any> => {
  const dataToSend: any = {
    command: "identify"
  };
  try {
    return await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to get Identify report");
  }
};

const getAppInfo = async (): Promise<any> => {
  const dataToSend: any = {
    command: "getAppInfo"
  };
  try {
    return await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to get Application Info");
  }
};

const getBootInfo = async (): Promise<any> => {
  const dataToSend: any = {
    command: "getBootInfo"
  };
  try {
    return await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to get Bootloader Info");
  }
};

export const DeviceInfoComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [identify, setIdentify] = useState<any>({});
  const [modeInfo, setModeInfo] = useState<any>({});

  const getData = async () => {
    setAlert(false);
    setInitialized(false);
    let identifyReport: any;
    try {
      identifyReport = await getIdentify();
      setIdentify(identifyReport);
    } catch (error) {
      console.error(error);
      alertMessage = alertMessageIdentify;
      setAlert(true);
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
        return;
      }
    } else {
      console.error("Unknown firmware mode");
      alertMessage = alertMessageUnknownMode;
      setAlert(true);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    getData();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert && (
            <Alert
              severity="error"
              onClose={() => setAlert(false)}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {alertMessage}
            </Alert>
          )}
          {initialized && (
            <Landing
              identify={identify}
              modeInfo={modeInfo}
              getData={getData}
              external={props.service.pinormos.isExternal()}
            />
          )}
        </div>
        {!initialized && (
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
      </ThemeProvider>
    </>
  );
};

export default DeviceInfoComponent;

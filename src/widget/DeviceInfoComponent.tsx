import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Landing from "./Landing";

import { webdsService } from "./local_exports";

import {
  ALERT_MESSAGE_IDENTIFY,
  ALERT_MESSAGE_APP_INFO,
  ALERT_MESSAGE_BOOT_INFO,
  ALERT_MESSAGE_UNKNOWN_MODE
} from "./constants";

import { requestAPI } from "../handler";

let alertMessage = "";

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

  const webdsTheme = webdsService.ui.getWebDSTheme();

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const getData = async () => {
    setAlert(false);
    setInitialized(false);
    let identifyReport: any;
    try {
      identifyReport = await getIdentify();
      setIdentify(identifyReport);
    } catch (error) {
      console.error(error);
      showAlert(ALERT_MESSAGE_IDENTIFY);
      return;
    }
    if (identifyReport.mode === "application") {
      try {
        const info = await getAppInfo();
        setModeInfo(info);
      } catch (error) {
        console.error(error);
        showAlert(ALERT_MESSAGE_APP_INFO);
        return;
      }
    } else if (identifyReport.mode === "bootloader") {
      try {
        const info = await getBootInfo();
        setModeInfo(info);
      } catch (error) {
        console.error(error);
        showAlert(ALERT_MESSAGE_BOOT_INFO);
        return;
      }
    } else {
      console.error("Unknown firmware mode");
      showAlert(ALERT_MESSAGE_UNKNOWN_MODE);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    getData();
  }, []);

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
              external={webdsService.pinormos.isExternal()}
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

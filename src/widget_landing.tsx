import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@mui/material/Typography";

import { requestAPI } from "./handler";

import { synaLogo } from "./syna_logo";

let alertMessage = "";

const alertMessageEnterBootloader = "Failed to enter bootloader mode.";

const alertMessageRunApplicationFW = "Failed to run application firmware.";

const L_WIDTH = 350;
const R_WIDTH = 550;
const TOTAL_WIDTH = L_WIDTH + R_WIDTH;

const CHIP_WIDTH = 180;

const toHex = (str: string): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

const camelCaseToTitleCase = (camel: string): string => {
  let title = camel.replace(/([a-z])([A-Z])/g, "$1 $2");
  title = title.replace(/([A-Z])([A-Z])([a-z])/g, "$1 $2$3");
  title = title.replace(/^Id /, "ID ");
  title = title.replace(/ Id /g, " ID ");
  title = title.replace(/ Id$/, " ID");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const enterBootloader = async (): Promise<any> => {
  try {
    return await requestAPI<any>("command?query=enterBootloaderMode");
  } catch (error) {
    console.error(
      `Error - GET /webds/command?query=enterBootloaderMode\n${error}`
    );
    return Promise.reject("Failed to enter bootloader mode");
  }
};

const runApplicationFW = async (): Promise<any> => {
  try {
    return await requestAPI<any>("command?query=runApplicationFirmware");
  } catch (error) {
    console.error(
      `Error - GET /webds/command?query=runApplicationFirmware\n${error}`
    );
    return Promise.reject("Failed to run application firmware");
  }
};

export const Landing = (props: any): JSX.Element => {
  const [alert, setAlert] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("");
  const [partNumber, setPartNumber] = useState<string>("");

  const handleModeButtonClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (mode === "application") {
      try {
        await enterBootloader();
        setMode("bootloader");
      } catch (error) {
        console.error(error);
        alertMessage = alertMessageEnterBootloader;
        setAlert(true);
        return;
      }
    } else if (props.identify.mode === "bootloader") {
      try {
        await runApplicationFW();
        setMode("application");
      } catch (error) {
        console.error(error);
        alertMessage = alertMessageRunApplicationFW;
        setAlert(true);
        return;
      }
    }
    props.getData();
  };

  const generateIdentifyData = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    output.push(
      <ListItem key="buildID" sx={{ padding: "1px 0px" }}>
        <ListItemText
          primary={"Build ID: " + props.identify.buildID}
          primaryTypographyProps={{
            variant: "body1",
            sx: { fontWeight: "bold" }
          }}
        />
      </ListItem>
    );
    output.push(
      <ListItem key="partNumber" sx={{ padding: "1px 0px" }}>
        <ListItemText
          primary={
            "Part Number: " + props.identify.partNumber.replace(/\0/g, "")
          }
          primaryTypographyProps={{
            variant: "body1",
            sx: { fontWeight: "bold" }
          }}
        />
      </ListItem>
    );
    for (let [key, value] of Object.entries(props.identify)) {
      if (key === "buildID" || key === "partNumber") {
        continue;
      }
      if (typeof value === "string") {
        value = value.replace(/\0/g, "");
      }
      output.push(
        <ListItem key={key} sx={{ padding: "1px 0px" }}>
          <ListItemText
            primary={camelCaseToTitleCase(key) + ": " + value}
            primaryTypographyProps={{ variant: "body1" }}
          />
        </ListItem>
      );
    }
    return output;
  };

  const generateModeInfoData = (): JSX.Element[] => {
    const modeTitle = mode.charAt(0).toUpperCase() + mode.slice(1);
    const output: JSX.Element[] = [];
    output.push(
      <ListItem key={modeTitle + " Information"} sx={{ padding: "1px 0px" }}>
        <ListItemText
          primary={modeTitle + " Information"}
          primaryTypographyProps={{
            variant: "h5",
            sx: { fontWeight: "bold" }
          }}
        />
      </ListItem>
    );
    for (let [key, value] of Object.entries(props.modeInfo)) {
      if (typeof value === "string") {
        value = value.replace(/\0/g, "");
      }
      if (key === "customerConfigId") {
        continue;
      }
      output.push(
        <ListItem key={key} sx={{ padding: "1px 0px" }}>
          <ListItemText
            primary={camelCaseToTitleCase(key) + ": " + value}
            primaryTypographyProps={{ variant: "body1" }}
          />
        </ListItem>
      );
    }
    if (mode === "application") {
      output.push(
        <ListItem key="customerConfigId" sx={{ padding: "1px 0px" }}>
          <ListItemText
            primary={
              "Customer Config ID: " + toHex(props.modeInfo.customerConfigId)
            }
            primaryTypographyProps={{
              variant: "body1"
            }}
          />
        </ListItem>
      );
    }
    return output;
  };

  useEffect(() => {
    const partNumber = props.identify.partNumber
      .toUpperCase()
      .replace(/\0/g, "")
      .split("-")[0]
      .split(" ")[0];
    setPartNumber(partNumber);
    setMode(props.identify.mode);
  }, [props.identify]);

  return (
    <>
      {alert ? (
        <Alert
          severity="error"
          onClose={() => setAlert(false)}
          sx={{ marginBottom: "16px", whiteSpace: "pre-wrap" }}
        >
          {alertMessage}
        </Alert>
      ) : null}
      <Stack
        spacing={2}
        divider={
          <Divider
            orientation="horizontal"
            sx={{ width: TOTAL_WIDTH + "px" }}
          />
        }
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <div
            style={{
              minWidth: L_WIDTH + "px",
              maxWidth: L_WIDTH + "px"
            }}
          >
            <div style={{ paddingLeft: "60px" }}>
              <div
                style={{
                  position: "relative",
                  width: CHIP_WIDTH + "px",
                  height: CHIP_WIDTH + "px",
                  marginTop: "20px"
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: 1,
                    borderRadius: 2,
                    borderColor: "gray",
                    backgroundColor: "black"
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "35%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  {synaLogo}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "75%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <Typography variant="h5" sx={{ color: "white" }}>
                    {partNumber}
                  </Typography>
                </div>
              </div>
              <div
                style={{
                  paddingTop: "20px"
                }}
              >
                <List dense>{generateIdentifyData()}</List>
              </div>
            </div>
          </div>
          <div
            style={{
              minWidth: R_WIDTH + "px",
              maxWidth: R_WIDTH + "px"
            }}
          >
            <div
              style={{
                paddingLeft: "60px"
              }}
            >
              <List dense>{generateModeInfoData()}</List>
            </div>
          </div>
        </Stack>
        <div
          style={{
            width: TOTAL_WIDTH + "px",
            position: "relative"
          }}
        >
          <div
            style={{
              width: L_WIDTH * 2 + "px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Button
              onClick={(event) => props.getData()}
              sx={{ width: "100px" }}
            >
              Refresh
            </Button>
          </div>
          <Button
            variant="text"
            onClick={(event) => handleModeButtonClick(event)}
            sx={{
              position: "absolute",
              top: "0px",
              right: "0px"
            }}
          >
            {mode === "application" ? (
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Bootloader Mode
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Application Mode
              </Typography>
            )}
          </Button>
        </div>
      </Stack>
    </>
  );
};

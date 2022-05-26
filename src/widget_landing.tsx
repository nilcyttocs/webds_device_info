import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@mui/material/Typography";

import { synaLogo } from "./syna_logo";

const TOTAL_WIDTH = 700;
const WIDTH = TOTAL_WIDTH / 2;

const camelCaseToTitleCase = (camel: string): string => {
  let title = camel.replace(/([a-z])([A-Z])/g, "$1 $2");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

export const Landing = (props: any): JSX.Element => {
  const [partNumber, setPartNumber] = useState<string>("");

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
          primary={"Part Number: " + props.identify.partNumber}
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
    let mode: string = props.identify.mode;
    mode = mode.charAt(0).toUpperCase() + mode.slice(1);
    const output: JSX.Element[] = [];
    output.push(
      <ListItem key={mode + " Information"} sx={{ padding: "1px 0px" }}>
        <ListItemText
          primary={mode + " Information"}
          primaryTypographyProps={{
            variant: "h5",
            sx: { fontWeight: "bold" }
          }}
        />
      </ListItem>
    );
    for (let [key, value] of Object.entries(props.modeInfo)) {
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

  useEffect(() => {
    const partNumber = props.identify.partNumber
      .toUpperCase()
      .replace(/\0/g, "")
      .split("-")[0]
      .split(" ")[0];
    setPartNumber(partNumber);
  }, [props.identify]);

  return (
    <>
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
              minWidth: WIDTH + "px",
              maxWidth: WIDTH + "px"
            }}
          >
            <div style={{ width: "50%", margin: "0 auto" }}>
              <div
                style={{
                  position: "relative",
                  width: 180 + "px",
                  height: 180 + "px",
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
                  <Typography variant="h6" sx={{ color: "white" }}>
                    {partNumber}
                  </Typography>
                </div>
              </div>
            </div>
            <div
              style={{
                paddingTop: "20px",
                paddingLeft: "60px"
              }}
            >
              <List dense>{generateIdentifyData()}</List>
            </div>
          </div>
          <div
            style={{
              minWidth: WIDTH + "px",
              maxWidth: WIDTH + "px"
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
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button onClick={(event) => props.getData()} sx={{ width: "100px" }}>
            Refresh
          </Button>
        </div>
      </Stack>
    </>
  );
};

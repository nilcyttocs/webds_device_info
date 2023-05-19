import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  ALERT_MESSAGE_ENTER_BOOTLOADER,
  ALERT_MESSAGE_RUN_APPLICATION_FW,
  CHIP_WIDTH,
  PACKRAT_LINK,
  WIDTH
} from './constants';
import { requestAPI } from './local_exports';
import { Canvas } from './mui_extensions/Canvas';
import {
  CANVAS_ATTRS,
  ContentAttrs,
  getContentAttrs
} from './mui_extensions/constants';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';
import SynaLogo from './SynaLogo';

const contentAttrs: ContentAttrs = getContentAttrs(WIDTH);

const toHex = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

const camelCaseToTitleCase = (camel: string): string => {
  let title = camel.replace(/([a-z])([A-Z])/g, '$1 $2');
  title = title.replace(/([A-Z])([A-Z])([a-z])/g, '$1 $2$3');
  title = title.replace(/^Id /, 'ID ');
  title = title.replace(/ Id /g, ' ID ');
  title = title.replace(/ Id$/, ' ID');
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const enterBootloader = async (): Promise<any> => {
  try {
    return await requestAPI<any>('command?query=enterBootloaderMode');
  } catch (error) {
    console.error(
      `Error - GET /webds/command?query=enterBootloaderMode\n${error}`
    );
    return Promise.reject('Failed to enter bootloader mode');
  }
};

const runApplicationFW = async (): Promise<any> => {
  try {
    return await requestAPI<any>('command?query=runApplicationFirmware');
  } catch (error) {
    console.error(
      `Error - GET /webds/command?query=runApplicationFirmware\n${error}`
    );
    return Promise.reject('Failed to run application firmware');
  }
};

export const Landing = (props: any): JSX.Element => {
  const [mode, setMode] = useState<string>('');

  const modeTitle =
    mode.charAt(0).toUpperCase() + mode.slice(1) + ' Information';

  const handleModeButtonClick = async () => {
    if (mode === 'application') {
      try {
        await enterBootloader();
      } catch (error) {
        console.error(error);
        props.setAlert(ALERT_MESSAGE_ENTER_BOOTLOADER);
        return;
      }
    } else if (props.identify.mode === 'bootloader') {
      try {
        await runApplicationFW();
      } catch (error) {
        console.error(error);
        props.setAlert(ALERT_MESSAGE_RUN_APPLICATION_FW);
        return;
      }
    }
    props.getData();
  };

  const handlePackratButtonClick = () => {
    window.open(PACKRAT_LINK + props.identify.buildID, '_blank')?.focus();
  };

  const generateIdentifyData = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    output.push(
      <ListItem key="buildID" sx={{ padding: '1px 0px' }}>
        <ListItemText
          primary={'Build ID: ' + props.identify.buildID}
          primaryTypographyProps={{
            variant: 'body1',
            sx: { fontWeight: 'bold' }
          }}
        />
      </ListItem>
    );
    output.push(
      <ListItem key="partNumber" sx={{ padding: '1px 0px' }}>
        <ListItemText
          primary={'Part Number: ' + props.partNumber}
          primaryTypographyProps={{
            variant: 'body1',
            sx: { fontWeight: 'bold' }
          }}
        />
      </ListItem>
    );
    for (let [key, value] of Object.entries(props.identify)) {
      if (key === 'buildID' || key === 'partNumber') {
        continue;
      }
      if (typeof value === 'string') {
        value = value.replace(/\0/g, '');
      }
      output.push(
        <ListItem key={key} sx={{ padding: '1px 0px' }}>
          <ListItemText
            primary={camelCaseToTitleCase(key) + ': ' + value}
            primaryTypographyProps={{ variant: 'body1' }}
          />
        </ListItem>
      );
    }
    return output;
  };

  const generateModeInfoData = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    for (let [key, value] of Object.entries(props.modeInfo)) {
      if (typeof value === 'string') {
        value = value.replace(/\0/g, '');
      }
      if (key === 'customerConfigId') {
        continue;
      }
      output.push(
        <ListItem key={key} sx={{ padding: '1px 0px' }}>
          <ListItemText
            primary={camelCaseToTitleCase(key) + ': ' + value}
            primaryTypographyProps={{ variant: 'body1' }}
          />
        </ListItem>
      );
    }
    if (mode === 'application') {
      output.push(
        <ListItem key="customerConfigId" sx={{ padding: '1px 0px' }}>
          <ListItemText
            primary={
              'Customer Config ID: ' + toHex(props.modeInfo.customerConfigId)
            }
            primaryTypographyProps={{
              variant: 'body1'
            }}
          />
        </ListItem>
      );
    }
    return output;
  };

  useEffect(() => {
    setMode(props.identify.mode);
  }, [props.identify]);

  return (
    <Canvas title={modeTitle} width={WIDTH}>
      <Content>
        <Stack
          spacing={contentAttrs.PANEL_SPACING}
          direction="row"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                minHeight:
                  CANVAS_ATTRS.MIN_HEIGHT_CONTENT -
                  CANVAS_ATTRS.PADDING * 2 +
                  'px'
              }}
            />
          }
        >
          <div
            style={{
              width: contentAttrs.PANEL_WIDTH + 'px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Stack spacing={2} direction="column" alignItems="left">
              <div
                style={{
                  width: CHIP_WIDTH + 'px',
                  height: CHIP_WIDTH + 'px',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: 1,
                    borderRadius: 3,
                    borderColor: 'gray',
                    backgroundColor: 'black'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {SynaLogo}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '75%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Typography variant="h5" sx={{ color: 'white' }}>
                    {props.partNumber.split('-')[0]}
                  </Typography>
                </div>
              </div>
              <List>{generateIdentifyData()}</List>
            </Stack>
          </div>
          <div style={{ width: contentAttrs.PANEL_WIDTH + 'px' }}>
            <List
              sx={{
                padding: '0px',
                '& .MuiListItemText-root': {
                  marginTop: '0px'
                }
              }}
            >
              {generateModeInfoData()}
            </List>
          </div>
        </Stack>
      </Content>
      <Controls
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Button onClick={() => props.getData()} sx={{ width: '150px' }}>
          Refresh
        </Button>
        {!props.external && (
          <Button
            variant="text"
            onClick={() => handlePackratButtonClick()}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '24px',
              transform: 'translate(0%, -50%)'
            }}
          >
            <Typography variant="underline">Packrat</Typography>
          </Button>
        )}
        <Button
          variant="text"
          onClick={() => handleModeButtonClick()}
          sx={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translate(0%, -50%)'
          }}
        >
          {mode === 'application' ? (
            <Typography variant="underline">Bootloader Mode</Typography>
          ) : (
            <Typography variant="underline">Application Mode</Typography>
          )}
        </Button>
      </Controls>
    </Canvas>
  );
};

export default Landing;

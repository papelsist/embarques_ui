import * as React from 'react';
/* Imports Material UI*/ 
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

import styled from "styled-components";






  /* Import DATA*/ 
import "./Chofer.css"

import data from './embarques.json';


const HeaderEmbarque = styled.div`
    display: fixed;
`

const Chofer = () => {


    return (
            <>
            
            <List sx={{paddingBottom:'4rem'}}> 
                <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox First" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox LAST" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding >
                <ListItemButton>
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Inbox LAST2" />
                </ListItemButton>
            </ListItem>
            </List>
            </>
    );
}

export default Chofer;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { Link, useLocation } from "react-router-dom";
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import ArticleIcon from '@mui/icons-material/Article';
import RouteIcon from '@mui/icons-material/Route';





import './EmbarquesLayout.css'

const drawerWidth = 270;
const navItems = [
    {label:"Tablero",path:"/embarques", icon:<LeaderboardIcon /> },
    {label:"EnviosPendientes",path:"/embarques/envios_pendientes",icon:<AssignmentReturnIcon /> },
    {label:"Asignaciones",path:"/embarques/asignaciones", icon:<AssignmentIcon /> },
    {label:"Transito",path:"/embarques/transito",icon:<LocalShippingIcon /> },
    {label:"Regresos",path:"/embarques/regresos",icon:<AssignmentReturnIcon /> },
    {label:"Ruteo",path:"/embarques/ruteo",icon:<RouteIcon /> },

  ]
  const catalogoItems = [
    {label:"Transportes",path:"/embarques", icon:<LocalShippingIcon /> },
    {label:"Operadores",path:"/embarques", icon:<RecentActorsIcon /> },
  ]
  const procesosItems = [
    {label:"Actualizar F. Entrega",path:"/embarques", icon:<EventIcon /> },
  ]

const EmbarquesLayout = () => {
    const location = useLocation()
    const [openCatalagos, setOpenCatalogos] = React.useState(false);
    const [openProcesos, setOpenProcesos] = React.useState(false);
    const handleClickCatalogos = () => {
      setOpenCatalogos(!openCatalagos);
    };
    const handleClickProcesos = () => {
      setOpenProcesos(!openProcesos);
    };
  
    return (
        <div className='contenedor-embarques'>
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {navItems.map((item) => (
                <Link to={item.path} key={item.label}   className='link-modulos'> 
                    <ListItem  disablePadding selected={location.pathname === item.path} >
                      <ListItemButton>
                        <ListItemIcon >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label}    />
                      </ListItemButton>
                    </ListItem>
                </Link>
              ))}
   
                {/* <ListItem  onClick={handleClickCatalogos}  >
                  <ListItemButton>
                    <ListItemIcon >
                      <ArticleIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Catalogos'}    />
                    {openCatalagos ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openCatalagos} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {catalogoItems.map((item)=>(
                        <ListItemButton sx={{ pl: 4 }} key={item.label}>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                      ))}
                    </List>
                  </Collapse> */}
                  {/* brew uninstall dart */}
            </List>
            <Divider />
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1,paddingLeft:3, paddingBottom:2 }}>
        <Toolbar />
                <Outlet />
        </Box>
      </Box>
          
        </div>
    );
}

export default EmbarquesLayout;

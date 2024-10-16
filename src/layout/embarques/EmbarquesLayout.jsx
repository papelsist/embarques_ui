import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, useLocation } from "react-router-dom";
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import RouteIcon from '@mui/icons-material/Route';
import BusAlertIcon from '@mui/icons-material/BusAlert';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { ListSubheader,Dialog } from '@mui/material';
import CreateEmbarqueForm from '../../pages/embarques/asignaciones/asignaciones_form/CreateEmbarqueForm';
import MantenimientoEntrega from '../../components/mantenimiento_entrega/MantenimientoEntrega';




import './EmbarquesLayout.css'


const drawerWidth = 270;
const navItems = [
    {label:"Tablero",path:"/embarques", icon:<LeaderboardIcon /> },
    {label:"EnviosPendientes",path:"/embarques/envios_pendientes",icon:<PendingActionsIcon /> },
    {label:"EnviosParciales",path:"/embarques/envios_parciales",icon:<HorizontalSplitIcon /> },
    {label:"Asignaciones",path:"/embarques/asignaciones", icon:<AssignmentIcon /> },
    {label:"Transito",path:"/embarques/transito",icon:<DepartureBoardIcon /> },
    {label:"Regresos",path:"/embarques/regresos",icon:<AssignmentReturnIcon /> },
    {label:"Ruteo",path:"/embarques/ruteo",icon:<RouteIcon /> },
    {label:"Incidencias",path:"/embarques/incidencias",icon:<BusAlertIcon /> },
    {label:"Emb.Pasan",path:"/embarques/pasan",icon:<AssignmentIndIcon /> },

  ]



const EmbarquesLayout = () => {
    const location = useLocation()

    const [openDialogEmbarque, setOpenDialogEmbarque] = React.useState(false);
    const [openDialogEntrega, setOpenDialogEntrega] = React.useState(false);

    const procesosItems = [
      {label:"Alta Embarque",fn:()=>{setOpenDialogEmbarque(true)}, icon:<LocalShippingIcon /> },
      {label:"Mant. Entrega",fn:()=>{setOpenDialogEntrega(true)}, icon:<ManageHistoryIcon /> },
    ]
  
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
            </List>
            <Divider />
            <List subheader={<ListSubheader>Procesos</ListSubheader>}>
            {procesosItems.map((item) => (
            
                <ListItem  key={item.label}  onClick={item.fn} disablePadding  >
                  <ListItemButton>
                    <ListItemIcon >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label}    />
                  </ListItemButton>
                </ListItem>
                
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1,paddingLeft:3, paddingBottom:2 }}>
        <Toolbar />
                <Outlet />
        </Box>
      </Box>
      <Dialog open={openDialogEmbarque} onClose={()=>{setOpenDialogEmbarque(false)}}  >
        <CreateEmbarqueForm setOpenDialog={setOpenDialogEmbarque}  getData={()=>{}} /> 
      </Dialog>

      <Dialog open={openDialogEntrega} onClose={()=>{setOpenDialogEntrega(false)}}  >
              <MantenimientoEntrega setOpenDialog={setOpenDialogEntrega} />
      </Dialog>
          
        </div>
    );
}

export default EmbarquesLayout;

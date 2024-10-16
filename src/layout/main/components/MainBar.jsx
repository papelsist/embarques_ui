import  React, {useContext,useState,memo} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mainDrawerItems } from '../../navItems';

import Logo from '../../../images/logo3.png';
import { ContextEmbarques } from '../../../context/ContextEmbarques';






const drawerWidth = 270;
//const navItems = ['Home', 'About', 'Contact'];

 
export const MainBar = () => {

   const [openDrawer,setOpenDrawer] = useState(false)
   const location = useLocation()
   const { auth,setAuth, sucursal } = useContext(ContextEmbarques)
   const navigate = useNavigate()
   /* Menu Icon */   
  const ITEM_HEIGHT = 48;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
   
  };

  const cerrarSesion = ()=>{
    setAnchorEl(null);
    setAuth({})
    localStorage.removeItem('auth')
    navigate("/login", {replace: true})

  }
  
  /* Menu Icon */ 

    const hadleOpenDrawer = () =>{
        setOpenDrawer(!openDrawer)
    }

    const drawer = (
      <Box onClick={hadleOpenDrawer} sx={{ textAlign: 'center' }}>
        <Toolbar sx={{backgroundColor:"#1a76d2"}}>
            <img src={Logo} alt="logo" width={"120"} height={"50"}/> 
        </Toolbar>
        
        <Divider />
        <List>
          {mainDrawerItems.map((item) => (

             <Link to={item.path} key={item.label}   className='link-modulos'> 
                 <ListItem key={item} disablePadding>
                    <ListItemButton>
                      <Typography sx={{width:"100%"}}>{item.label}</Typography>
                    </ListItemButton>
                </ListItem>
              </Link> 
          ))}
        </List>
      </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;
    return (
    <Box sx={{ display: 'flex' }}>
    <CssBaseline />
    <AppBar component="nav" position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
      <Toolbar sx={{display:'flex', justifyContent:'space-between'}}>
      
       <Link to={"/"}>
          <img src={Logo} alt="logo" width={"120"} height={"50"}/> 
       </Link>
       <Box>
          <Typography ariant="h1" component="h2" fontSize={"1.5rem"}>{sucursal?.nombre}</Typography>
       </Box>
       <Box   >
            <IconButton
              color="#FFF"
              aria-label="open drawer"
              edge="start"
              onClick={handleClick}
              sx={{ display: !auth== "/" ? "none":" inline",mr: 2, }}
            >
              <MoreVertIcon   sx={{color:"#FFF", fontSize:23}}/>
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
               <MenuItem onClick={handleClose}>
                  <PersonIcon />{auth.username}
                </MenuItem>
                <MenuItem onClick={cerrarSesion}>
                  <LogoutIcon />Cerrar Sesión
                </MenuItem>
            </Menu>
            <IconButton
              color="#FFF"
              aria-label="open drawer"
              edge="start"
              onClick={hadleOpenDrawer}
              sx={{ display: location.pathname == "/" ? "none":" inline",mr: 2, }}
            >
              <MenuIcon   sx={{color:"#FFF", fontSize:23}}/>
            </IconButton>
       </Box>
      
      </Toolbar>
    </AppBar>
    <Box component="nav">
      <Drawer
        anchor='right'
        open={openDrawer}
        onClose={hadleOpenDrawer} 
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth,  zIndex: (theme) => theme.zIndex.appBar + 5  },
        }}
       
      >
        {drawer}
      </Drawer>
    </Box>
  </Box>
);

}

export default MainBar;

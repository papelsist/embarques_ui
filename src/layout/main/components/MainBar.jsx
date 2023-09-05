import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useLocation } from "react-router-dom";
import { mainDrawerItems } from '../../navItems';

import Logo from '../../../images/logo3.png';






const drawerWidth = 270;
//const navItems = ['Home', 'About', 'Contact'];

 
export const MainBar = (props) => {

   const [openDrawer,setOpenDrawer] = React.useState(false)
   const location = useLocation()

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
        {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {navItems.map((item) => (
            <Button key={item} sx={{ color: '#fff' }}>
              {item}
            </Button>
          ))}
        </Box> */}
       <Box  >
         {/* <Link to={"/"}>
            <IconButton
                color="#FFF"
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 2, }}
              >
                <HomeIcon   sx={{color:"#FFF", fontSize:23}}/>
              </IconButton>
          </Link> */}
          <IconButton
              color="#FFF"
              aria-label="open drawer"
              edge="start"
              onClick={hadleOpenDrawer}
              sx={{ mr: 2, }}
            >
              <MenuIcon   sx={{color:"#FFF", fontSize:23}}/>
            </IconButton>
       </Box>
      </Toolbar>
    </AppBar>
    <Box component="nav">
      <Drawer
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

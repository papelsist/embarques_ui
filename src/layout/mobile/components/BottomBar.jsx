import React, {useState} from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';

const BottomBar = () => {

    const [value, setValue] = React.useState(0);
    return (
       <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0}} elevation={3}> 
                <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                >
                <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
                <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />

                </BottomNavigation>      
        </Paper>
    );
}

export default BottomBar;

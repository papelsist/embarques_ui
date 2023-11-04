import { List, Paper, ListSubheader,IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import React from 'react';

const PromediosEmbarques = () => {


    const handleRefresh = ()=>{
        console.log('Refrescando Vista')
    }

    return (
        <Paper
        sx={{ width: '100%', height: '48%', maxHeight: '48%', overflow: 'auto' , bgcolor: 'background.paper', padding:'0 .5rem' }}
        > 
         <List
         
            subheader={<ListSubheader><span style={{fontSize:"1.2rem", fontWeight:"bold"}}>Datos1</span> <IconButton onClick={handleRefresh}><RefreshIcon/></IconButton></ListSubheader>}
        >
        </List>
        </Paper>
    );
}

export default PromediosEmbarques;

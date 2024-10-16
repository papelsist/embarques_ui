
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toolbar } from '@mui/material';






const TablerosLayout = () => {
    return (
            <>
            <Toolbar />
             <Outlet />
            </>
           
        
    );
}

export default TablerosLayout;


import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MainBar from '../main/components/MainBar';





const TablerosLayout = () => {
    return (
            <>
             <Outlet />
            </>
           
        
    );
}

export default TablerosLayout;

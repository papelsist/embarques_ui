
import React,{useContext} from 'react';
import { Outlet } from 'react-router-dom';
import { Toolbar } from '@mui/material';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { ContextEmbarques } from '../../context/ContextEmbarques';






const TablerosLayout = () => {
    const {loading} = useContext(ContextEmbarques);
    return (
            <>
            <Toolbar />
             <Outlet />
             <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            </>
           
        
    );
}

export default TablerosLayout;

import React, {useContext} from 'react';
import { Outlet } from 'react-router-dom'
import MainBar from './components/MainBar';
import { useTheme } from '@mui/material/styles';
import styled from "styled-components";


import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { ContextEmbarques } from '../../context/ContextEmbarques';


const ContenedorOutlet = styled.div`
    display: fixed;
    width:100vw;
    height:90vh; 
    padding:0;
`;

const MainLayout = () => {

    const theme = useTheme()
    const {loading} = useContext(ContextEmbarques);
    

    return (
        <div>
            <MainBar />
            <ContenedorOutlet>
                <Outlet/>
            </ContenedorOutlet>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
}

export default MainLayout;

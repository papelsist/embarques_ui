import React from 'react';
import { Outlet } from 'react-router-dom'
import MobileBar from './components/MobileBar';
import { useTheme } from '@mui/material/styles';
import styled from "styled-components";
import BottomBar from './components/BottomBar';
import { Toolbar } from '@mui/material';

const ContenedorOutlet = styled.div`
 display: fixed;
 width:100vw;
 height:100vh; 
 padding:0;
`;

const MobileLayout = () => {

    const theme = useTheme()
    

    return (
        <div>
            <MobileBar />
            <ContenedorOutlet>
            <Toolbar/>
                <Outlet/>
            <Toolbar/>
            </ContenedorOutlet>
           <BottomBar /> 
        </div>
    );
}

export default MobileLayout;

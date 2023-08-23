import React from 'react';
import { Outlet } from 'react-router-dom'
import MainBar from './components/MainBar';
import { useTheme } from '@mui/material/styles';
import styled from "styled-components";

const ContenedorOutlet = styled.div`
    display: fixed;
    width:100vw;
    height:90vh; 
    padding:0;
`;

const MainLayout = () => {

    const theme = useTheme()
    

    return (
        <div>
            <MainBar />
            <ContenedorOutlet>
                <Outlet/>
            </ContenedorOutlet>
        </div>
    );
}

export default MainLayout;

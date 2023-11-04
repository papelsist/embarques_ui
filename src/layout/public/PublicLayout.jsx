import React from 'react';
import { Outlet } from 'react-router-dom'
import PublicBar from './components/PublicBar';
import { useTheme } from '@mui/material/styles';
import styled from "styled-components";

const ContenedorOutlet = styled.div`
    display: fixed;
    width:100vw;
    height:90vh; 
    padding:0;
`;

const PublicLayout = () => {
    const theme = useTheme()

    return (
        <div>
            <PublicBar />
            <ContenedorOutlet>
                <Outlet/>
            </ContenedorOutlet>
        </div>
    );
}

export default PublicLayout;

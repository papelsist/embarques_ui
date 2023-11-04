import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import MobileBar from './components/MobileBar';
import { useTheme } from '@mui/material/styles';
import styled from "styled-components";
import BottomBar from './components/BottomBar';
import { Toolbar } from '@mui/material';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { objectIsEmpty } from '../../utils/embarqueUtils';


const ContenedorOutlet = styled.div`
 display: fixed;
 width:100vw;
 height:100vh; 
 padding:0;
`;

const MobileLayout = () => {

    const theme = useTheme()
    const {auth} = useContext(ContextEmbarques);

    return (
        <div>
            <MobileBar />
            <ContenedorOutlet>
            <Toolbar/>
                {
                    objectIsEmpty(auth)
                    ? <Outlet/>  
                    :<Navigate to="/login" />
                }ch 
            <Toolbar/>
            </ContenedorOutlet>
           <BottomBar /> 
        </div>
    );
}

export default MobileLayout;

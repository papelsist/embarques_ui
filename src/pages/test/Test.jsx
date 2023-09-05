import React from 'react';
import { Toolbar  } from '@mui/material';


import "./Test.css"
import CreateEmbarqueForm from '../embarques/asignaciones/asignaciones_form/CreateEmbarqueForm';
import EmbarqueForm from '../embarques/asignaciones/asignaciones_form/EmbarqueForm';
const Test = () => {
    return (
        <div className='test-container'>
            <Toolbar />

         <EmbarqueForm></EmbarqueForm>
        </div>
    );
}

export default Test;

import React from 'react';
import { Toolbar  } from '@mui/material';


import "./Test.css"
import CreateEmbarqueForm from '../embarques/asignaciones/asignaciones_form/CreateEmbarqueForm';
import EmbarqueForm from '../embarques/asignaciones/asignaciones_form/EmbarqueForm';
import MapaTest from '../../components/mapa_test/MapaTest';
import MapaTest2 from '../../components/mapa_test/MapaTest2';

const Test = () => {
    return (
        <div className='test-container' style={{display:"flex"}}>
            <MapaTest2 />
        </div>
    );
}

export default Test;

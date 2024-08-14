

import React, {useEffect, useContext, useState} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false ,
      position: 'top',
    },
    title: {
      display: true,
      text: 'Kilos por operador',
    },
  },
};



const GraficaKilosOperador = ({periodo}) => {

  const {auth} = useContext(ContextEmbarques)
  const [datos, setDatos] = useState([])


  const getDatos = async() => {
    const url = `${apiUrl.url}dashboards/embarques_operador`

    const resp = await axios.get(url, 
      {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final},
      headers: { Authorization: `Bearer ${auth.access}` }
      })
      const labels = resp.data.map((val) => val.operador__nombre)
      const valores = resp.data.map((val) => val.valor)
      const data = {
        labels:labels,
        datasets: [
          {
            label: '',
            data: valores,
            
          }
        ],
      }; 
      setDatos(data) 

  }


  useEffect(() => {
    getDatos()
  }, [periodo]);

  return (
    <div style={{width:"48%", display:'flex'}}>
      {
        datos.length == 0 ?
        <h3>Cargando...</h3> 
        :  
       
          <Bar options={options} data={datos} />
  
        
          
      }
    
    </div>
);
}

export default GraficaKilosOperador;

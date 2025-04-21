import React, {useEffect, useContext, useState} from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { IconButton } from '@mui/material';


ChartJS.register(ArcElement, Tooltip, Legend,Colors);

export const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1,
    },
  ],
};






const GraficaKilosOperador2 = ({periodo}) => {
  const {auth, sucursal} = useContext(ContextEmbarques)
  const [datos, setDatos] = useState([])

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},0.6)`;
  };

  const getDatos = async() => {
    const url = `${apiUrl.url}dashboards/embarques_operador`
  
    const resp = await axios.get(url, 
      {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final, sucursal:sucursal.id},
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
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
          }
        ],
      }; 
      setDatos(data) 

  }




  useEffect(() => {
    getDatos()
  }, [periodo]);
    return (
        <div >
        {
          datos.length == 0 ?
          <h3>Cargando...</h3> 
          :     
          (
            <div>
             <Pie data={datos} />
              <IconButton>
                <RefreshIcon onClick={getDatos} />
              </IconButton>
            </div> 
          )
        }
      
      </div>

    );
}

export default GraficaKilosOperador2;

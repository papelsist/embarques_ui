import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';


  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
    },
  
  };
  

  




const GraficaEmbarques = ({labels,datos,label,bc,bck}) => {
    const data = {
        labels:labels,
        datasets: [
          {
            label: label,
            data: datos.map((val) => val),
            borderColor: bc,
            backgroundColor: bck,
          },
        ],
      };

    return (
        <div style={{width:"48%", display:'flex'}}>
            <Line data={data}   />
        
        </div>
    );
}

export default GraficaEmbarques;

import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle, } from 'react-leaflet'
import { LogoIcon,TruckIcon } from '../map/iconos_mapa';


import "./MapaTest.css"

import { Box, Toolbar } from '@mui/material';




const destinos_coords = [
    {
          destino: 385,
          latitud: 19.346414,
          longitud: -98.974894
    },
    {
          destino: 368,
          latitud: 19.395505,
          longitud: -99.035569
    },
    {
          destino: 363,
          latitud: 19.35,
          longitud: -99.07
    },
    {
          destino: 311,
          latitud: 19.386293,
          longitud: -99.087802
    },
    {
          destino: 361,
          latitud: 19.411038,
          longitud: -99.118713
    },
    {
          destino: 317,
          latitud: 19.364993,
          longitud: -99.119951
    },
    {
          destino: 315,
          latitud: 19.360681,
          longitud: -99.117811
    },
    {
          destino: 313,
          latitud: 19.364338,
          longitud: -99.10648
    },
    {
          destino: 376,
          latitud: 19.36,
          longitud: -99.11
    }
]



const MapaTest = () => {  

  
    return (
        
      <Box>
        <Toolbar />
          <div style={{width:"100%", height:"100%", margin:"0", padding:"0"}}>
            {
                <MapContainer center={[19.3598997, -99.1068492]} zoom={12} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                    <Marker position={[19.3598997, -99.1068492]} icon={LogoIcon} >
                        <Popup>
                            Sucursal
                        </Popup>
                    </Marker>

                {
                    destinos_coords.map((coord)=>(
                        <Marker key={coord.destino}  position={[coord.latitud, coord.longitud]} icon={TruckIcon} >
                            <Popup>
                            {`${coord.destino} - ${coord.latitud},${coord.longitud} `}
                            </Popup>
                         </Marker>
                    ))
                }
                </MapContainer>
            }
          </div>

      </Box>
        
    );
}

export default MapaTest;

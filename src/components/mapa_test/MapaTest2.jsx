import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle, } from 'react-leaflet'
import { LogoIcon,TruckIcon } from '../map/iconos_mapa';


import "./MapaTest.css"

import { Box, Toolbar } from '@mui/material';




const destinos_coords =  [
      {
          "distance": 4.20758834154983,
          "name": "Calle República de Perú",
          "location": [
              -99.136672,
              19.439554
          ],
          "waypoint_index": 2,
          "trips_index": 0
      },
      {
          "distance": 0.6724015870707819,
          "name": "16 de Septiembre",
          "location": [
              -99.137645,
              19.43237
          ],
          "waypoint_index": 1,
          "trips_index": 0
      }
  ]

const MapaTest2 = () => {  

  
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
                        <Marker key={coord.destino}  position={[coord.location[1], coord.location[0]]} icon={TruckIcon} >
                            <Popup>
                            {`${coord.waypoint_index}- ${coord.name}`}
                            </Popup>e
                         </Marker>
                    ))
                }
                </MapContainer>
            }
          </div>

      </Box>
        
    );
}

export default MapaTest2;

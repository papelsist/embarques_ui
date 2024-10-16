import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle, } from 'react-leaflet'
import { LogoIcon,TruckIcon } from './iconos_mapa';

import "./Mapa.css"

import { Box } from '@mui/material';

const MapController = ({center})=> {
  const latlng= {lat: center.latitud, lng: center.longitud}
  const map = useMap()
  map.setZoom(12)
  map.flyTo(latlng,map.getZoom())
  return null
}
/*

    const getAddress = async (longitude, latitude)=>{
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?language=es&access_token=pk.eyJ1IjoibHF1aW50YW5pbGxhYiIsImEiOiJjbGxoNHQ2bTQwdzljM2ZxaG1lam4zd2h5In0.rWs48S5MkB8hdSnvBKWWqA`
        console.log(url)
        const res = await axios.get(url)
        console.log(res.data.features[0].place_name)
        setAddress(res.data.features[0].place_name)
    }
*/ 


const Mapa = ({puntos,center}) => {  

  
    return (

          <div style={{width:"100%", height:"100%", margin:"0", padding:"0"}}>
            {
                <MapContainer center={[center.latitud, center.longitud]} zoom={12} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {puntos.map((punto)=>(
                     <Marker key={punto.nombre} icon={punto.tipo == "EMPRESA" ? LogoIcon: TruckIcon}  position={[punto.latitud, punto.longitud]}>
                        <Popup>
                         {punto.nombre}
                        </Popup>
                      </Marker>
                    )) }
                 <MapController center={center}/>
                </MapContainer>
            }
          </div>

        
    );
}

export default Mapa;

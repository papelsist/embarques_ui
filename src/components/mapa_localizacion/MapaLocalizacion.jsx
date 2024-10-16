import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle, } from 'react-leaflet'
import { LogoIcon,TruckIcon, OfficeIcon } from './iconos_mapa';

const MapController = ({center})=> {
  const latlng= {lat: center.latitud, lng: center.longitud}
  const map = useMap()
  map.setZoom(12)
  map.flyTo(latlng,map.getZoom())
  return null
}

const styles = { 
    height: '100%', 
    width: '100%' ,
}
const MapaLocalizacion = ({puntos,center}) => {  

  
    return (
        <MapContainer center={[center.latitud, center.longitud]} zoom={12} scrollWheelZoom={false} 
        style={styles} >
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {puntos.map((punto)=>(
                    <Marker key={punto.nombre} icon={punto.tipo == "EMPRESA" ? LogoIcon : punto.tipo == "DESTINO" ? OfficeIcon : TruckIcon}  position={[punto.latitud, punto.longitud]}>
                    <Popup>
                        {punto.nombre}
                    </Popup>
                    </Marker>
                )) }
                <MapController center={center}/>
        </MapContainer>  
    );
}

export default MapaLocalizacion;

import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle } from 'react-leaflet'

import { Icon } from 'leaflet';

import "./Mapa.css"
import TruckPng from "../../assets/mapicons/truck3.png";
import  OfficePng from "../../assets/mapicons/office-building.png";
import { Box, Toolbar } from '@mui/material';
import axios from 'axios'

const Mapa = () => {
    const [location, setLocation] = useState(null);
    const [positonsPolygon, setPositionsPolygon] = useState([])
    const [address, setAddress] = useState(null);

    const TruckIcon = new Icon({
      iconUrl: TruckPng,
      iconSize: [30,30]
    })

    const  OfficeIcon = new Icon({
      iconUrl: OfficePng,
      iconSize: [30,30]
    })
  
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        console.log("Geolocation not supported");
      }
    }
  
    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(latitude)
      console.log(longitude)
      setLocation({ latitude, longitude })
      setPositionsPolygon([
        [latitude+.0005, longitude+.0005],
        [latitude+.0008, longitude-.0005],
        [latitude-.0005, longitude-.0005],
        [latitude-.0008, longitude+.0005],
      
      ])
      getAddress(longitude,latitude)
    }
    

    const getAddress = async (longitude, latitude)=>{
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?language=es&access_token=pk.eyJ1IjoibHF1aW50YW5pbGxhYiIsImEiOiJjbGxoNHQ2bTQwdzljM2ZxaG1lam4zd2h5In0.rWs48S5MkB8hdSnvBKWWqA`
        console.log(url)
        const res = await axios.get(url)
        console.log(res.data.features[0].place_name)
        setAddress(res.data.features[0].place_name)
    }



    function error(){
      console.log("Error ....")
    }

    console.log(positonsPolygon)

     useEffect(() => {
       getLocation()
     }, []);

    return (
      <Box>
          <Toolbar />
          <div style={{width:"50vw", height:"50vh", margin:"0", padding:"0"}}>
            {
              location && (
                <MapContainer center={[location.latitude, location.longitude]} zoom={17} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* <Polygon positions={positonsPolygon} /> */}
                  <Circle center={[location.latitude, location.longitude]} pathOptions={{ fillColor: 'blue' }} radius={100} />
                  <Marker icon={TruckIcon} position={[location.latitude, location.longitude]}>
                    <Popup>
                      Posicion Actual
                    </Popup>
                  </Marker>
                  <Marker icon={OfficeIcon} position={[location.latitude, location.longitude+.0003]}>
                    <Popup>
                      Posicion Actual
                    </Popup>
                  </Marker>
                </MapContainer>
              )
            }
            
          </div>
          <h2>Camiones</h2>
          <h2>{address}</h2>
      </Box>
        
    );
}

export default Mapa;

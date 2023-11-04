import React, { useState } from 'react';
import './App.css'

function App() {

  const [location, setLocation] = useState(null);
  const [error1, setError1] = useState(null);

  const valor = 1504

  function handleLocationClick() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLocation({ latitude, longitude });
  

  }

  return (
    <div>
     
    </div>
  );

}

export default App

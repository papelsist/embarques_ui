import React,{useRef, useEffect, useState,useContext} from 'react';
import { Box, Toolbar } from '@mui/material';
import PendientesEnvio from './pendientes_envio/PendientesEnvio';
import EnviosParciales from './envios_parciales/EnviosParciales';
import Disponibles from './disponibles/Disponibles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import axios from 'axios';
import { apiUrl } from '../../conf/axios_instance'
import { ContextEmbarques } from '../../context/ContextEmbarques';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';




import "./Tableros.css"
import EnviosTransito from './envios_transito/EnviosTransito';
import EmbarquesTransito from './embarques_transito/EmbarquesTransito';



const Tableros = () => {

    const {auth, sucursal} = useContext(ContextEmbarques)
    const [pendientesAsignar, setPendientesAsignar] = useState([])
    const [pendientesSalida, setPendientesSalida] = useState([])
    const [enviosTransito, setEnviosTransito] = useState([])
    const [enviosParciales, setEnviosParciales] = useState([])
    const [embarquesTransito, setEmbarquesTransito] = useState([])


    const progressCircle = useRef(null);
    const progressContent = useRef(null);
    const onAutoplayTimeLeft = (s, time, progress) => {
      progressCircle.current.style.setProperty('--progress', 1 - progress);
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    };

    const getEnviosPendientesAsignar = async() => {
      const url = `${apiUrl.url}tableros/pendientes_asignacion`
      const params = {sucursal:sucursal.nombre}
      const resp = await axios.get(url, 
        {params:params,
         headers: { Authorization: `Bearer ${auth.access}` }
        })
        setPendientesAsignar(resp.data)
    }

    const getEmbarquesPendientesSalida = async() => {
      const url = `${apiUrl.url}tableros/embarques_pendientes_salida`
      const params = {sucursal:sucursal.id}
      const resp = await axios.get(url, 
        {params:params,
         headers: { Authorization: `Bearer ${auth.access}` }
        })
        setPendientesSalida(resp.data)
        
    }

    const getEnviosTransito = async() => {
      const url = `${apiUrl.url}tableros/envios_transito`
      const params = {sucursal:sucursal.id}
      const resp = await axios.get(url, 
        {params:params,
         headers: { Authorization: `Bearer ${auth.access}` }
        })
        setEnviosTransito(resp.data)
        
    }

    const getEnviosParciales = async() => {
      const url = `${apiUrl.url}tableros/envios_parciales`
      const params = {sucursal:sucursal.id}
      const resp = await axios.get(url, 
        {params:params,
         headers: { Authorization: `Bearer ${auth.access}` }
        })
        setEnviosParciales(resp.data)
       
    }

    const getEmbarquesTransito = async() => {
      const url = `${apiUrl.url}tableros/embarques_transito`
      const params = {sucursal:sucursal.id}
      const resp = await axios.get(url, 
        {params:params,
         headers: { Authorization: `Bearer ${auth.access}` }
        })
        setEmbarquesTransito(resp.data)
    }

    const getData = async() =>{
        getEnviosPendientesAsignar()
        getEmbarquesPendientesSalida()
        getEnviosTransito()
        getEnviosParciales()
        getEmbarquesTransito()
    }


    useEffect(() => {
      getEnviosPendientesAsignar()
      getEmbarquesPendientesSalida()
      getEnviosTransito()
      getEnviosParciales()
      getEmbarquesTransito()
      const intervalId = setInterval(getData, 600000)
      return () => {
        clearInterval(intervalId)
      }
    },[])


    return (
 
        <>
        <Toolbar />
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 20000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          navigation={true}
          modules={[Autoplay,Pagination, Navigation]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          className="mySwiper"
        >
          <SwiperSlide><EnviosTransito enviosTransito={enviosTransito}  /></SwiperSlide>
          <SwiperSlide><PendientesEnvio pendientesAsignacion={pendientesAsignar} /></SwiperSlide>
          <SwiperSlide><EnviosParciales enviosParciales={enviosParciales} /></SwiperSlide>
          <SwiperSlide><Disponibles pendientesSalida={pendientesSalida} /></SwiperSlide>
          <SwiperSlide><EmbarquesTransito embarquesTransito={embarquesTransito} /> </SwiperSlide>
          <div className="autoplay-progress" slot="container-end">
            <svg viewBox="0 0 48 48" ref={progressCircle}>
              <circle cx="24" cy="24" r="20"></circle>
            </svg>
            <span ref={progressContent}></span>
          </div> 
        </Swiper>
      </>
        
    );
}

export default Tableros;

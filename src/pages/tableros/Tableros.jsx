import React,{useRef} from 'react';
import { Box, Toolbar } from '@mui/material';
import PendientesEnvio from './pendientes_envio/PendientesEnvio';
import EnviosParciales from './envios_parciales/EnviosParciales';
import Disponibles from './disponibles/Disponibles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';



import "./Tableros.css"
import EnviosTransito from './envios_transito/EnviosTransito';



const Tableros = () => {

    const progressCircle = useRef(null);
    const progressContent = useRef(null);
    const onAutoplayTimeLeft = (s, time, progress) => {
      progressCircle.current.style.setProperty('--progress', 1 - progress);
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    };

    return (
 
        <>
        <Toolbar />
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
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
          <SwiperSlide><EnviosTransito /></SwiperSlide>
          <SwiperSlide><PendientesEnvio /></SwiperSlide>
          <SwiperSlide><EnviosParciales /></SwiperSlide>
          <SwiperSlide><Disponibles /></SwiperSlide>
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

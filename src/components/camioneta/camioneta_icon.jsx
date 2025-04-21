import React from 'react';

const CamionetaIcon = ({size, color, rotation}) => {
    return (
        <svg
        width={size}
        height={size * 2} // Mantener una proporción vertical adecuada
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `rotate(${rotation + 180}deg)`, // Rotación
          transition: "transform 0.5s ease, width 0.5s ease, height 0.5s ease", // Animación suave al rotar o redimensionar
        }}
      >
      
        {/* Caja de la camioneta */}
        <rect
          x="40"
          y="50"
          width="120"
          height="200"
          rx="10"
          fill="#a9a9a9"
          stroke="black"
          strokeWidth="2"
        />
        {/* Parte superior de la caja */}
          <rect
          x="40"
          y="50"
          width="120"
          height="170"
          rx="10"
          fill={color}
          stroke="black"
          strokeWidth="2"
          />
        
      
        {/* Cabina */}
        <rect
          x="50"
          y="250"
          width="100"
          height="80"
          rx="8"
          fill="#a9a9a9"
          stroke="black"
          strokeWidth="2"
        />
        {/* Parte superior de la cabina */}
        <rect
          x="50"
          y="250"
          width="100"
          height="55"
          rx="8"
          fill="#d3d3d3"
          stroke="black"
          strokeWidth="2"
          />
      
        {/* Ventanas */}
        <rect
          x="60"
          y="310"
          width="35"
          height="5"
          rx="5"
          fill="#87CEEB"
          stroke="black"
          strokeWidth="1"
        />
        <rect
          x="105"
          y="310"
          width="35"
          height="5"
          rx="5"
          fill="#87CEEB"
          stroke="black"
          strokeWidth="1"
        />
      
      
        {/* Llantas */}
        <rect
          x="30"
          y="70"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
        <rect
          x="160"
          y="70"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
        <rect
          x="30"
          y="210"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
        <rect
          x="160"
          y="210"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
        <rect
          x="38"
          y="270"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
        <rect
          x="152"
          y="270"
          width="10"
          height="40"
          rx="5"
          fill="black"
        />
      
        {/* Luces delanteras */}
        <circle cx="60" cy="45" r="5" fill="red" />
        <circle cx="140" cy="45" r="5" fill="red" />
      
        {/* Luces traseras */}
        <circle cx="60" cy="335" r="5" fill="red" />
        <circle cx="140" cy="335" r="5" fill="red" />
      </svg>                            
    );
}

export default CamionetaIcon;

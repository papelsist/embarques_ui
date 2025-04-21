import React, { useRef, useState, useEffect } from 'react';

import './Calculadora.css';

const Calculadora = () => {

    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);
    const [canvas,setCanvas] = useState(null);
    const [tipo,setTipo] = useState('HORIZONTAL');
    const[areaUtilizada,setAreaUtilizada] = useState(0.00);
    const[areaInutilizada,setAreaInutilizada] = useState(0.00);
    const [dibujar,setDibujar] = useState(false);
    const [datos,setDatos] = useState({
        corteLargo: 0,
        corteAncho: 0,
        papelLargo: 0,
        papelAncho: 0,
        cortesDeseados: 0,
      });
    const [resultado,setResultado] = useState({
        areaUtilizada: 0.00,
        areaInutilizada: 0.00,
        cortesPliego: 0.00,
        pliegos: 0.00,
        cortes: 0.00,
        cortesH: 0.00,
        cortesV: 0.00,
        papelMenor: 0.00,
        papelMayor: 0.00,
        corteMenor: 0.00,
        corteMayor: 0.00
    });
    const [cortes,setCortes] = useState({
        cortesT: 0.00,
        cortesV: 0.00,
        cortesH: 0.00,
        sobranteV: 0.00,
        sobranteH: 0.00,
        areaUtilizada: 0.00
      });
 
    const clearCanvas = () => {
        context.clearRect(0, 0, canvas?.width, canvas?.height);
        canvas.style.backgroundColor = 'lightgray';
        reiniciarResultados();
        
    }

    const borrarDatos = () => {
        setDatos({
            corteLargo: 0,
            corteAncho: 0,
            papelLargo: 0,
            papelAncho: 0,
            cortesDeseados: 0,
          })
          clearCanvas();
          setDibujar(false);
    }

    const validarDatos = () => {
        if (datos.papelAncho !== 0 && datos.papelLargo !== 0 && datos.corteAncho !== 0 && datos.corteLargo !== 0)  {
            return true;
        } else {
            return false;
        }
    }

    const asignarDatos = (e) => {
        setDatos({
            ...datos,
            [e.target.name]: e.target.value
        });
    }

    const reiniciarResultados = () => {
        setResultado({
            areaUtilizada: 0.00,
            areaInutilizada: 0.00,
            cortesPliego: 0.00,
            pliegos: 0.00,
            cortes: 0.00,
            cortesH: 0.00,
            cortesV: 0.00,
            papelMenor: 0.00,
            papelMayor: 0.00,
            corteMenor: 0.00,
            corteMayor: 0.00
        });
        setCortes({
            cortesT: 0.00,
            cortesV: 0.00,
            cortesH: 0.00,
            sobranteV: 0.00,
            sobranteH: 0.00,
            areaUtilizada: 0.00
          });
    }


    const calcularHorizontal =() => {
        if (!validarDatos()) {
              return;
          }  
  
        setDibujar(true);
        
  
        setTipo('HORIZONTAL');
        const v = Math.max(datos.papelAncho, datos.papelLargo);
        const h = Math.min(datos.papelAncho, datos.papelLargo);
        const cb = datos.corteAncho;
        const ch = datos.corteLargo;
        const escala = 250 / v;
        let cortes, sobrante;
        let totalCortes = 0.00;
        let cortesV, cortesH = 0.00;
  
        clearCanvas();
  
        canvas.width = v * escala;
        canvas.height = h * escala;
        canvas.style.backgroundColor = '#fff';
  
        cortes = acomoda(v, h, 'N', 'H');
        totalCortes = cortes.cortesT;
  
        dibujaCuadricula(cortes.cortesV, cortes.cortesH, cb, ch, 0, 0, escala, '');
  

  
        sobrante = {
          cortesT: 0,
          cortesv: 0,
          cortesH: 0,
          sobrantev: 0,
          sobranteH: 0,
          areaUtilizada: 0
      };
  
        if (Math.floor(cb) < Math.floor(ch)) {
            cortesV = cortes.cortesT;
            cortesH = sobrante.cortesT;
        } else {
            cortesV = sobrante.cortesT;
            cortesH = cortes.cortesT;
        }
  
        calcularArea(v, h, cb, ch, totalCortes);
        calcular(v, h, cortesV, cortesH, totalCortes, cortes.cortesT, 'H');
  
      }

    const calcularVertical = () => {
        if (!validarDatos()) {
            return;
        }

        setDibujar(true);

        setTipo('VERTICAL');

    
        const v = Math.max(datos.papelAncho, datos.papelLargo);
        const h = Math.min(datos.papelAncho, datos.papelLargo);
        const cb = datos.corteAncho;
        const ch = datos.corteLargo;
        const escala = 250 / v;
        let cortes, sobrante;
        let totalCortes = 0.00;
        let cortesV, cortesH = 0.00;

        clearCanvas();

        canvas.width = h * escala;
        canvas.height = v * escala;
        canvas.style.backgroundColor = '#fff';

        cortes = acomoda(v, h, 'N', 'V');
        totalCortes = cortes.cortesT;

        dibujaCuadricula(cortes.cortesV, cortes.cortesH, cb, ch, 0, 0, escala, '');
        // Si se quiere dividir el sobrante en el tamaño del cortes

        // sobrante a cero para no mostrar el corte del sobrante

        sobrante = {
            cortesT: 0,
            cortesV: 0,
            cortesH: 0,
            sobranteV: 0,
            sobranteH: 0,
            areaUtilizada: 0
        };


        if (Math.floor(cb) < Math.floor(ch)) {
            cortesV = cortes.cortesT;
            cortesH = sobrante.cortesT;
        } else {
            cortesV = sobrante.cortesT;
            cortesH = cortes.cortesT;
        }

        calcularArea(v, h, cb, ch, totalCortes);
        calcular(v, h, cortesV, cortesH, totalCortes, cortes.cortesT, 'V');

    }

    const calcularMaximo = () => {
        if (!validarDatos()) {
            return;
        } 

        setDibujar(true);

        setTipo('MAXIMO');
    

        const v = Math.max(datos.papelAncho, datos.papelLargo);
        const h = Math.min(datos.papelAncho, datos.papelLargo);
        const cb = Math.max(datos.corteAncho, datos.corteLargo);
        const ch = Math.min(datos.corteAncho, datos.corteLargo);
        const escala = 250 / v;
        let a1h = h;
        let a1b = v;
        
        let a2h, a2b, sumaCortes = 0;
        
        let corteA1, corteA2;
        let totalCortes;
      
        let acomodo1, acomodo2 ;

        clearCanvas();

        canvas.width = v * escala;
        canvas.height = h * escala;
        canvas.style.backgroundColor = '#fff';

        /* Primero se acomoda el papel en H */
        const cortes = acomoda(v, h, 'H', 'M');

        totalCortes = cortes.cortesT;
        acomodo1 = {
            a1b: v,
            a2b: v,
            a1h: h,
            a2h: 0,
            sumaCortes: totalCortes,
            cortesH1: cortes.cortesH,
            cortesB1: cortes.cortesV,
            cortesT1: cortes.cortesT,
            cortesH2: 0,
            cortesB2: 0,
            cortesT2: 0
        };

        for (let x = 0; x <= cortes.cortesH; x++) {
            a2b = v;

            a2h = ((ch * x) + cortes.sobranteH);
            a1h = (h - a2h);

            corteA1 = acomoda(a1b, a1h, 'H', 'N');
            corteA2 = acomoda(a2b, a2h, 'V', 'N');

            sumaCortes = corteA1.cortesT + corteA2.cortesT;
            if ( sumaCortes > totalCortes ) {
                totalCortes = sumaCortes;
                acomodo1 = {
                    a1b,
                    a2b,
                    a1h,
                    a2h,
                    sumaCortes: totalCortes,
                    cortesH1: corteA1.cortesH,
                    cortesB1: corteA1.cortesV,
                    cortesT1: corteA1.cortesT,
                    cortesH2: corteA2.cortesH,
                    cortesB2: corteA2.cortesV,
                    cortesT2: corteA2.cortesT
                };
            }
        }

        totalCortes = cortes.cortesT;
        acomodo2 = {a1b: v, a2b: 0, a1h: h, a2h: h, sumaCortes: totalCortes, cortesH: totalCortes, cortesV: 0.00};

        for (let x = 0; x <= cortes.cortesV; x++) {
            a1h = h;

            a2b = ((cb * x) + cortes.sobranteV);
            a1b = (v - a2b);

            corteA1 = acomoda(a1b, a1h, 'H', 'N');
            corteA2 = acomoda(a2b, a2h, 'V', 'N');

            sumaCortes = corteA1.cortesT + corteA2.cortesT;

            if ( sumaCortes > totalCortes ) {
                totalCortes = sumaCortes;
                acomodo2 = {
                    a1b,
                    a2b,
                    a1h,
                    a2h,
                    sumaCortes: totalCortes,
                    cortesH1: corteA1.cortesH,
                    cortesB1: corteA1.cortesV,
                    cortesT1: corteA1.cortesT,
                    cortesH2: corteA2.cortesH,
                    cortesB2: corteA2.cortesV,
                    cortesT2: corteA2.cortesT
                };
            }
        }

        if ( acomodo2.sumaCortes > acomodo1.sumaCortes ) {
            calcularArea(v, h, cb, ch, acomodo2.sumaCortes);
            calcular(v, h, acomodo2.cortesT2, acomodo2.cortesT1, Math.floor(acomodo2.sumaCortes), acomodo2.sumaCortes, 'M');
            // Dibuja 2 areas una al lado de otra
            dibujaCuadricula(acomodo2.cortesB1, acomodo2.cortesH1, cb, ch, 0, 0, escala, '');
            dibujaCuadricula(acomodo2.cortesB2, acomodo2.cortesH2, ch, cb, acomodo2.cortesB1 * cb * escala, 0, escala, '');
        } else {
            calcularArea(v, h, cb, ch, acomodo1.sumaCortes);
            calcular(v, h, acomodo1.cortesT2, acomodo1.cortesT1, acomodo1.sumaCortes, Math.floor(acomodo1.sumaCortes), 'M');
            // Dibuja 2 areas una arriba de otra
            dibujaCuadricula(acomodo1.cortesB1, acomodo1.cortesH1, cb, ch, 0, 0, escala, '');
            dibujaCuadricula(acomodo1.cortesB2, acomodo1.cortesH2, ch, cb, 0, acomodo1.cortesH1 * ch * escala, escala, '');
        }
    }


    const calcularArea = (anchoPapel, largoPapel, anchoCorte, largoCorte, cortesEnPliego) => { 
        const areaPapel = datos.papelAncho * datos.papelLargo;
        const areaCorte = datos.corteAncho * datos.corteLargo;
        const areaUtilizadaCortes = cortesEnPliego * areaCorte;
        const porcentajeAreaUtilizada = ((areaUtilizadaCortes * 100) / areaPapel);
        const porcentajeAreaInutilizada = (100 - porcentajeAreaUtilizada);
        setAreaUtilizada(porcentajeAreaUtilizada);
        setAreaInutilizada(porcentajeAreaInutilizada);
      }

    const calcular = (b, h, cortesV, cortesH, totalCortes, utilizables, orientacion) => {

        const cortesDeseados = datos.cortesDeseados === 0 ? 1 : datos.cortesDeseados;
        let pliegosP = 1;
        let pliegos = 1;    
        if (orientacion === 'H') {
            pliegos = Math.ceil(cortesDeseados / utilizables);
        } else if (orientacion === 'V') {
            pliegos = Math.ceil(cortesDeseados / utilizables);
        } else {
            // Calculando el numero de pliegos necesarios
            pliegos = Math.ceil(cortesDeseados / totalCortes);
        }
    
        if (pliegos !== 1 && !isNaN(pliegos)) {
            pliegosP = pliegos;
        } else if (isNaN(pliegos)) {
            pliegos = 1;
        }
        // Calculando el numero total de cortes en todos los pliegos
        const noTotalCortes = totalCortes * pliegos;
        // Imprimiendo resultados
        imprimirResultados(totalCortes, pliegos, noTotalCortes, cortesH, cortesV, utilizables);
    }


    const imprimirResultados = (cortesPliego, pliegos, cortes, cortesH, cortesV, utilizables) => {
        setResultado( {
            areaUtilizada: areaUtilizada.toFixed(2),
            areaInutilizada: areaInutilizada.toFixed(2),
            cortesPliego,
            pliegos,
            cortes,
            cortesH,
            cortesV,
            papelMenor: datos.papelAncho,
            papelMayor: datos.papelLargo,
            corteMenor: datos.corteAncho,
            corteMayor: datos.corteLargo
        });
      }

    const acomoda = (d1, d2, acomodoCorte, acomodoPliego) => {

       
        let  cv = 1;
        let ch = 1;
        let v = 1;
        let h = 1;
  
        if (acomodoPliego === 'V') {
            v = Math.min(d1, d2);
            h = Math.max(d1, d2);
        } else if (acomodoPliego === 'H') {
        /* Acomodo del pliego en horizontal y para el calculo del maximo
         */
            v = Math.max(d1, d2);
            h = Math.min(d1, d2);
        } else {
            v = d1;
            h = d2;
        }
  
        if (acomodoCorte === 'H') {
            cv = Math.max(datos.corteAncho, datos.corteLargo);
            ch = Math.min(datos.corteAncho, datos.corteLargo);
        } else if (acomodoCorte === 'V') {
            cv = Math.min(datos.corteAncho, datos.corteLargo);
            ch = Math.max(datos.corteAncho, datos.corteLargo);
        } else {
            cv = datos.corteAncho;
            ch = datos.corteLargo;
        }
  
        const cortesT = Math.floor(v / cv) * Math.floor(h / ch);
        const cortesV = Math.floor(v / cv);
        const cortesH = Math.floor(h / ch);
        const sobranteV = (v - (cortesV * cv));
        const sobranteH = (h - (cortesH * ch));
        const areaUtilizada = ((cv * ch) * (Math.floor(v / cv) * Math.floor(h / ch)));
  
        const cortesCalc = {
              cortesT,
              cortesV,
              cortesH,
              sobranteV,
              sobranteH,
              areaUtilizada
          };
       setCortes(cortesCalc)
        return cortesCalc;
      }

    const dibujaCuadricula =(cortesX, cortesY, width, height, coorX, coorY, escala, color) => {

        if (color === 'R') {
             color = '#525E74';
    
        } else {
            color = '#d33939';
        }
    
        const coorY1 = coorY;
        const coorX1 = coorX;
        width = escala * width;
        height = escala * height;
    
        for (let x = 1; x <= cortesX; x++) {
            coorY = coorY1;
    
            for (let y = 1; y <= cortesY; y++) {
                context.beginPath();
                context.fillStyle = color;
                context.rect(coorX, coorY, width, height);
                context.fill();
                context.lineWidth = 1;
                context.strokeStyle = 'white';
    
                context.stroke();
    
                coorY = (height * y) + coorY1;
            }
    
            coorX = (width * x) + coorX1;
        }
      }

    useEffect(() => {
        const canvasEl = canvasRef.current;
        canvasEl.width = 250;
        canvasEl.height = 250;
        const ctx = canvasEl.getContext('2d');
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        setContext(ctx);
        setCanvas(canvasEl);
      }, []);

    return (
    <div className="calculadora-container">
        <div className="container">

            {/* Canvas para Hoja de Papel */}
        
            <div className="container-canvas">
                <canvas
                ref={canvasRef}
                className="border border-gray-300"
                ></canvas>
            </div>
            <label className="label-tipo">
                {tipo}
            </label>
            {/* Formulario para ingresar datos */}
            {
                !dibujar && (
                    <div className="datos-card">
                        <div className="row label-row label-tipo">
                            Medidas Papel
                        </div>
                        <div className="row datos-row">
                            <input type="number" name='papelAncho' value={datos.papelAncho !== 0 ? datos.papelAncho : ''} placeholder="Lado Menor" onChange={asignarDatos}/>
                            <input type="number" name='papelLargo' value={datos.papelLargo !==0 ? datos.papelLargo : ''} placeholder="Lado Mayor" onChange={asignarDatos} />
                        </div>
                        <div className="row label-row label-tipo">
                            Medidas Corte
                        </div>
                        <div className="row datos-row">

                            <input type="number" name='corteAncho' value={datos.corteAncho !== 0 ? datos.corteAncho : ''} placeholder="Lado Menor" onChange={asignarDatos} />
                            <input type="number" name='corteLargo' value={datos.corteLargo !== 0 ? datos.corteLargo: ''} placeholder="Lado Mayor" onChange={asignarDatos} />
                        </div>
                        <div className="row label-row">
                            <input type="number" name='cortesDeseados' value={datos.cortesDeseados !== 0 ? datos.cortesDeseados : ''} placeholder="Tamaños" onChange={asignarDatos} />
                        </div>
                    </div>
                )
            }

            {/* Resultados */}
            
            { dibujar && (
            <div className="resultado-card">
                    <div className="row label-row">
                <label className="label-tipo">Datos</label>
            </div>
            <div className="row datos-row">
                <div>
                    <label className="label-datos">Papel: </label>
                    <label className="label-datos">{resultado.papelMenor} x {resultado.papelMayor} </label>
                </div>
                <div>
                    <label className="label-datos">Corte: </label>
                    <label className="label-datos">{resultado.corteMenor} x {resultado.corteMayor}</label>
                </div>
            </div>

            <div className="row label-row">
                <label className="label-tipo">Resultados</label>
            </div>
            <div className="row resultados-row">
                <label className="label-title">Tamaños por Hoja:</label>
                <label className="label-resultado">{resultado.cortesPliego}</label>
            </div>
            <div className="row resultados-row">
                <label className="label-title">Pliegos:</label>
                <label className="label-resultado">{resultado.pliegos}</label>
            </div>
            <div className="row resultados-row">
                <label className="label-title">Tamaños:</label>
                <label className="label-resultado">{resultado.cortes}</label>
            </div>
            <div className="row resultados-row">
                <label className="label-title">Utilizado:</label>
                <label className="label-resultado">{areaUtilizada.toFixed(2)}%</label>
            </div>
            <div className="row resultados-row">
                <label className="label-title">Sin Utilizar:</label>
                <label className="label-resultado">{areaInutilizada.toFixed(2)}%</label>
            </div>

            </div>
            )
            }


            {/* Botones seleccion de  corte */}
            <div className="button-toggle-group">
                <i className="fas fa-arrows-alt-h button-toggle button-toggle-inicial" onClick={calcularHorizontal} >
                    <div className="tooltip">Horizontal</div>
                </i>
                <i className="fas fa-arrows-alt-v button-toggle" onClick={calcularVertical} >
                    <div className="tooltip">Vertical</div>
                </i>
                <i className="fas fa-expand-arrows-alt icon button-toggle" onClick={calcularMaximo} >
                    <div className="tooltip">Máximo</div>
                </i>
                <i className="fas fa-redo button-toggle button-toggle-final" onClick={borrarDatos}>
                    <div className="tooltip">Limpiar</div>
                </i>
            </div>

            </div>
        </div>
    );
}

export default Calculadora;

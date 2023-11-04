import React,{ useContext, useEffect }from 'react';
import { Box, Toolbar,  } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { objectIsEmpty } from '../../utils/embarqueUtils';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
 
import "./Home.css"
import EmbaquesImg from '../../assets/embarques.webp'

const Home = () => {
    const {auth} = useContext(ContextEmbarques)
    const navigate = useNavigate()
    const validate_auth = async() =>{
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}embarques/pendientes_salida`
                const resp = await axios.get(url,{
                    params: {sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                } )
                setDatos(resp.data)
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                } 
            }
        }else{
            console.log('No esta autenticado')
            navigate(`../../login`)
        } 
    }
   /*  useEffect(() => {
        
    }, []); */
    return (
        <div className='home-main-container'>
         <Toolbar />
         <Box component={"div"} className='home-container'>

                <div className="card-container card1-container">

                </div>
                <div className="card-container card2-container">
                <Card sx={{ maxWidth: '100%' }}>
                    <CardMedia
                        sx={{ height: 140 }}
                        image={EmbaquesImg}
                        title="embarques img"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                        Embarques
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sistema de Logística y Embarques
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="large" onClick={()=>{ navigate("../../embarques")}}>Ir</Button>
                    </CardActions>
                </Card>
                </div>
                <div className="card-container card3-container">


                </div>
                <div className="card-container card4-container">

                </div>
        </Box>
        </div>
       
     
           
        
    );
}

export default Home;

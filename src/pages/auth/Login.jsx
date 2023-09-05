import React, {useState} from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useForm } from '../../hooks/useForm';
import "./Login.css"

import Logo from "../../images/logo3.png"

const Login = () => {
    const [formValues, handleInputChange] = useForm({
        username: '',
        password: ''
    })
    const {username, password} = formValues;
    const [loginError, setLoginError] = useState(false);
    const onSubmit = async (e) =>{}

    
   
    return (
        <div className="container-login">

            <div className='login-title-container'>
                <h2>Bienvenido a <span>Logística</span></h2>
                <div className="login-description-container">
                    Sistema de Logística y Embarques para Papel s.a
                </div>
            </div>
            
        <div className='screen-login-container'>
            <div className="screen animate__animated animate__backInRight">
            <img src={Logo} alt="logo" className='logo_login'  />
                
                <div className="screen__content">
                    <form className="login" onSubmit = {onSubmit}>
                        <div className="login__field">
                            <PersonIcon className="login__icon"></PersonIcon>
                            <input type="text" className="login__input" placeholder="Usuario"  id="username" name = "username" onChange = {handleInputChange} value= {username} />
                        </div>
                        <div className="login__field">
                            <LockIcon className="login__icon"></LockIcon>
                            <input type="password" className="login__input" placeholder="Password" id="password" name = "password" onChange = {handleInputChange} value = {password}/>
                        </div>
                        <button className="button login__submit">
                            <span className="button__text">Ingresar</span>
                            <ChevronRightIcon className="button__icon"></ChevronRightIcon>
                        </button>				
                    </form>
                    {
                        loginError && (<div className='error-login'>
                        usuario o contraseña invalidos
                        </div>)
                    }
                    
                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>		
                    <span className="screen__background__shape screen__background__shape2"></span> 
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>	 	
            </div>
        </div>
        
    </div>
    );
}

export default Login;

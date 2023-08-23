import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom' 
import { router } from "./Router.jsx"
import './index.css'
import EmbarquesProvider from './context/EmbarquesProvider.jsx'
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';



export const themeOptions = {

};

const theme = createTheme(themeOptions);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> 
    <EmbarquesProvider>
      <RouterProvider router={router}/>
    </EmbarquesProvider>
    </ThemeProvider > 
  </React.StrictMode>,
)

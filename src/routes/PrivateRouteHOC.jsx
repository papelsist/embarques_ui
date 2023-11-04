import React, { useContext } from 'react';
import { ContextEmbarques } from '../context/ContextEmbarques';
import { objectIsEmpty } from '../utils/embarqueUtils';
import { Navigate } from 'react-router-dom';


const PrivateRouteHOC = ({children}) => {
    const {auth} = useContext(ContextEmbarques);
    return (
        objectIsEmpty(auth) 
        ? children
        :<Navigate to="/login" />
    );
}

export default PrivateRouteHOC;

/**
 * Como usar la ruta privada
 * <Route
 *  path="/"
 *  element={
 *  <PrivateRoute>
 *      <ComponentRoutes />
 *  </PrivateRoute>
 * }
 * />
 */

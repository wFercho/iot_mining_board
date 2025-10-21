// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Scene } from "./pages/Screen";
import { SensorPage } from "./pages/Sensor";
import { SensorNodesPage } from "./pages/SensorNodes";
import { Boards } from "./pages/Boards";
import { Config } from "./pages/Config";
import { MinesPage } from "./pages/Mines";
import { ProfilesPage } from "./pages/Profiles";
import { IotGatewaysPage } from "./pages/IoTGateways";
import { Home } from "./pages/Home";
/* import { PrivateRoute } from "./PrivateRoute";
 */
export const AppRouter = () => {
  return (
    <Routes>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/screen" element={<Scene mineId=""/>} />
        <Route path="/sensores" element={<SensorPage/>} />
        <Route path="/nodos_sensores" element={<SensorNodesPage/>} />
        <Route path="/perfiles" element={<ProfilesPage/>} />
        <Route path="/gateways" element={<IotGatewaysPage/>} />
        <Route path="/minas" element={<MinesPage/>} />
        <Route path="/tableros" element={<Boards/>} />
        <Route path="/configuracion" element={<Config/>} />

        {/* Uncomment the routes below as needed */}
   {/*    <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />

      <Route path="/users/:id" element={<UserProfile />} /> */}

  {/*    
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      /> */}
{/* 
      <Route path="/old-route" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};
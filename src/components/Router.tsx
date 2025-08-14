// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Scene } from "./pages/Screen";
import Dashboard from "./Dashboard";
import { MinePage } from "./pages/Mines";
/* import { PrivateRoute } from "./PrivateRoute";
 */
export const AppRouter = () => {
  return (
    <Routes>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/screen" element={<Scene mineId=""/>} />
        <Route path="/sensores" element={<MinePage/>} />

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
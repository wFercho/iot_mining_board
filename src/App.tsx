import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Dashboard from './components/Dashboard';
import { AppRouter } from "./components/Router";
function App() {
  return (
    <div className="h-full bg-black">
      <BrowserRouter>
        <AppRouter /> {/* Renderiza el router principal */}
      </BrowserRouter>
    
    </div>
  );
}

export default App;

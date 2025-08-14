import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./components/Router";
import { NotificationsProvider } from "./Context/NotificationsContext";
function App() {
  return (
    <div className="h-full bg-black">
      <NotificationsProvider>

        <BrowserRouter>
          <AppRouter /> {/* Renderiza el router principal */}
        </BrowserRouter>
      </NotificationsProvider>

    </div>
  );
}

export default App;

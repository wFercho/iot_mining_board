import { Route, Switch } from "wouter";
import "./App.css";
import Mines from "./pages/Mines";
import IoTGateway from "./pages/IoTGateway";
import Sensors from "./pages/Sensors";
import Nodes from "./pages/Nodes";
import Home from "./pages/Home";
import { AppProvider } from "./state/appContext";
import Scene from "./components/Mine3D/Scene";
import NewMine from "./pages/NewMine";
function App() {
  return (
    <AppProvider>
      <div className="h-full">
        {/* <Screen mineId="ca90309e-8f17-49aa-80d9-e2ebc47e83f3" /> */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/mines" component={Mines} />
          <Route path="/mines/new" component={NewMine} />
          <Route path="/iot-gateway" component={IoTGateway} />
          <Route path="/nodes" component={Nodes} />
          <Route path="/sensors" component={Sensors} />
          <Route path="/mine-nodes-3d/:mine_id" component={Scene} />

          <Route path="/users/:name">
            {(params) => <>Hello, {params.name}!</>}
          </Route>

          {/* Default route in a switch */}
          <Route>404: No such page!</Route>
        </Switch>
      </div>
    </AppProvider>
  );
}

export default App;

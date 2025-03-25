import { Route, Switch } from "wouter";
import "./App.css";
// import Screen from "./components/Screen";
import Mines from "./pages/Mines";
import IoTGateway from "./pages/IoTGateway";
import Sensors from "./pages/Sensors";
import Nodes from "./pages/Nodes";
import Home from "./pages/Home";
function App() {
  return (
    <div className="h-full">
      {/* <Screen mineId="ca90309e-8f17-49aa-80d9-e2ebc47e83f3" /> */}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/mines" component={Mines} />
        <Route path="/iot-gateway" component={IoTGateway} />
        <Route path="/nodes" component={Nodes} />
        <Route path="/sensors" component={Sensors} />

        <Route path="/users/:name">
          {(params) => <>Hello, {params.name}!</>}
        </Route>

        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </div>
  );
}

export default App;

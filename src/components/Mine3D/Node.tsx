import { Billboard, Text } from "@react-three/drei";
import { INodeIn3D, ZoneCategory } from "../../interfaces/main";
import { Vector3 } from "three";

interface NodeDetailsProps {
  selectedNode: INodeIn3D;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ selectedNode }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "white",
        padding: 10,
        borderRadius: 5,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Sensor ID: {selectedNode.id}</h3>
      <p>Zona: {selectedNode.zone.category}</p>
      <p>Etiqueta: {selectedNode.zone.name}</p>
      <p>Posición: {JSON.stringify(selectedNode.position)}</p>
      <h4>Variables Sensadas:</h4>
      <ul>
        {selectedNode.sensors.map((sensor, index) => (
          <li key={index}>
            Categoría: {sensor.category}, Unidad: {sensor.unit}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface NodeVisualizationProps {
  sensor: INodeIn3D;
  onClick: () => void;
  isDarkMode: boolean;
}

const NodeVisualization: React.FC<NodeVisualizationProps> = ({
  sensor,
  onClick,
  isDarkMode,
}) => {
  const start = new Vector3(
    sensor.position.x,
    sensor.position.y,
    sensor.position.z
  );

  return (
    <group key={sensor.id}>
      <mesh position={start} onClick={onClick}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={
            sensor.zone.category === "bocamina"
              ? "blue"
              : sensor.zone.category === "extraction"
              ? "orange"
              : sensor.zone.category === "tunel"
              ? "#2268e0"
              : "white"
          }
          transparent
          opacity={0.6}
        />
      </mesh>

      <Billboard
        position={[start.x, start.y + 0.5, start.z]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          fontSize={0.2}
          color={isDarkMode ? "white" : "gray"}
          anchorX="center"
          anchorY="middle"
        >
          {ZoneCategory[sensor.zone.category]}
        </Text>
      </Billboard>

      <Billboard
        position={[start.x, start.y + 0.8, start.z]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          fontSize={0.3}
          color={isDarkMode ? "lightgray" : "black"}
          anchorX="center"
          anchorY="middle"
        >
          {sensor.zone.name}
        </Text>
      </Billboard>
    </group>
  );
};

export { NodeDetails, NodeVisualization };

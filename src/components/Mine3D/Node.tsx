import { Billboard, Text } from "@react-three/drei";
import { INodeIn3D, ZoneCategory } from "../../interfaces/main";
import { Vector3, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

interface NodeDetailsProps {
  selectedNode: INodeIn3D;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ selectedNode }) => {
  // Función para determinar el color del texto según la alerta
  const getAlertTextColor = (alertName: string | undefined) => {
    switch (alertName) {
      case "PELIGRO":
        return "#ff0000"; // Rojo para crítico
      case "ADVERTENCIA":
        return "#ffa500"; // Naranja para advertencia
      default:
        return "#000000"; // Negro para normal
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        maxWidth: "300px",
        zIndex: 100,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          borderBottom: "1px solid #eee",
          paddingBottom: "8px",
        }}
      >
        Nodo: {selectedNode.id}
      </h3>

      <div style={{ marginBottom: "12px" }}>
        <p style={{ margin: "4px 0" }}>
          <strong>Zona:</strong> {ZoneCategory[selectedNode.zone.category]}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Nombre:</strong> {selectedNode.zone.name}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Posición:</strong> X: {selectedNode.position.x.toFixed(2)}, Y:{" "}
          {selectedNode.position.y.toFixed(2)}, Z:{" "}
          {selectedNode.position.z.toFixed(2)}
        </p>
      </div>

      <h4 style={{ borderBottom: "1px solid #eee", paddingBottom: "6px" }}>
        Sensores ({selectedNode.sensors.length})
      </h4>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {selectedNode.sensors.map((sensor) => (
          <div
            key={`${selectedNode.id}-${sensor.id}`}
            style={{
              marginBottom: "8px",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: sensor.alert?.color
                ? `${sensor.alert.color}20`
                : "#f8f8f8",
              borderLeft: `4px solid ${sensor.alert?.color || "#ccc"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong
                style={{
                  color: getAlertTextColor(sensor.alert?.name),
                  fontWeight:
                    sensor.alert?.name !== "NORMAL" ? "bold" : "normal",
                }}
              >
                {sensor.category}
              </strong>
              <span>
                {sensor.value} {sensor.unit}
              </span>
            </div>

            {sensor.alert && (
              <div
                style={{
                  marginTop: "4px",
                  color: getAlertTextColor(sensor.alert.name),
                  fontWeight: "bold",
                  fontSize: "0.9em",
                }}
              >
                Estado: {sensor.alert.name}
              </div>
            )}

            <div style={{ fontSize: "0.8em", color: "#666", marginTop: "4px" }}>
              ID: {sensor.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface NodeVisualizationProps {
  node: INodeIn3D;
  onClick: () => void;
  isDarkMode: boolean;
}

const NodeVisualization: React.FC<NodeVisualizationProps> = ({
  node,
  onClick,
  isDarkMode,
}) => {
  const start = new Vector3(node.position.x, node.position.y, node.position.z);

  // Referencias para animaciones
  const nodeMeshRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);

  // Estado para los efectos de animación
  const [pulseTime, setPulseTime] = useState(0);

  // Determinar si el nodo tiene alguna alerta activa
  const hasAlert = node.sensors.some(
    (s) => s.alert && s.alert.name !== "NORMAL"
  );

  // Obtener el color de la alerta más crítica (asumimos que PELIGRO es crítico)
  const getAlertColor = () => {
    const dangerAlert = node.sensors.find((s) => s.alert?.name === "PELIGRO");
    if (dangerAlert) return dangerAlert.alert!.color;

    const anyAlert = node.sensors.find(
      (s) => s.alert && s.alert.name !== "NORMAL"
    );
    if (anyAlert) return anyAlert.alert!.color;

    return node.color || "#2268e0";
  };

  const alertColor = getAlertColor();

  // Hook de animación para el efecto de parpadeo y pulso
  useFrame((_, delta) => {
    if (hasAlert) {
      // Actualizar el contador de tiempo para la animación de pulso
      setPulseTime((prevTime) => prevTime + delta);

      if (nodeMeshRef.current) {
        // Efecto de parpadeo en la intensidad del emisivo
        const pulseValue = Math.sin(pulseTime * 5) * 0.5 + 0.5; // Oscila entre 0 y 1
        // @ts-expect-error "ignore"
        nodeMeshRef.current.material.emissiveIntensity = 0.2 + pulseValue * 0.8;
      }

      if (haloRef.current) {
        // Animación del halo: parpadeo y escala suave
        const haloOpacity = Math.sin(pulseTime * 4) * 0.3 + 0.3; // Oscila entre 0 y 0.6
        const haloScale = 1 + Math.sin(pulseTime * 3) * 0.1; // Oscila entre 0.9 y 1.1

        // @ts-expect-error "ignore"
        haloRef.current.material.opacity = haloOpacity;
        haloRef.current.scale.set(haloScale, haloScale, haloScale);
      }
    }
  });

  return (
    <group key={node.id}>
      {/* Nodo principal */}
      <mesh position={start} onClick={onClick} ref={nodeMeshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          // color={node.color || "#2268e0"}
          color={!isDarkMode ? "#525252" : "#ffffff"}
          transparent
          opacity={0.8}
          // emissive={node.color || "#2268e0"}
          emissive={!isDarkMode ? "#525252" : "#ffffff"}
          emissiveIntensity={hasAlert ? 0.7 : 0.2}
        />
      </mesh>

      {/* Halo de alerta (solo visible cuando hay alerta) */}
      {hasAlert && (
        <mesh position={start} ref={haloRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={alertColor}
            transparent
            opacity={0.4}
            emissive={alertColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

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
          {node.zone.category in ZoneCategory
            ? ZoneCategory[node.zone.category as keyof typeof ZoneCategory]
            : node.zone.category}
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
          {node.zone.name}
        </Text>
      </Billboard>

      {/* Indicador adicional de alerta para mayor visibilidad */}
      {hasAlert && (
        <Billboard
          position={[start.x, start.y + 1.1, start.z]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            fontSize={0.25}
            color={alertColor}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            ⚠ ALERTA
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export { NodeDetails, NodeVisualization };

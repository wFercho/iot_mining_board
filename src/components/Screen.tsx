import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Matrix4, Mesh, Vector3 } from "three";
import { useMineNodes3D } from "../hooks/useMineNodes3D";
import { INodeIn3D, ZoneCategory } from "../interfaces/main";

interface SensorProps {
  position: [number, number, number];
  onClick: () => void;
  category: string;
}

const Sensor: React.FC<SensorProps> = ({ position, onClick, category }) => {
  const getColorByCategory = (category: string) => {
    switch (category) {
      case "bocamina":
        return "blue";
      case "extraction":
        return "gray";
      case "tunel":
        return "#2268e0";
      default:
        return "#FFFFFF";
    }
  };

  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color={getColorByCategory(category)}
        emissive="red"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const Connection3DAdvanced: React.FC<{
  startPos: [number, number, number];
  endPos: [number, number, number];
  color?: string;
}> = ({ startPos, endPos, color = "#FFFFFF" }) => {
  // Memoize start and end Vector3 objects
  const start = useMemo(
    () => new Vector3(startPos[0], startPos[1], startPos[2]),
    [startPos]
  );

  const end = useMemo(
    () => new Vector3(endPos[0], endPos[1], endPos[2]),
    [endPos]
  );

  // Calculate direction and length between points
  const direction = useMemo(
    () => new Vector3().subVectors(end, start),
    [start, end]
  );

  const length = useMemo(() => direction.length(), [direction]);

  // Midpoint between two endpoints
  const midPoint = useMemo(
    () => new Vector3().addVectors(start, end).multiplyScalar(0.5),
    [start, end]
  );

  // Use useRef to maintain a reference to the mesh
  const meshRef = useRef<Mesh>(null);

  // Apply correct orientation when mounting the component
  useEffect(() => {
    if (!meshRef.current) return;

    // Create a matrix to orient the cylinder
    const lookAt = new Matrix4().lookAt(start, end, new Vector3(0, 1, 0));

    // Apply rotation to the mesh
    meshRef.current.quaternion.setFromRotationMatrix(lookAt);

    // Rotate 90 degrees on X to orient the cylinder correctly
    meshRef.current.rotateX(Math.PI / 2);
  }, [start, end]);

  return (
    <mesh ref={meshRef} position={midPoint}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const Scene: React.FC<{ mineId: string }> = ({ mineId }) => {
  const [selectedNode, setSelectedNode] = useState<INodeIn3D | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const initialCameraPosition = useMemo(() => new Vector3(13, 13, 13), []);
  const { nodes3D, loading } = useMineNodes3D(mineId);
  const nodes3dData = nodes3D?.nodes;

  useEffect(() => {
    if (orbitControlsRef.current) {
      if (selectedNode) {
        const nodePosition = [
          selectedNode.position.x,
          selectedNode.position.y,
          selectedNode.position.z,
        ];

        orbitControlsRef.current.target.set(...nodePosition);
      } else {
        orbitControlsRef.current.target.set(0, 0, 0);
      }
      orbitControlsRef.current.update();
    }
  }, [selectedNode]);

  if (loading) return <h1>Cargando...</h1>;
  if (!nodes3dData) return null;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [7, 7, 7] }}
        onPointerMissed={() => {
          setSelectedNode(null);
          if (orbitControlsRef.current) {
            orbitControlsRef.current.target.set(0, 0, 0);
            orbitControlsRef.current.object.position.copy(
              initialCameraPosition
            );
            orbitControlsRef.current.update();
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Renderizar conexiones 3D entre sensores */}
        {nodes3dData.map((node) =>
          node.connections.map((connId) => {
            const endSensor = nodes3dData.find((s) => s.id === connId);
            if (!endSensor || node.id >= connId) return null;

            const connectionColor = "#FFFFFF";

            return (
              <Connection3DAdvanced
                key={`connection-${node.id}-${connId}`}
                startPos={[node.position.x, node.position.y, node.position.z]}
                endPos={[
                  endSensor.position.x,
                  endSensor.position.y,
                  endSensor.position.z,
                ]}
                color={connectionColor}
              />
            );
          })
        )}

        {/* Renderizar nodos con sus categorías */}
        {nodes3dData.map((sensor) => {
          const start = new Vector3(
            sensor.position.x,
            sensor.position.y,
            sensor.position.z
          );

          return (
            <group key={sensor.id}>
              {/* Nodo base */}
              <mesh position={start} onClick={() => setSelectedNode(sensor)}>
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

              {/* Texto de categoría con Billboard */}
              <Billboard
                position={[start.x, start.y + 0.5, start.z]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
              >
                <Text
                  fontSize={0.2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {ZoneCategory[sensor.zone.category]}
                </Text>
              </Billboard>

              {/* Texto de nombre con Billboard */}
              <Billboard
                position={[start.x, start.y + 0.8, start.z]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
              >
                <Text
                  fontSize={0.3}
                  color="lightgray"
                  anchorX="center"
                  anchorY="middle"
                >
                  {sensor.zone.name}
                </Text>
              </Billboard>
            </group>
          );
        })}

        <OrbitControls
          ref={orbitControlsRef}
          enableZoom={true}
          minDistance={0.5}
          maxDistance={100}
        />
      </Canvas>

      {/* Detalles del nodo seleccionado */}
      {selectedNode && (
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
      )}
    </div>
  );
};

export default Scene;

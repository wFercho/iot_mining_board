import { OrbitControls } from "@react-three/drei";
import { NodeDetails, NodeVisualization } from "./Node";
import { Connection3DAdvanced } from "./Connection3D";
import Dashboard from "../../layouts/Dashboard";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMineNodes3D } from "../../hooks/useMineNodes3D";
import { Vector3 } from "three";
import { useAppContext } from "../../state/appContext";
import { useParams } from "wouter";
import { INodeIn3D } from "../../interfaces/main";
import { Canvas } from "@react-three/fiber";

const Scene = () => {
  const { mine_id } = useParams();
  const { isDarkMode } = useAppContext();
  const [selectedNode, setSelectedNode] = useState<INodeIn3D | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const initialCameraPosition = useMemo(() => new Vector3(4, 4, 4), []);
  const { nodes3D, loading, error, wsConnected } = useMineNodes3D(mine_id);
  const nodes3dData = nodes3D?.nodes;
  const canvaContainerRef = useRef<HTMLDivElement>(null);

  // Efecto para mantener actualizado el nodo seleccionado cuando cambian los datos
  useEffect(() => {
    if (selectedNode && nodes3dData) {
      // Buscar el nodo seleccionado actualizado en los nuevos datos
      const updatedNode = nodes3dData.find(
        (node) => node.id === selectedNode.id
      );
      if (updatedNode) {
        setSelectedNode(updatedNode);
      }
    }
  }, [nodes3D, selectedNode]);

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
    <Dashboard pageName="Nodos sensores en mina">
      <div className="w-full px-4 py-2 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center">
          <div
            className={`h-3 w-3 rounded-full mr-2 ${
              wsConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">
            {wsConnected ? "Conectado" : "Desconectado"} - WebSocket
          </span>
        </div>
      </div>

      {error && (
        <div className="w-full p-2 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div
        className="dark:bg-black bg-gray-50 h-full w-[99%] relative"
        ref={canvaContainerRef}
      >
        <Canvas
          style={{ width: "100%" }}
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
          <pointLight position={[5, 5, 5]} intensity={1} />

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
          {nodes3dData.map((node) => (
            <NodeVisualization
              key={node.id}
              node={node}
              onClick={() => setSelectedNode(node)}
              isDarkMode={isDarkMode}
            />
          ))}

          <OrbitControls
            ref={orbitControlsRef}
            enableZoom={true}
            minDistance={0.5}
            maxDistance={100}
          />
        </Canvas>

        {/* Detalles del nodo seleccionado */}
        {selectedNode && <NodeDetails selectedNode={selectedNode} />}
      </div>
    </Dashboard>
  );
};

export default Scene;

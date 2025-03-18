import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Box, Text } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import { Vector3, CylinderGeometry, Matrix4 } from "three";

interface SensorData {
    id: number;
    position: [number, number, number];
    connections: number[];
    zone: "bocamina" | "tunel" | "extraction";
    label: string;
    variables: Record<string, number>;
}

const sensorsData: SensorData[] = [
    { id: 0, position: [0, 0, 0], connections: [1, 2], zone: "bocamina", label: "Bocamina 1", variables: { temperatura: 24, humedad: 78 } },
    { id: 1, position: [0, -1, -1], connections: [0, 3], zone: "tunel", label: "Túnel A", variables: { temperatura: 25, humedad: 80 } },
    { id: 2, position: [-1, -1, -1], connections: [0, 4], zone: "tunel", label: "Túnel B", variables: { temperatura: 26, humedad: 79 } },
    { id: 3, position: [0, -2, -2], connections: [1, 5], zone: "extraction", label: "Zona de Extracción A", variables: { temperatura: 27, humedad: 75 } },
    { id: 4, position: [-1, -2, -2], connections: [2, 6], zone: "extraction", label: "Zona de Extracción B", variables: { temperatura: 28, humedad: 74 } },
    { id: 5, position: [1, -2, -2], connections: [3, 7], zone: "tunel", label: "Túnel C", variables: { temperatura: 24, humedad: 76 } },
    { id: 6, position: [-1, -3, -3], connections: [9, 11], zone: "extraction", label: "Zona de Extracción C", variables: { temperatura: 29, humedad: 73 } },
    { id: 7, position: [1, -3, -3], connections: [8], zone: "extraction", label: "Zona de Extracción D", variables: { temperatura: 30, humedad: 72 } },
    { id: 8, position: [0, -3, -4], connections: [10], zone: "tunel", label: "Túnel D", variables: { temperatura: 25, humedad: 77 } },
    { id: 9, position: [-2, -3, -4], connections: [4, 8], zone: "extraction", label: "Zona de Extracción E", variables: { temperatura: 26, humedad: 75 } },
    { id: 10, position: [2, -3, -4], connections: [5, 8], zone: "extraction", label: "Zona de Extracción F", variables: { temperatura: 28, humedad: 74 } },
    { id: 11, position: [-1, -4, -5], connections: [14, 12, 13], zone: "tunel", label: "Túnel E", variables: { temperatura: 22, humedad: 78 } },
    { id: 12, position: [1, -4, -5], connections: [15], zone: "tunel", label: "Túnel F", variables: { temperatura: 29, humedad: 73 } },
    { id: 13, position: [0, -4, -6], connections: [8], zone: "extraction", label: "Zona de Extracción G", variables: { temperatura: 30, humedad: 72 } },
    { id: 14, position: [-2, -4, -6], connections: [9], zone: "tunel", label: "Túnel G", variables: { temperatura: 21, humedad: 79 } },
    { id: 15, position: [2, -4, -6], connections: [16], zone: "tunel", label: "Túnel H", variables: { temperatura: 28, humedad: 75 } },
    { id: 16, position: [0, -5, -7], connections: [11, 12], zone: "extraction", label: "Zona de Extracción H", variables: { temperatura: 26, humedad: 76 } },
];

interface SensorProps {
    position: [number, number, number];
    onClick: () => void;
    zone: SensorData["zone"]
}

const Sensor: React.FC<SensorProps> = ({ position, onClick, zone }) => {

    let color = "#FFFFFF"
    if (zone === "bocamina") {
        color = "blue"
    }
    if (zone === "extraction") {
        color = "gray"
    }
    if (zone === "tunel") {
        color = "#2268e0"
    }
    return (

        <mesh position={position} onClick={onClick}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} emissive="red" emissiveIntensity={0.5} />
        </mesh>
    );
}

const TunnelSegment: React.FC<{ start: Vector3; end: Vector3 }> = ({ start, end }) => {
    const midPoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();

    return (
        <mesh position={midPoint}>
            <boxGeometry args={[0.5, 0.5, length]} />
            <meshStandardMaterial color="red" transparent opacity={0.5} />
        </mesh>
    );
};

// Componente mejorado para crear una conexión 3D entre sensores con orientación correcta
const Connection3DAdvanced: React.FC<{ startPos: [number, number, number]; endPos: [number, number, number]; color?: string }> = ({
    startPos,
    endPos,
    color = "#FFD700" // Color dorado por defecto
}) => {
    const start = new Vector3(...startPos);
    const end = new Vector3(...endPos);

    // Calculamos la dirección y longitud entre los puntos
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();

    // Punto medio entre los dos extremos
    const midPoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);

    // Usamos useRef para mantener una referencia al mesh
    const meshRef = useRef<THREE.Mesh>(null);

    // Aplicamos la orientación correcta al montar el componente
    useEffect(() => {
        if (!meshRef.current) return;

        // Creamos una matriz para orientar el cilindro
        const lookAt = new Matrix4().lookAt(
            start,
            end,
            new Vector3(0, 1, 0)
        );

        // Aplicamos la rotación al mesh
        meshRef.current.quaternion.setFromRotationMatrix(lookAt);

        // Rotamos 90 grados en X para que el cilindro se oriente correctamente
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
                opacity={0.1}
            />
        </mesh>
    );
};

const Scene: React.FC = () => {
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
    const orbitControlsRef = useRef<any>(null);
    const initialCameraPosition = new Vector3(7, 7, 7);

    useEffect(() => {
        if (orbitControlsRef.current) {
            if (selectedSensor) {
                orbitControlsRef.current.target.set(...selectedSensor.position);
            } else {
                orbitControlsRef.current.target.set(0, 0, 0);
            }
            orbitControlsRef.current.update();
        }
    }, [selectedSensor]);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <Canvas
                camera={{ position: [15, 15, 15] }}
                onPointerMissed={() => {
                    setSelectedSensor(null);
                    if (orbitControlsRef.current) {
                        orbitControlsRef.current.target.set(0, 0, 0);
                        orbitControlsRef.current.object.position.copy(initialCameraPosition);
                        orbitControlsRef.current.update();
                    }
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Renderizar conexiones 3D entre sensores */}
                {sensorsData.map((sensor) =>
                    sensor.connections.map((connId) => {
                        const endSensor = sensorsData.find((s) => s.id === connId);
                        if (!endSensor) return null;

                        // Solo renderizar conexiones donde el ID del sensor actual sea menor que el ID de conexión
                        // para evitar conexiones duplicadas (ya que la conexión es bidireccional)
                        if (sensor.id < connId) {
                            // Asignar colores según la zona
                            const connectionColor = "#dedad9"; // Dorado por defecto

                            // if (sensor.zone === "tunel" && endSensor.zone === "tunel") {
                            //     connectionColor = "#4169E1"; // Azul real para túneles
                            // } else if (sensor.zone === "extraction" || endSensor.zone === "extraction") {
                            //     connectionColor = "#FF8C00"; // Naranja oscuro para extracción
                            // } else if (sensor.zone === "bocamina" || endSensor.zone === "bocamina") {
                            //     connectionColor = "#32CD32"; // Verde lima para bocamina
                            // }

                            return (
                                <Connection3DAdvanced
                                    key={`connection-${sensor.id}-${connId}`}
                                    startPos={sensor.position}
                                    endPos={endSensor.position}
                                    color={connectionColor}
                                />
                            );
                        }
                        return null;
                    })
                )}

                {/* Renderizar modelos 3D según la zona */}
                {sensorsData.map((sensor) =>
                    sensor.connections.map((connId) => {
                        const endSensor = sensorsData.find((s) => s.id === connId);
                        if (!endSensor) return null;

                        const start = new Vector3(...sensor.position);
                        const end = new Vector3(...endSensor.position);
                        const isSameZone = sensor.zone === endSensor.zone;

                        return (
                            <group key={`${sensor.id}-${connId}`}>
                                {/* {isSameZone && sensor.zone === "tunel" && <TunnelSegment start={start} end={end} />} */}
                                {/* {isSameZone && sensor.zone === "extraction" && (
                                    <Box args={[2, 2, 2]} position={[(sensor.position[0] + endSensor.position[0]) / 2, (sensor.position[1] + endSensor.position[1]) / 2, (sensor.position[2] + endSensor.position[2]) / 2]}>
                                        <meshStandardMaterial color="orange" transparent opacity={0.3} />
                                    </Box>
                                )} */}
                                {sensor.zone === "bocamina" && (
                                    <group>
                                        <mesh position={start}>
                                            <sphereGeometry args={[0.2, 16, 16]} />
                                            <meshStandardMaterial color="blue" transparent opacity={0.4} />
                                        </mesh>
                                        <Text position={[start.x, start.y + 0.7, start.z]} fontSize={0.3} color="white">{sensor.label}</Text>
                                    </group>
                                )}
                                {sensor.zone === "extraction" && (
                                    <group>
                                        <mesh position={start}>
                                            <sphereGeometry args={[0.2, 16, 16]} />
                                            <meshStandardMaterial color="orange" transparent opacity={0.4} />
                                        </mesh>
                                        {/* <Text position={[start.x, start.y + 0.7, start.z]} fontSize={0.3} color="white">{sensor.label}</Text> */}
                                    </group>
                                )}
                            </group>
                        );
                    })
                )}

                {/* Renderizar los sensores */}
                {sensorsData.map((sensor) => (
                    <Sensor key={sensor.id} position={sensor.position} zone={sensor.zone} onClick={() => setSelectedSensor(sensor)} />
                ))}

                <OrbitControls
                    ref={orbitControlsRef}
                    enableZoom={true}
                    minDistance={0.5}
                    maxDistance={100}
                />
            </Canvas>

            {selectedSensor && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 10, borderRadius: 5, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>Sensor ID: {selectedSensor.id}</h3>
                    <p>Zona: {selectedSensor.zone}</p>
                    <p>Etiqueta: {selectedSensor.label}</p>
                    <p>Posición: {selectedSensor.position.join(", ")}</p>
                    <h4>Variables Sensadas:</h4>
                    <ul>
                        {Object.entries(selectedSensor.variables).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Scene;
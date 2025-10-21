// components/DeviceTable.tsx
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { SensorModal } from "./SensorModal";
import { useSensorData } from "./hooks/useSensorData";
import { SensorData } from "../interfaces/Sensors";

const PAGE_SIZE = 10;


export default function DeviceTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof SensorData;
        direction: 'ascending' | 'descending'
    } | null>(null);
    const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
    const [showModal, setShowModal] = useState(false);


    // Usar el hook unificado
    const {
        getTableData,
        alerts,
        isConnected,
        connectionState,
        totalCount,
        okCount,
        criticalAlertsCount,
        warningAlertsCount,
        infoAlertsCount,
        dismissAlert
    } = useSensorData();

    // Obtener datos combinados para la tabla
    const tableData = getTableData();


    // Ordenar datos
    const sortedData = [...tableData];
    if (sortConfig !== null) {
        sortedData.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            // Manejar valores nulos/indefinidos
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (bVal == null) return sortConfig.direction === 'ascending' ? 1 : -1;

            // Comparación numérica cuando ambos son números
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
            }

            // Comparación por cadena (insensible a mayúsculas)
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (aStr < bStr) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aStr > bStr) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    // Filtrar datos
    const filteredData = sortedData.filter(item => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Filtro especial para alertas
        if (lowerSearchTerm === 'status:warning,danger,error') {
            return item.status === 'WARNING' || item.status === 'DANGER' || item.status === 'ERROR';
        }

        // Filtro para solo OK
        if (lowerSearchTerm === 'status:ok') {
            return item.status === 'OK';
        }

        // Filtro para solo alertas procesadas
        if (lowerSearchTerm === 'type:alert') {
            return alerts.some(alert => alert.sensorData.id === item.id);
        }

        // Filtro normal
        return (
            item.id.toLowerCase().includes(lowerSearchTerm) ||
            item.id.toLowerCase().includes(lowerSearchTerm) ||
            item.type.toLowerCase().includes(lowerSearchTerm) ||
            item.status?.toLowerCase().includes(lowerSearchTerm) ||
            item.manufacturer.toLowerCase().includes(lowerSearchTerm)
        );
    });

    // Manejar clic en notificación
    const handleNotificationClick = useCallback((sensorId: string) => {
        const sensorIndex = tableData.findIndex(m => m.id === sensorId);

        if (sensorIndex === -1) return;

        const filteredIndex = filteredData.findIndex(m => m.id === sensorId);
        const page = Math.ceil((filteredIndex + 1) / PAGE_SIZE);

        setSearchTerm(sensorId);
        setCurrentPage(page);
        setHighlightedRow(sensorId);

        setTimeout(() => setHighlightedRow(null), 3000);
    }, [tableData, filteredData]);

    // Manejar clic en fila
    const handleRowClick = (sensor: SensorData) => {
        setSelectedSensor(sensor);
        setShowModal(true);
    };

    // Procesar parámetros de URL
    useEffect(() => {
        const alertId = searchParams.get('alert');
        if (alertId) {
            handleNotificationClick(alertId);
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('alert');
                return newParams;
            });
        }
    }, [searchParams, handleNotificationClick, setSearchParams]);

    // Paginación
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const requestSort = (key: keyof SensorData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Datos para filtros
    const alertData = tableData.filter(m =>
        m.status === 'WARNING' || m.status === 'DANGER' || m.status === 'ERROR'
    );

    console.log("📊 DeviceTable: Estado actual", {
        totalData: tableData.length,
        filteredData: filteredData.length,
        alertsCount: alerts.length,
        criticalAlerts: criticalAlertsCount
    });

    // Función para mapear estados a español
    const mapStatusToSpanish = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            // Estados originales
            'OK': 'NORMAL',
            'WARNING': 'ADVERTENCIA',
            'DANGER': 'PELIGRO',
            'ERROR': 'ERROR',
            // Tipos de alerta
            'critical': 'CRÍTICO',
            'warning': 'ADVERTENCIA',
            'info': 'INFORMATIVO'
        };

        return statusMap[status] || status.toUpperCase();
    };
    return (
        <div className="flex flex-col h-screen">
            {showModal && selectedSensor && (
                <SensorModal
                    sensor={selectedSensor}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
                        {connectionState === 'connecting' && " (Conectando...)"}
                        {connectionState === 'error' && " (Error)"} |
                        <span className="ml-2 text-sm font-normal text-gray-600">
                            Mostrando {filteredData.length} registros
                        </span>
                    </h2>

                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Buscar nodo, tipo o fabricante..."
                            className="px-3 py-2 border rounded-md text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtros rápidos mejorados */}
                <div className="mb-4 flex space-x-2 flex-wrap gap-2">
                    <button
                        onClick={() => setSearchTerm('')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${!searchTerm
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        Todos ({totalCount})
                    </button>
                    <button
                        onClick={() => setSearchTerm('status:OK')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${searchTerm === 'status:OK'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        OK ({okCount})
                    </button>
                    <button
                        onClick={() => setSearchTerm('status:WARNING,DANGER,ERROR')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${searchTerm === 'status:WARNING,DANGER,ERROR'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        Alertas ({alertData.length})
                    </button>
                    <button
                        onClick={() => setSearchTerm('type:alert')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${searchTerm === 'type:alert'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        Alertas Procesadas ({alerts.length})
                    </button>

                    {/* Contadores de alertas procesadas */}
                    <div className="flex items-center space-x-2 ml-4 text-xs">
                        <span className="text-gray-600">Alertas Activas:</span>
                        {criticalAlertsCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                🔴 {criticalAlertsCount}
                            </span>
                        )}
                        {warningAlertsCount > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                🟡 {warningAlertsCount}
                            </span>
                        )}
                        {infoAlertsCount > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                🔵 {infoAlertsCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tabla (mantener tu JSX existente) */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer hover:bg-gray-700"
                                    onClick={() => requestSort('node_id')}
                                >
                                    Nodo {sortConfig?.key === 'node_id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer hover:bg-gray-700"
                                    onClick={() => requestSort('type')}
                                >
                                    Tipo {sortConfig?.key === 'type' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                    Valor
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer hover:bg-gray-700"
                                    onClick={() => requestSort('manufacturer')}
                                >
                                    Fabricante {sortConfig?.key === 'manufacturer' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer hover:bg-gray-700"
                                    onClick={() => requestSort('timestamp')}
                                >
                                    Fecha {sortConfig?.key === 'timestamp' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => {
                                    // Obtener la alerta completa para este sensor
                                    const alert = alerts.find(alert => alert.sensorData.id === item.id);
                                    const hasAlert = !!alert; // Convertir a booleano

                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            id={`sensor-${item.id}`}
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${highlightedRow === item.id ? 'bg-blue-100 animate-pulse' : ''
                                                } ${hasAlert
                                                    ? `ring-2 ${alert.type === 'critical' ? 'ring-red-400 bg-red-50 hover:bg-red-100' :
                                                        alert.type === 'warning' ? 'ring-yellow-400 bg-yellow-50 hover:bg-yellow-100' :
                                                            'ring-blue-400 bg-blue-50 hover:bg-blue-100'
                                                    }`
                                                    : `${item.status === 'ERROR' ? 'bg-red-50 hover:bg-red-100' :
                                                        item.status === 'DANGER' ? 'bg-red-50 hover:bg-red-100' :
                                                            item.status === 'WARNING' ? 'bg-yellow-50 hover:bg-yellow-100' :
                                                                'bg-green-50 hover:bg-green-100'
                                                    }`
                                                }`}
                                            onClick={() => handleRowClick(alert ? alert.sensorData : item)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    {hasAlert && (
                                                        <span className={`
                                ${alert.type === 'critical' ? 'text-red-600' :
                                                                alert.type === 'warning' ? 'text-yellow-600' :
                                                                    'text-blue-600'}
                            `}>
                                                            ⚠️
                                                        </span>
                                                    )}
                                                    {!hasAlert && (
                                                        <>
                                                            {item.status === 'OK' && '🟢'}
                                                            {item.status === 'WARNING' && '🟡'}
                                                            {(item.status === 'DANGER' || item.status === 'ERROR') && '🔴'}
                                                        </>
                                                    )}
                                                    <span className="ml-2">{item.node_id}</span>
                                                    {hasAlert && (
                                                        <span className={`
                                ml-2 px-2 py-1 text-xs font-semibold rounded-full
                                ${alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'}
                            `}>
                                                            {alert.type.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.type}
                                                {hasAlert && alert.ruleId && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Regla: {alert.ruleId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{item.value.toFixed(2)} {item.unit}</span>
                                                    {hasAlert && (
                                                        <span className="text-xs text-gray-600 mt-1">
                                                            {alert.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.manufacturer} ({item.model})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                    {hasAlert && (
                                                        <span className="text-xs text-gray-500">
                                                            Alerta: {alert.time}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hasAlert
                                                        ? alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        : item.status === 'OK' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {hasAlert ? `${mapStatusToSpanish(alert.type)}` : mapStatusToSpanish(item.status)}
                                                    </span>
                                                    {hasAlert && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Evitar que se active el click de la fila
                                                                dismissAlert(alert.id);
                                                            }}
                                                            className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Descartar alerta
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación (mantener tu JSX existente) */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Mostrando {paginatedData.length} de {filteredData.length} registros
                        {searchTerm && ` • Filtro: "${searchTerm}"`}
                    </div>
                    <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded transition-colors ${currentPage === pageNum
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-3 py-1 text-gray-500">...</span>
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
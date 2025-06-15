// pages/SensorDashboard.tsx
import { useState, useEffect } from 'react';
import { Sensor, SensorService } from '../services/SensorServices';
import { SensorForm } from '../components/Forms/SensorForm';
import { SensorTable } from '../components/Tables/SensorTables';
import SensorChart from './SensorChart';

export const SensorDashboard = () => {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSensors = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await SensorService.getSensors(page);
      console.log(items, total)
      setSensors(items);
      setTotalPages(Math.ceil(total / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchSensors(currentPage);
    }
  }, [view, currentPage]);

  const handleCreate = () => {
    setSelectedSensor(null);
    setView('form');
  };

  const handleEdit = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setView('form');
  };

  const handleView = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setView('detail');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este sensor?')) {
      setLoading(true);
      try {
        await SensorService.deleteSensor(id);
        fetchSensors(currentPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    fetchSensors(currentPage);
    setView('list');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Sensores</h1>
        {view === 'list' && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Nuevo Sensor
          </button>
        )}
        {view !== 'list' && (
          <button
            onClick={() => setView('list')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Volver
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && view === 'list' ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : view === 'list' ? (
        <>
          <SensorTable
            sensors={sensors}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : view === 'form' ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {selectedSensor ? 'Editar Sensor' : 'Crear Nuevo Sensor'}
          </h2>
          <SensorForm
            initialData={selectedSensor || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setView('list')}
          />
        </div>
      )  : view === 'detail' && selectedSensor ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Detalle del Sensor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Información Básica</h3>
                <p>Variable: {selectedSensor.variable}</p>
                <p>Marca: {selectedSensor.marca}</p>
                <p>Referencia: {selectedSensor.referencia}</p>
              </div>
              <div>
                <h3 className="font-medium">Especificaciones</h3>
                <p>Rango: {selectedSensor.min_medicion} - {selectedSensor.max_medicion} {selectedSensor.unidad_medicion}</p>
                <p>Precisión: ±{selectedSensor.precision}</p>
                <p>Resolución: {selectedSensor.resolucion}</p>
              </div>
            </div>
          </div>

          {/* Componente SensorChart integrado */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Histórico de Mediciones</h3>
            <SensorChart 
              sensorId={selectedSensor.id} 
              initialTimeRange="24h" 
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
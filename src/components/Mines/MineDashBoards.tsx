// components/MineDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Building, 
  Router, 
  Activity,
  Plus,
  ArrowLeft,
  Cpu,
  Radio
} from 'lucide-react';
import { MineTable } from '../Tables/MineTable';
import { MineForm } from '../Forms/MineForm';
import { MineDetailView } from './MineDetailView';
import { MineService } from '../../services/MinesServices';
import { MineStats, MineZone, PaginatedResponse } from '../../interfaces/Mines';

export const MineDashboard = () => {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [mines, setMines] = useState<MineZone[]>([]);
  const [selectedMine, setSelectedMine] = useState<MineZone | null>(null);
  const [stats, setStats] = useState<MineStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMines = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse = await MineService.getMines(page);
      setMines(response.items);
      setTotalPages(Math.ceil(response.total / response.per_page));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await MineService.getMineStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchMines(currentPage);
      fetchStats();
    }
  }, [view, currentPage]);

  const handleCreate = () => {
    setSelectedMine(null);
    setView('form');
  };

  const handleEdit = (mine: MineZone) => {
    setSelectedMine(mine);
    setView('form');
  };

  const handleView = (mine: MineZone) => {
    setSelectedMine(mine);
    setView('detail');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta mina?')) {
      setLoading(true);
      try {
        await MineService.deleteMine(id);
        fetchMines(currentPage);
        fetchStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    fetchMines(currentPage);
    fetchStats();
    setView('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard de Minas
              </h1>
              <p className="text-gray-600 mt-2">Sistema de monitoreo y gestión integral</p>
            </div>
            {view === 'list' && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nueva Mina</span>
              </button>
            )}
            {view !== 'list' && (
              <button
                onClick={() => setView('list')}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver al Listado</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading && view === 'list' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : view === 'list' ? (
          <>
            {/* Estadísticas */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Minas</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMines}</p>
                      </div>
                      <div className="p-4 rounded-full bg-blue-600 bg-opacity-10">
                        <Building className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Minas Activas</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeMines}</p>
                      </div>
                      <div className="p-4 rounded-full bg-green-600 bg-opacity-10">
                        <Activity className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Gateways</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalGateways}</p>
                      </div>
                      <div className="p-4 rounded-full bg-purple-600 bg-opacity-10">
                        <Router className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Nodos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSensorNodes}</p>
                      </div>
                      <div className="p-4 rounded-full bg-orange-600 bg-opacity-10">
                        <Cpu className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-200">
                  <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Sensores</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSensors}</p>
                      </div>
                      <div className="p-4 rounded-full bg-red-600 bg-opacity-10">
                        <Radio className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de Minas */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              {/* Table Header */}
            

              <MineTable
                mines={mines}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
              />
              
              {/* Paginación */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700"
                  >
                    ← Anterior
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">
                      Total: {mines.length} minas
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : view === 'form' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
              <h2 className="text-white font-bold text-lg">
                {selectedMine ? 'Editar Mina' : 'Crear Nueva Mina'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {selectedMine ? 'Modifique la información de la zona minera' : 'Complete el formulario para registrar una nueva zona minera'}
              </p>
            </div>
            <div className="p-8">
              <MineForm
                initialData={selectedMine || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setView('list')}
              />
            </div>
          </div>
        ) : view === 'detail' && selectedMine ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
              <h2 className="text-white font-bold text-lg">Detalles de la Mina</h2>
              <p className="text-indigo-100 text-sm">Información completa y dispositivos asociados</p>
            </div>
            <MineDetailView 
              mine={selectedMine}
              onBack={() => setView('list')}
              onEdit={() => handleEdit(selectedMine)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
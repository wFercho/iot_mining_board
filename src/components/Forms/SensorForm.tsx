// components/SensorForm.tsx
import { useState } from 'react';
import { Sensor, SensorService } from '../../services/SensorServices';

interface SensorFormProps {
  initialData?: Partial<Sensor>;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SensorForm = ({ initialData, onSuccess, onCancel }: SensorFormProps) => {
  const [formData, setFormData] = useState<Partial<Sensor>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? checked : 
              value 
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (formData.id) {
        await SensorService.updateSensor(formData.id, formData);
      } else {
        await SensorService.createSensor(formData as Omit<Sensor, 'id'>);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Opciones para selects
  const timeUnits = ['s', 'ms', 'us', 'min', 'h'];
  const durabilityUnits = ['años', 'meses', 'dias', 'horas'];
  const voltageTypes = ['DC', 'AC'];
  const installationModes = ['superficie', 'empotrado', 'colgante', 'subterraneo'];
  const outputTypes = ['Digital', 'Analógica', 'RS485', 'Modbus', '4-20mA', '0-10V'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 p-2 bg-red-50 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna Izquierda */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Variable*</label>
            <input
              type="text"
              name="variable"
              value={formData.variable || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca*</label>
            <input
              type="text"
              name="marca"
              value={formData.marca || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Referencia*</label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Nodo*</label>
            <input
              type="text"
              name="id_node"
              value={formData.id_node || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad de Medición*</label>
            <input
              type="text"
              name="unidad_medicion"
              value={formData.unidad_medicion || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Máxima Medición*</label>
              <input
                type="number"
                name="max_medicion"
                value={formData.max_medicion ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mínima Medición*</label>
              <input
                type="number"
                name="min_medicion"
                value={formData.min_medicion ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                step="any"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Precisión</label>
            <input
              type="number"
              name="precision"
              value={formData.precision ?? ''}
              onChange={handleNumericChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="any"
            />
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiempo Respuesta (Valor)</label>
              <input
                type="number"
                name="tiempo_respuesta_valor"
                value={formData.tiempo_respuesta_valor ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tiempo Respuesta (Unidad)</label>
              <select
                name="tiempo_respuesta_unidad"
                value={formData.tiempo_respuesta_unidad || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                {timeUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Resolución</label>
            <input
              type="number"
              name="resolucion"
              value={formData.resolucion ?? ''}
              onChange={handleNumericChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="any"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperatura Máx (°C)</label>
              <input
                type="number"
                name="temperatura_max"
                value={formData.temperatura_max ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Temperatura Mín (°C)</label>
              <input
                type="number"
                name="temperatura_min"
                value={formData.temperatura_min ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Voltaje</label>
            <select
              name="voltaje_tipo"
              value={formData.voltaje_tipo || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              {voltageTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Voltaje Mín (V)</label>
              <input
                type="number"
                name="voltaje_min"
                value={formData.voltaje_min ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Voltaje Máx (V)</label>
              <input
                type="number"
                name="voltaje_max"
                value={formData.voltaje_max ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Corriente Mín (A)</label>
              <input
                type="number"
                name="corriente_min"
                value={formData.corriente_min ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Corriente Máx (A)</label>
              <input
                type="number"
                name="corriente_max"
                value={formData.corriente_max ?? ''}
                onChange={handleNumericChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de campos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Durabilidad (Valor)</label>
          <input
            type="number"
            name="durabilidad_valor"
            value={formData.durabilidad_valor ?? ''}
            onChange={handleNumericChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Durabilidad (Unidad)</label>
          <select
            name="durabilidad_unidad"
            value={formData.durabilidad_unidad || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            {durabilityUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Modo de Instalación</label>
          <select
            name="modo_instalacion"
            value={formData.modo_instalacion || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            {installationModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Salida</label>
          <select
            name="tipo_salida"
            value={formData.tipo_salida || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            {outputTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Certificados</label>
          <input
            type="text"
            name="certificados"
            value={formData.certificados || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="ISO, CE, UL, etc."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
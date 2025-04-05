import { Link } from "wouter";
import { useMines } from "../hooks/useMines";

const MinesTable = () => {
  const { mines, loading, error, updateQueryParams, pageCount, queryParams } =
    useMines({
      limit: 15,
      status: "active",
    });

  if (loading) return <div>Cargando minas...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Empresa
            </th>
            <th scope="col" className="px-6 py-3">
              Departamento
            </th>
            <th scope="col" className="px-6 py-3">
              Ciudad / Municipio
            </th>
            <th scope="col" className="px-6 py-3">
              3D
            </th>
          </tr>
        </thead>
        <tbody>
          {mines.map(({ id, name, company_name, department, city }) => (
            <tr
              key={id}
              className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
            >
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {name}
              </th>
              <td className="px-6 py-4">{company_name}</td>
              <td className="px-6 py-4">{department}</td>
              <td className="px-6 py-4">{city}</td>
              <td className="px-6 py-4">
                <Link
                  href={`/mine-nodes-3d/${id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { MinesTable };

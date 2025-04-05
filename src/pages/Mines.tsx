import { Link } from "wouter";
import { MinesTable } from "../components/MinesTable";
import Dashboard from "../layouts/Dashboard";

function Mines() {
  return (
    <Dashboard pageName="Minas">
      <div className="flex justify-end mb-4">
        <Link href="/mines/new">
          <button className="bg-blue-500 hover:bg-blue-700 text-white  py-2 px-4 rounded">
            Nueva mina
          </button>
        </Link>
      </div>
      <MinesTable />
    </Dashboard>
  );
}

export default Mines;

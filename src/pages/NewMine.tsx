import MineRegistrationForm from "../components/Mine/NewMineForm";
import Dashboard from "../layouts/Dashboard";

function NewMine() {
  return (
    <Dashboard pageName="Formulario Registro de Mina">
      <MineRegistrationForm />
    </Dashboard>
  );
}

export default NewMine;

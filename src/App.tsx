import { HashRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import MasterData from "./pages/admin/MasterData";
import Facilities from "./pages/Facilities";
import Shelters from "./pages/Shelters";
import Distributions from "./pages/Distributions";
import Health from "./pages/Health";
import Protection from "./pages/Protection";
import MapView from "./pages/MapView";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import DangerZones from "./pages/DangerZones";
import AuditLogs from "./pages/admin/AuditLogs";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapView />} />

          <Route path="facilities" element={<Facilities />} />
          <Route path="shelters" element={<Shelters />} />
          <Route path="distributions" element={<Distributions />} />
          <Route path="health" element={<Health />} />

          <Route path="protection" element={<Protection />} />

          <Route path="danger-zones" element={<DangerZones />} />
          <Route path="admin" element={<MasterData />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/audit" element={<AuditLogs />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}


export default App;

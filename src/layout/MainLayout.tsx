import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Map as MapIcon, 
  Building2, 
  Home, 
  Package, 
  Stethoscope, 
  Shield, 
  Settings, 
  AlertTriangle,
  Menu,
  Users,
  Activity,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuickEntryDialog } from "@/components/QuickEntryDialog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { exportPlatformData } from "@/lib/exportUtils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: BarChart3, path: "/" },
  { label: "Map View", icon: MapIcon, path: "/map" },
  { label: "Facilities", icon: Building2, path: "/facilities" },
  { label: "Shelters", icon: Home, path: "/shelters" },
  { label: "Distributions", icon: Package, path: "/distributions" },
  { label: "Health", icon: Stethoscope, path: "/health" },
  { label: "Protection", icon: Shield, path: "/protection" },
  { label: "Danger Zones", icon: AlertTriangle, path: "/danger-zones" },
  { label: "Admin - Master Data", icon: Settings, path: "/admin" },
  { label: "Admin - Users", icon: Users, path: "/admin/users" },
  { label: "Admin - Audit Logs", icon: Activity, path: "/admin/audit" },
];

export default function MainLayout() {
  const location = useLocation();
  const facilities = useQuery(api.facilities.getFacilities, {});
  const shelterUpdates = useQuery(api.shelters.getLatestShelterUpdates);
  const distributions = useQuery(api.distributions.getDistributions);

  const handleExport = async () => {
    if (!facilities) return;
    await exportPlatformData(facilities, shelterUpdates, distributions);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white dark:bg-slate-900 lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <Shield className="h-6 w-6" />
            <span>Emergency Ops</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("h-4 w-4", location.pathname === item.path && "text-primary")} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">National Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-slate-900 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 px-4 lg:px-0">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Lebanon National Operations Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={!facilities}
            >
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <QuickEntryDialog trigger={
              <Button size="sm">New Entry</Button>
            } />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

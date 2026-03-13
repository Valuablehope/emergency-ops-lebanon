import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Home, Truck, Activity, Shield } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const facilities = useQuery(api.facilities.getFacilities, {});
  const shelterStats = useQuery(api.shelters.getLatestShelterUpdates);
  const governorates = useQuery(api.masterData.getGovernorates);
  const partners = useQuery(api.masterData.getPartners);

  const totalOccupancy = shelterStats?.reduce((acc: number, curr: any) => acc + curr.occupancy, 0) || 0;
  const totalCapacity = shelterStats?.reduce((acc: number, curr: any) => acc + curr.capacity, 0) || 0;

  // Process data for charts
  const occupancyByGov = governorates?.map((gov: any) => {
    const sheltersInGov = facilities?.filter((f: any) => f.governorateId === gov._id && f.type === "Shelter") || [];
    const occupancy = shelterStats?.filter((s: any) => sheltersInGov.some((f: any) => f._id === s.facilityId))
      .reduce((acc: number, curr: any) => acc + curr.occupancy, 0) || 0;
    return { name: gov.nameEn, count: occupancy };
  }).filter((g: any) => g.count > 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">National Operations Platform</h2>
          <p className="text-muted-foreground">Lebanon Emergency Response - Situational Overview</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total IDPs in Shelters</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalOccupancy.toLocaleString()}</div>
            <p className="text-xs text-blue-600">Across {shelterStats?.length || 0} shelters</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Shelter Capacity</CardTitle>
            <Home className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%</div>
            <p className="text-xs text-emerald-600">{Math.max(0, totalCapacity - totalOccupancy)} spots available</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Active Partners</CardTitle>
            <Shield className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{partners?.length || 0}</div>
            <p className="text-xs text-amber-600">Across all sectors</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Operational Facilities</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{facilities?.length || 0}</div>
            <p className="text-xs text-purple-600">{facilities?.filter((f: any) => f.status === "active").length || 0} active currently</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Shelter Occupancy by Governorate</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyByGov.length > 0 ? occupancyByGov : [{ name: "No Data", count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Facility Breakdown</CardTitle>
            <CardDescription>By response sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Shelters", value: facilities?.filter((f: any) => f.type === "Shelter").length || 0 },
                      { name: "Health", value: facilities?.filter((f: any) => f.type === "PHCC" || f.type === "Hospital").length || 0 },
                      { name: "MMUs", value: facilities?.filter((f: any) => f.type === "MMU").length || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest submissions from field operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shelterStats?.slice(0, 5).map((update: any) => (
              <div key={update._id} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Shelter Update</p>
                  <p className="text-xs text-muted-foreground">
                    {facilities?.find((f: any) => f._id === update.facilityId)?.name} occupancy: {update.occupancy}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            {(!shelterStats || shelterStats.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

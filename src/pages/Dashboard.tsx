import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Home, Truck, Activity, Shield, MapPin } from "lucide-react";
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

const MOCK_DATA = [
  { name: "Beirut", count: 400 },
  { name: "Mount Lebanon", count: 300 },
  { name: "North", count: 200 },
  { name: "Bekaa", count: 150 },
  { name: "South", count: 350 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const facilities = useQuery(api.facilities.getFacilities, {});
  const shelterStats = useQuery(api.shelters.getLatestShelterUpdates);

  const totalOccupancy = shelterStats?.reduce((acc, curr) => acc + curr.occupancy, 0) || 0;
  const totalCapacity = shelterStats?.reduce((acc, curr) => acc + curr.capacity, 0) || 0;

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
            <div className="text-2xl font-bold text-emerald-900">{Math.round((totalOccupancy / totalCapacity) * 100) || 0}%</div>
            <p className="text-xs text-emerald-600">{totalCapacity - totalOccupancy} spots available</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Active Partners</CardTitle>
            <Shield className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">42</div>
            <p className="text-xs text-amber-600">Representing 12 Sectors</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Distributions (24h)</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">1,240</div>
            <p className="text-xs text-purple-600">+18% since yesterday</p>
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
                <BarChart data={MOCK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
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
                      { name: "Shelters", value: facilities?.filter(f => f.type === "Shelter").length || 0 },
                      { name: "Health", value: facilities?.filter(f => f.type === "PHCC" || f.type === "Hospital").length || 0 },
                      { name: "Protection", value: facilities?.filter(f => f.type === "PSU").length || 0 },
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New Distribution Logged</p>
                  <p className="text-xs text-muted-foreground">Partner X delivered 500 kits to Akkar Shelter A</p>
                </div>
                <div className="text-xs text-muted-foreground">2h ago</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Home, Users, ArrowUpRight, AlertCircle } from "lucide-react";

export default function Shelters() {
  const shelters = useQuery(api.facilities.getFacilities, { type: "Shelter" });
  const latestUpdates = useQuery(api.shelters.getLatestShelterUpdates);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shelter Management</h2>
          <p className="text-muted-foreground">Monitor occupancy, capacity, and infrastructure status across collective shelters.</p>
        </div>
        <Button><Home className="mr-2 h-4 w-4" /> New Update</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,000</div>
            <p className="text-xs text-muted-foreground">83% utilization rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2,550</div>
            <p className="text-xs text-muted-foreground">Across 14 Governorates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shelter Occupancy & Status</CardTitle>
          <CardDescription>Live data from field submissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shelter Name</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>WASH Status</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shelters?.map((shelter) => {
                const update = latestUpdates?.find(u => u.facilityId === shelter._id);
                const util = update ? Math.round((update.occupancy / update.capacity) * 100) : 0;
                
                return (
                  <TableRow key={shelter._id}>
                    <TableCell className="font-medium">{shelter.name}</TableCell>
                    <TableCell>{update?.occupancy || 0}</TableCell>
                    <TableCell>{update?.capacity || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              util > 90 ? "bg-red-500" : util > 70 ? "bg-amber-500" : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs">{util}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        update?.washStatus === "Good" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {update?.washStatus || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {update ? new Date(update.timestamp).toLocaleDateString() : "Never"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to keep the file clean
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

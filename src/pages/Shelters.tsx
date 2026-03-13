import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Users, ArrowUpRight, AlertCircle } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const INITIAL_UPDATE_STATE = {
  facilityId: "" as Id<"facilities">,
  occupancy: 0,
  capacity: 0,
  femaleCount: 0,
  maleCount: 0,
  childrenCount: 0,
  elderlyCount: 0,
  pwdCount: 0,
  washStatus: "Good",
  infrastructureStatus: "Functional",
  protectionIssues: ""
};

export default function Shelters() {
  const shelters = useQuery(api.facilities.getFacilities, { type: "Shelter" });
  const latestUpdates = useQuery(api.shelters.getLatestShelterUpdates);
  const users = useQuery(api.users.getUsers);
  const addUpdate = useMutation(api.shelters.addShelterUpdate);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_UPDATE_STATE);

  const handleCreateUpdate = async () => {
    if (!formData.facilityId || !users?.[0]) {
      alert("Please select a shelter and ensure a reporting user is available.");
      return;
    }

    try {
      await addUpdate({
        ...formData,
        reportingUser: users[0]._id, // Using first user as reporter for MVP
      });
      setIsOpen(false);
      setFormData(INITIAL_UPDATE_STATE);
    } catch (error) {
      console.error("Failed to add shelter update:", error);
      alert("Error saving update.");
    }
  };

  const handleShelterChange = (facilityId: Id<"facilities">) => {
    const lastUpdate = latestUpdates?.find(u => u.facilityId === facilityId);
    if (lastUpdate) {
      setFormData({
        facilityId,
        occupancy: lastUpdate.occupancy,
        capacity: lastUpdate.capacity,
        femaleCount: lastUpdate.femaleCount,
        maleCount: lastUpdate.maleCount,
        childrenCount: lastUpdate.childrenCount,
        elderlyCount: lastUpdate.elderlyCount,
        pwdCount: lastUpdate.pwdCount,
        washStatus: lastUpdate.washStatus,
        infrastructureStatus: lastUpdate.infrastructureStatus,
        protectionIssues: lastUpdate.protectionIssues || ""
      });
    } else {
      setFormData({
        ...INITIAL_UPDATE_STATE,
        facilityId
      });
    }
  };

  const totalOccupancy = latestUpdates?.reduce((acc, curr) => acc + curr.occupancy, 0) || 0;
  const totalCapacity = latestUpdates?.reduce((acc, curr) => acc + curr.capacity, 0) || 0;
  const utilRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  const criticalCount = latestUpdates?.filter(u => u.washStatus !== "Good" || u.occupancy >= u.capacity).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shelter Management</h2>
          <p className="text-muted-foreground">Monitor occupancy, capacity, and infrastructure status across collective shelters.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}><Home className="mr-2 h-4 w-4" /> New Update</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Shelter Update</DialogTitle>
              <DialogDescription>Submit live occupancy and status data for a collective shelter.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="grid gap-2 col-span-2">
                <Label>Shelter</Label>
                <Select value={formData.facilityId} onValueChange={(val) => handleShelterChange(val as Id<"facilities">)}>
                  <SelectTrigger><SelectValue placeholder="Select shelter" /></SelectTrigger>
                  <SelectContent>
                    {shelters?.map(s => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Current Occupancy (Indiv.)</Label>
                <Input type="number" value={formData.occupancy} onChange={e => setFormData({...formData, occupancy: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2">
                <Label>Current Capacity (Indiv.)</Label>
                <Input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2 text-xs border-t pt-4">
                <Label>Female Count</Label>
                <Input type="number" value={formData.femaleCount} onChange={e => setFormData({...formData, femaleCount: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2 text-xs border-t pt-4">
                <Label>Male Count</Label>
                <Input type="number" value={formData.maleCount} onChange={e => setFormData({...formData, maleCount: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2">
                <Label>WASH Status</Label>
                <Select value={formData.washStatus} onValueChange={val => setFormData({...formData, washStatus: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair (Needs attention)</SelectItem>
                    <SelectItem value="Poor">Poor (Critical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Infrastructure Status</Label>
                <Select value={formData.infrastructureStatus} onValueChange={val => setFormData({...formData, infrastructureStatus: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Functional">Functional</SelectItem>
                    <SelectItem value="Partial">Partial Damage</SelectItem>
                    <SelectItem value="Destroyed">Destroyed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUpdate}>Submit Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccupancy.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Individuals tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{utilRate}% utilization rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(totalCapacity - totalOccupancy).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Remaining capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
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
                const util = update && update.capacity > 0 ? Math.round((update.occupancy / update.capacity) * 100) : 0;
                
                return (
                  <TableRow key={shelter._id}>
                    <TableCell className="font-medium">{shelter.name}</TableCell>
                    <TableCell className="font-bold">{update?.occupancy || 0}</TableCell>
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
                        <span className="text-xs font-medium">{util}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        update?.washStatus === "Good" ? "bg-green-50 text-green-700" : update?.washStatus === "Fair" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        {update?.washStatus || "No Data"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {update ? new Date(update.timestamp).toLocaleString() : "Never"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {shelters?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No shelters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to keep the file clean
function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

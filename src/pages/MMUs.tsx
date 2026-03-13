import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, MapPin, Plus, Check, X, AlertCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Id } from "../../convex/_generated/dataModel";

const INITIAL_UPDATE_STATE = {
  facilityId: "" as Id<"facilities">,
  caseManagement: true,
  pssActivities: true,
  capacity: 0,
  currentCases: 0,
  outreachTeams: 0,
};

export default function MMUs() {
  const mmuFacilities = useQuery(api.facilities.getFacilities, {});
  const latestUpdates = useQuery(api.mmus.getLatestMMUUpdates);
  const stats = useQuery(api.mmus.getMMUStats);
  const users = useQuery(api.users.getUsers);
  const addUpdate = useMutation(api.mmus.addMMUUpdate);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_UPDATE_STATE);

  // Filter facilities that are either type "MMU" or have relevant sectors
  const relevantFacilities = (mmuFacilities as any[])?.filter((f: any) => 
    f.type === "MMU" || f.sectors?.includes("Protection") || f.sectors?.includes("Health")
  ) || [];

  const handleCreateUpdate = async () => {
    if (!formData.facilityId || !users?.[0]) {
      alert("Please select a unit and ensure a reporting user is available.");
      return;
    }

    try {
      await addUpdate({
        ...formData,
        reportingUser: users[0]._id,
      });
      setIsOpen(false);
      setFormData(INITIAL_UPDATE_STATE);
    } catch (error) {
      console.error("Failed to add MMU update:", error);
      alert("Error saving update.");
    }
  };

  const handleFacilityChange = (facilityId: Id<"facilities">) => {
    const lastUpdate = latestUpdates?.find((u: any) => u.facilityId === facilityId);
    if (lastUpdate) {
      setFormData({
        facilityId,
        caseManagement: lastUpdate.caseManagement,
        pssActivities: lastUpdate.pssActivities,
        capacity: lastUpdate.capacity,
        currentCases: lastUpdate.currentCases,
        outreachTeams: lastUpdate.outreachTeams,
      });
    } else {
      setFormData({
        ...INITIAL_UPDATE_STATE,
        facilityId
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medical Mobile Units (MMUs)</h2>
          <p className="text-muted-foreground">Monitoring medical outreach and mobile clinical teams.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Update</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>MMU Status Update</DialogTitle>
              <DialogDescription>Submit periodic status data for a medical mobile unit.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Unit / Facility</Label>
                <Select value={formData.facilityId} onValueChange={(val) => handleFacilityChange(val as Id<"facilities">)}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {relevantFacilities.map(f => (
                      <SelectItem key={f._id} value={f._id}>{f.name} {f.type !== "MMU" ? `(${f.type})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Clinical Services</Label>
                  <p className="text-xs text-muted-foreground">Are medical services currently available?</p>
                </div>
                <Switch 
                  checked={formData.caseManagement} 
                  onCheckedChange={(checked: boolean) => setFormData({...formData, caseManagement: checked})} 
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Outreach Activities</Label>
                  <p className="text-xs text-muted-foreground">Community health and outreach active</p>
                </div>
                <Switch 
                  checked={formData.pssActivities} 
                  onCheckedChange={(checked: boolean) => setFormData({...formData, pssActivities: checked})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Active Consultations</Label>
                  <Input type="number" value={formData.currentCases} onChange={e => setFormData({...formData, currentCases: parseInt(e.target.value) || 0})} />
                </div>
                <div className="grid gap-2">
                  <Label>Daily Capacity</Label>
                  <Input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Service Modalities / Teams</Label>
                <Input type="number" value={formData.outreachTeams} onChange={e => setFormData({...formData, outreachTeams: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUpdate}>Submit Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active MMUs</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeMMUs || 0}</div>
            <p className="text-xs text-muted-foreground">Independent mobile units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Consultations</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.currentCases || 0}</div>
            <p className="text-xs text-muted-foreground">Patients supported today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Stethoscope className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCapacity || 0}</div>
            <p className="text-xs text-muted-foreground">Max patient load</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operational Teams</CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOutreachTeams || 0}</div>
            <p className="text-xs text-muted-foreground">Active field modalities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {relevantFacilities.map((mmu: any) => {
          const update = latestUpdates?.find((u: any) => u.facilityId === mmu._id);
          return (
            <Card key={mmu._id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{mmu.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {mmu.subType} {mmu.type !== "MMU" ? `(${mmu.type})` : ""}
                    </CardDescription>
                  </div>
                  {update && (
                    <div className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                      Update: {new Date(update.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      {update?.caseManagement ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                      <span className={update?.caseManagement ? "text-slate-900" : "text-slate-400"}>Clinical Serv.</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {update?.pssActivities ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                      <span className={update?.pssActivities ? "text-slate-900" : "text-slate-400"}>Outreach</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Daily Load</span>
                      <span>{update?.currentCases || 0} / {update?.capacity || 0}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all"
                        style={{ width: `${Math.min(((update?.currentCases || 0) / (update?.capacity || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                    <Activity className="h-3 w-3" />
                    <span>{update?.outreachTeams || 0} Mobile Medical Teams</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {relevantFacilities.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
            No Medical Mobile Units registered.
          </div>
        )}
      </div>
    </div>
  );
}

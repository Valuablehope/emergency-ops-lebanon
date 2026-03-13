import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Stethoscope, Activity, Heart, AlertCircle, Pencil, Baby, Users, Pill, Syringe, ShieldAlert, HeartPulse, Scissors, Zap, Apple, Smile, Eye, Scan, Waves, Microscope } from "lucide-react";

const SPECIALTY_OPTIONS = [
  { id: "General Medicine", label: "General Medicine", icon: Stethoscope, color: "text-slate-600 bg-slate-50" },
  { id: "Pediatrics", label: "Pediatrics", icon: Baby, color: "text-blue-600 bg-blue-50" },
  { id: "Obstetrics", label: "Obstetrics & Gyn.", icon: Users, color: "text-pink-600 bg-pink-50" },
  { id: "Cardiology", label: "Cardiology", icon: HeartPulse, color: "text-red-600 bg-red-50" },
  { id: "Surgery", label: "Surgery", icon: Scissors, color: "text-slate-700 bg-slate-100" },
  { id: "Trauma Care", label: "Trauma Care", icon: Zap, color: "text-orange-600 bg-orange-50" },
  { id: "Mental Health", label: "Mental Health", icon: Activity, color: "text-purple-600 bg-purple-50" },
  { id: "CMR", label: "CMR / Protection", icon: ShieldAlert, color: "text-indigo-600 bg-indigo-50" },
  { id: "Pharmacy", label: "Pharmacy", icon: Pill, color: "text-emerald-600 bg-emerald-50" },
  { id: "Vaccination", label: "Vaccination", icon: Syringe, color: "text-cyan-600 bg-cyan-50" },
  { id: "Radiology", label: "Radiology", icon: Scan, color: "text-blue-700 bg-blue-100" },
  { id: "Laboratory", label: "Laboratory", icon: Microscope, color: "text-slate-600 bg-slate-50" },
  { id: "Nutrition", label: "Nutrition", icon: Apple, color: "text-green-600 bg-green-50" },
  { id: "Dental", label: "Dental", icon: Smile, color: "text-teal-600 bg-teal-50" },
  { id: "Ophthalmology", label: "Ophthalmology", icon: Eye, color: "text-sky-600 bg-sky-50" },
  { id: "Dialysis", label: "Dialysis", icon: Waves, color: "text-blue-500 bg-blue-50" },
];

export default function Health() {
  const stats = useQuery(api.health.getHealthStats);
  const healthFacilities = useQuery(api.facilities.getFacilities, {});
  const updateFacility = useMutation(api.facilities.updateFacility);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const filtered = healthFacilities?.filter((f: any) => f.type === "PHCC" || f.type === "Hospital" || f.type === "CMR");

  const handleOpenEdit = (f: any) => {
    setSelectedFacility(f);
    setSelectedSpecialties(f.specialties || []);
    setIsOpen(true);
  };

  const toggleSpecialty = (specialtyId: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId) 
        ? prev.filter(id => id !== specialtyId) 
        : [...prev, specialtyId]
    );
  };

  const handleSaveSpecialties = async () => {
    if (!selectedFacility) return;
    try {
      await updateFacility({
        id: selectedFacility._id,
        specialties: selectedSpecialties
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update specialties:", error);
      alert("Error saving specialties.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Response</h2>
          <p className="text-muted-foreground">Monitoring PHCCs, hospitals, and medical service availability.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active PHCCs</CardTitle>
            <Stethoscope className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePHCCs || 0}</div>
            <p className="text-xs text-muted-foreground">of {stats?.totalPHCCs || 0} registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operational Hospitals</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeHospitals || 0}</div>
            <p className="text-xs text-muted-foreground">of {stats?.totalHospitals || 0} registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CMR Service Points</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthFacilities?.filter((f: any) => f.type === "CMR").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">National coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Governorates</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(healthFacilities?.map((f: any) => f.governorateId))].length}
            </div>
            <p className="text-xs text-muted-foreground">Reporting online</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Facility Registry</CardTitle>
          <CardDescription>Operational status and specialized medical specialties.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Medical Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((f: any) => (
                <TableRow key={f._id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{f.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{f.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold text-blue-700 bg-blue-50 border-blue-200">
                      {f.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[400px]">
                      {f.specialties?.map((s: string) => {
                        const opt = SPECIALTY_OPTIONS.find(o => o.id === s);
                        return (
                          <Badge key={s} variant="secondary" className={`text-[10px] px-1.5 h-5 ${opt?.color || ""}`}>
                            {opt?.label || s}
                          </Badge>
                        );
                      }) || <span className="text-xs text-muted-foreground italic">No specialties reported</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                      {f.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleOpenEdit(f)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Specialties Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Health Specialties</DialogTitle>
            <DialogDescription>
              Select the medical services provided at <span className="font-bold text-primary">{selectedFacility?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTY_OPTIONS.map((opt) => (
                <div 
                  key={opt.id} 
                  className={`flex items-center space-x-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors cursor-pointer ${selectedSpecialties.includes(opt.id) ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => toggleSpecialty(opt.id)}
                >
                  <Checkbox 
                    id={opt.id} 
                    checked={selectedSpecialties.includes(opt.id)} 
                    onCheckedChange={() => toggleSpecialty(opt.id)} 
                  />
                  <div className="flex items-center gap-2 overflow-hidden">
                    <opt.icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <Label htmlFor={opt.id} className="text-xs font-medium leading-none cursor-pointer truncate">
                      {opt.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSpecialties}>Save Specialties</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

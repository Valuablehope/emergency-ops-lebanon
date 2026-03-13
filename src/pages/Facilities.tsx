import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Building2, MapPin, Search, Filter, Pencil, Trash2, AlertTriangle, Shield, Droplets, HeartPulse, Home as HomeIcon, GraduationCap, Package, Utensils } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const SECTOR_OPTIONS = [
  { id: "WASH", label: "WASH", icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { id: "Health", label: "Health", icon: HeartPulse, color: "text-red-600 bg-red-50" },
  { id: "Protection", label: "Protection", icon: Shield, color: "text-purple-600 bg-purple-50" },
  { id: "Shelter", label: "Shelter", icon: HomeIcon, color: "text-amber-600 bg-amber-50" },
  { id: "Education", label: "Education", icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
  { id: "Food", label: "Food", icon: Utensils, color: "text-orange-600 bg-orange-50" },
  { id: "NFI", label: "NFI", icon: Package, color: "text-slate-600 bg-slate-50" },
];

const INITIAL_FACILITY_STATE = {
  name: "",
  code: "",
  type: "Shelter",
  subType: "Collective",
  partnerId: "" as Id<"partners">,
  governorateId: "" as Id<"governorates">,
  districtId: "" as Id<"districts">,
  municipalityId: "" as Id<"municipalities">,
  lat: 33.8938,
  lng: 35.5018,
  status: "active",
  sectors: [] as string[]
};

export default function Facilities() {
  const governorates = useQuery(api.masterData.getGovernorates);
  const partners = useQuery(api.masterData.getPartners);
  const facilities = useQuery(api.facilities.getFacilities, {});
  
  const createFacility = useMutation(api.facilities.createFacility);
  const updateFacility = useMutation(api.facilities.updateFacility);
  const deleteFacility = useMutation(api.facilities.deleteFacility);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"facilities"> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"facilities"> | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(INITIAL_FACILITY_STATE);

  const districts = useQuery(api.masterData.getDistricts, 
    formData.governorateId ? { governorateId: formData.governorateId } : {}
  );

  const handleOpenDialog = (facility?: any) => {
    if (facility) {
      setEditingId(facility._id);
      setFormData({
        name: facility.name,
        code: facility.code,
        type: facility.type,
        subType: facility.subType,
        partnerId: facility.partnerId,
        governorateId: facility.governorateId,
        districtId: facility.districtId,
        municipalityId: facility.municipalityId || "",
        lat: facility.lat,
        lng: facility.lng,
        status: facility.status,
        sectors: facility.sectors || []
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FACILITY_STATE);
    }
    setIsOpen(true);
  };

  const toggleSector = (sectorId: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sectorId)
        ? prev.sectors.filter(id => id !== sectorId)
        : [...prev.sectors, sectorId]
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.partnerId || !formData.governorateId || !formData.districtId) {
      alert("Please fill in all required fields (Name, Code, Partner, Governorate, District)");
      return;
    }

    try {
      const submissionData = {
        ...formData,
        municipalityId: formData.municipalityId || undefined,
        sectors: formData.sectors.length > 0 ? formData.sectors : undefined
      };

      if (editingId) {
        await updateFacility({ id: editingId, ...submissionData });
      } else {
        await createFacility(submissionData);
      }
      
      setIsOpen(false);
      setFormData(INITIAL_FACILITY_STATE);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save facility:", error);
      alert("Error saving facility.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteFacility({ id: deletingId });
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete facility:", error);
      alert("Error deleting facility. It might have dependent data.");
    }
  };

  const filteredFacilities = facilities?.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facility Registry</h2>
          <p className="text-muted-foreground">National registry of all shelters, PHCCs, hospitals, and service points.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Register Facility</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      {/* Main Dialog (New/Edit) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Facility" : "Register New Facility"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details for this operational facility." : "Enter the primary details for the new operational facility."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Facility Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Al-Amal PHCC" />
              </div>
              <div className="grid gap-2">
                <Label>Facility Code</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. PHC-NAB-001" />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shelter">Collective Shelter</SelectItem>
                    <SelectItem value="PHCC">PHCC</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="CMR">CMR Facility</SelectItem>
                    <SelectItem value="PSU">Protection Support Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Lead Partner</Label>
                <Select value={formData.partnerId} onValueChange={val => setFormData({...formData, partnerId: val as Id<"partners">})}>
                  <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                  <SelectContent>
                    {partners?.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.acronym}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Governorate</Label>
                <Select value={formData.governorateId} onValueChange={val => setFormData({...formData, governorateId: val as Id<"governorates">, districtId: "" as Id<"districts">})}>
                  <SelectTrigger><SelectValue placeholder="Select governorate" /></SelectTrigger>
                  <SelectContent>
                    {governorates?.map(g => (
                      <SelectItem key={g._id} value={g._id}>{g.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>District</Label>
                <Select value={formData.districtId} onValueChange={val => setFormData({...formData, districtId: val as Id<"districts">})} disabled={!formData.governorateId}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts?.map(d => (
                      <SelectItem key={d._id} value={d._id}>{d.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 border-t pt-4">
              <Label className="text-base">Operational Sectors</Label>
              <p className="text-xs text-muted-foreground">Select all sectors supported or provided at this location.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SECTOR_OPTIONS.map((sector) => (
                  <div key={sector.id} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleSector(sector.id)}>
                    <Checkbox id={sector.id} checked={formData.sectors.includes(sector.id)} onCheckedChange={() => toggleSector(sector.id)} />
                    <div className="flex items-center gap-2">
                       <sector.icon className="h-4 w-4 text-slate-500" />
                       <label htmlFor={sector.id} className="text-sm font-medium leading-none cursor-pointer">{sector.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete Facility
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this facility? This action will also delete all associated shelter updates and distribution logs. This CANNOT be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code & Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Sectors</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities?.map((facility) => (
                <TableRow key={facility._id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="font-mono text-xs font-bold text-primary">{facility.code}</span>
                       <span className="font-medium">{facility.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold text-blue-700 bg-blue-50 border-blue-200">
                      {facility.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {governorates?.find(g => g._id === facility.governorateId)?.nameEn}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {facility.sectors?.map(s => {
                        const opt = SECTOR_OPTIONS.find(o => o.id === s);
                        return (
                          <Badge key={s} variant="secondary" className={`text-[10px] px-1 py-0 h-4 ${opt?.color || ""}`}>
                            {s}
                          </Badge>
                        );
                      }) || <span className="text-xs text-muted-foreground italic">None</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {partners?.find(p => p._id === facility.partnerId)?.acronym}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-primary"
                        onClick={() => handleOpenDialog(facility)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => {
                          setDeletingId(facility._id);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFacilities?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <p>No facilities found matching your criteria.</p>
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

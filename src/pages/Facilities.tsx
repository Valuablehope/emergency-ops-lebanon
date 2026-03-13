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
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Building2, MapPin, Search, Filter } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export default function Facilities() {
  const governorates = useQuery(api.masterData.getGovernorates);
  const partners = useQuery(api.masterData.getPartners);
  const facilities = useQuery(api.facilities.getFacilities, {});
  const createFacility = useMutation(api.facilities.createFacility);

  const [searchQuery, setSearchQuery] = useState("");
  const [newFacility, setNewFacility] = useState({
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
    status: "active"
  });

  const districts = useQuery(api.masterData.getDistricts, 
    newFacility.governorateId ? { governorateId: newFacility.governorateId } : {}
  );

  const handleCreate = async () => {
    await createFacility(newFacility);
    // Reset form or close dialog
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
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Register Facility</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Facility</DialogTitle>
                <DialogDescription>Enter the primary details for the new operational facility.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Facility Name</Label>
                  <Input value={newFacility.name} onChange={e => setNewFacility({...newFacility, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Facility Code</Label>
                  <Input value={newFacility.code} onChange={e => setNewFacility({...newFacility, code: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={newFacility.type} onValueChange={val => setNewFacility({...newFacility, type: val})}>
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
                  <Select onValueChange={val => setNewFacility({...newFacility, partnerId: val as Id<"partners">})}>
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
                  <Select onValueChange={val => setNewFacility({...newFacility, governorateId: val as Id<"governorates">})}>
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
                  <Select onValueChange={val => setNewFacility({...newFacility, districtId: val as Id<"districts">})}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {districts?.map(d => (
                        <SelectItem key={d._id} value={d._id}>{d.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Save Facility</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities?.map((facility) => (
                <TableRow key={facility._id}>
                  <TableCell className="font-mono text-xs">{facility.code}</TableCell>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {facility.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {governorates?.find(g => g._id === facility.governorateId)?.nameEn}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {partners?.find(p => p._id === facility.partnerId)?.acronym}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {facility.status}
                    </span>
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

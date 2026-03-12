import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Map as MapIcon, Users, Landmark } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function MasterData() {
  const governorates = useQuery(api.masterData.getGovernorates);
  const districts = useQuery(api.masterData.getDistricts, {});
  const municipalities = useQuery(api.masterData.getMunicipalities, {});
  const partners = useQuery(api.masterData.getPartners);

  const addGovernorate = useMutation(api.masterData.addGovernorate);
  const addDistrict = useMutation(api.masterData.addDistrict);
  const addMunicipality = useMutation(api.masterData.addMunicipality);
  const addPartner = useMutation(api.masterData.addPartner);

  const [newGov, setNewGov] = useState({ nameEn: "", nameAr: "", code: "" });
  const [newDist, setNewDist] = useState({ governorateId: "" as Id<"governorates">, nameEn: "", nameAr: "", code: "" });
  const [newMuni, setNewMuni] = useState({ districtId: "" as Id<"districts">, nameEn: "", nameAr: "", code: "" });
  const [newPartner, setNewPartner] = useState({ name: "", acronym: "", type: "INGO" });

  const handleAddGov = async () => {
    await addGovernorate(newGov);
    setNewGov({ nameEn: "", nameAr: "", code: "" });
  };

  const handleAddDist = async () => {
    if (!newDist.governorateId) return;
    await addDistrict(newDist);
    setNewDist({ governorateId: "" as Id<"governorates">, nameEn: "", nameAr: "", code: "" });
  };

  const handleAddMuni = async () => {
    if (!newMuni.districtId) return;
    await addMunicipality(newMuni);
    setNewMuni({ districtId: "" as Id<"districts">, nameEn: "", nameAr: "", code: "" });
  };

  const handleAddPartner = async () => {
    await addPartner(newPartner);
    setNewPartner({ name: "", acronym: "", type: "INGO" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Data Administration</h2>
          <p className="text-muted-foreground">Manage national administrative boundaries, partners, and reference lists.</p>
        </div>
      </div>

      <Tabs defaultValue="governorates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="governorates" className="flex items-center gap-2">
            <MapIcon className="h-4 w-4" /> Governorates
          </TabsTrigger>
          <TabsTrigger value="districts" className="flex items-center gap-2">
            < Landmark className="h-4 w-4" /> Districts
          </TabsTrigger>
          <TabsTrigger value="municipalities" className="flex items-center gap-2">
            < Landmark className="h-4 w-4" /> Municipalities
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Partners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="governorates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Governorates</CardTitle>
                <CardDescription>Major administrative divisions of Lebanon.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Governorate</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Governorate</DialogTitle>
                    <DialogDescription>Create a new national governorate entry.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Name (English)</Label>
                      <Input value={newGov.nameEn} onChange={(e) => setNewGov({...newGov, nameEn: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Name (Arabic)</Label>
                      <Input value={newGov.nameAr} onChange={(e) => setNewGov({...newGov, nameAr: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>P-Code</Label>
                      <Input value={newGov.code} onChange={(e) => setNewGov({...newGov, code: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddGov}>Save Governorate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>P-Code</TableHead>
                    <TableHead>English Name</TableHead>
                    <TableHead>Arabic Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governorates?.map((gov) => (
                    <TableRow key={gov._id}>
                      <TableCell className="font-medium text-slate-500">{gov.code}</TableCell>
                      <TableCell>{gov.nameEn}</TableCell>
                      <TableCell className="text-right font-arabic">{gov.nameAr}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Districts</CardTitle>
                <CardDescription>Second-level administrative divisions.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add District</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add District</DialogTitle>
                    <DialogDescription>Link a new district to a governorate.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Governorate</Label>
                      <Select value={newDist.governorateId} onValueChange={(val) => setNewDist({...newDist, governorateId: val as Id<"governorates">})}>
                        <SelectTrigger><SelectValue placeholder="Select Governorate" /></SelectTrigger>
                        <SelectContent>
                          {governorates?.map(g => (
                            <SelectItem key={g._id} value={g._id}>{g.nameEn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Name (English)</Label>
                      <Input value={newDist.nameEn} onChange={(e) => setNewDist({...newDist, nameEn: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>P-Code</Label>
                      <Input value={newDist.code} onChange={(e) => setNewDist({...newDist, code: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddDist}>Save District</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>P-Code</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Governorate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {districts?.map((dist) => (
                    <TableRow key={dist._id}>
                      <TableCell className="font-mono text-xs">{dist.code}</TableCell>
                      <TableCell>{dist.nameEn}</TableCell>
                      <TableCell>{governorates?.find(g => g._id === dist.governorateId)?.nameEn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="municipalities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Municipalities</CardTitle>
                <CardDescription>Third-level administrative divisions.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Municipality</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Municipality</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>District</Label>
                      <Select value={newMuni.districtId} onValueChange={(val) => setNewMuni({...newMuni, districtId: val as Id<"districts">})}>
                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                        <SelectContent>
                          {districts?.map(d => (
                            <SelectItem key={d._id} value={d._id}>{d.nameEn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Name (English)</Label>
                      <Input value={newMuni.nameEn} onChange={(e) => setNewMuni({...newMuni, nameEn: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddMuni}>Save Municipality</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>District</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {municipalities?.map((muni) => (
                    <TableRow key={muni._id}>
                      <TableCell>{muni.nameEn}</TableCell>
                      <TableCell>{districts?.find(d => d._id === muni.districtId)?.nameEn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Partners</CardTitle>
                <CardDescription>Organizations and implementing partners operating in Lebanon.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Partner</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Partner</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Acronym</Label>
                      <Input value={newPartner.acronym} onChange={(e) => setNewPartner({...newPartner, acronym: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddPartner}>Save Partner</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acronym</TableHead>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners?.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-bold text-primary">{p.acronym}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


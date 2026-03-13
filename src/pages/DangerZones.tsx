import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Plus, History } from "lucide-react";

export default function DangerZones() {
  const zones = useQuery(api.mapping.getDangerZones);
  const addZone = useMutation(api.mapping.addDangerZone);

  const [newZone, setNewZone] = useState({
    name: "",
    riskLevel: "high",
    validFrom: Date.now(),
  });

  const handleSave = async () => {
    // In a real app, we'd handle geometry here (e.g. from map drawing)
    await addZone({
      ...newZone,
      geometry: { type: "Polygon", coordinates: [] } // Placeholder
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> Danger Zones & Risk Areas
          </h2>
          <p className="text-muted-foreground">Manage active conflict exposure and cross-border risk layers.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive"><Plus className="mr-2 h-4 w-4" /> Define New Zone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Define Danger Zone</DialogTitle>
              <DialogDescription>Create a geospatial alert layer for the situational map.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Zone Name / Reference</Label>
                <Input value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} placeholder="e.g. Border Shelling Zone A" />
              </div>
              <div className="grid gap-2">
                <Label>Risk Level</Label>
                <Select value={newZone.riskLevel} onValueChange={val => setNewZone({...newZone, riskLevel: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Red Alert)</SelectItem>
                    <SelectItem value="medium">Medium (Amber Alert)</SelectItem>
                    <SelectItem value="low">Low (Advisory)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} variant="destructive">Activate Zone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Zones</CardTitle>
            <CardDescription>Currently publicized risk areas on the national map.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Active Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones?.map((zone: any) => (
                  <TableRow key={zone._id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        zone.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {zone.riskLevel.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(zone.validFrom).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Deactivate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" /> History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 italic">No historical zones found in the current session.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

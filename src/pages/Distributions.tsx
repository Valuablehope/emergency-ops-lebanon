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
import { Package, Truck } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const INITIAL_DIST_STATE = {
  campaignName: "",
  facilityId: "" as Id<"facilities">,
  partnerId: "" as Id<"partners">,
  itemType: "NFI Kit",
  quantity: 0,
  householdsReached: 0,
  beneficiariesReached: 0,
  date: Date.now(),
  status: "Completed"
};

export default function Distributions() {
  const distributions = useQuery(api.distributions.getDistributions);
  const facilities = useQuery(api.facilities.getFacilities, {});
  const partners = useQuery(api.masterData.getPartners);
  const addDist = useMutation(api.distributions.addDistribution);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_DIST_STATE);

  const handleLogDistribution = async () => {
    if (!formData.campaignName || !formData.facilityId || !formData.partnerId || !formData.itemType) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDist(formData);
      setIsOpen(false);
      setFormData(INITIAL_DIST_STATE);
    } catch (error) {
      console.error("Failed to log distribution:", error);
      alert("Error saving distribution record.");
    }
  };

  // Dynamic Statistics
  const totalKits = distributions?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  const totalHH = distributions?.reduce((acc, curr) => acc + curr.householdsReached, 0) || 0;
  const activePartnersCount = new Set(distributions?.map(d => d.partnerId)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Distribution Management</h2>
          <p className="text-muted-foreground">Track NFI kits, food parcels, and hygiene item distributions nationwide.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}><Truck className="mr-2 h-4 w-4" /> Log Distribution</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Distribution</DialogTitle>
              <DialogDescription>Record a verified distribution event at a specific facility or shelter.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="grid gap-2 col-span-2">
                <Label>Campaign Name</Label>
                <Input value={formData.campaignName} onChange={e => setFormData({...formData, campaignName: e.target.value})} placeholder="e.g. Winterization Phase 1" />
              </div>
              <div className="grid gap-2">
                <Label>Destination Facility</Label>
                <Select value={formData.facilityId} onValueChange={val => setFormData({...formData, facilityId: val as Id<"facilities">})}>
                  <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                  <SelectContent>
                    {facilities?.map(f => (
                      <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Implementing Partner</Label>
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
                <Label>Item Type</Label>
                <Select value={formData.itemType} onValueChange={val => setFormData({...formData, itemType: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NFI Kit">NFI Kit</SelectItem>
                    <SelectItem value="Food Parcel">Food Parcel</SelectItem>
                    <SelectItem value="Hygiene Kit">Hygiene Kit</SelectItem>
                    <SelectItem value="Blankets">Blankets</SelectItem>
                    <SelectItem value="Water Bottled">Water (Bottled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2 border-t pt-4">
                <Label>Households Reached</Label>
                <Input type="number" value={formData.householdsReached} onChange={e => setFormData({...formData, householdsReached: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid gap-2 border-t pt-4">
                <Label>Individuals Reached</Label>
                <Input type="number" value={formData.beneficiariesReached} onChange={e => setFormData({...formData, beneficiariesReached: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleLogDistribution}>Record Distribution</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Kits Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalKits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative totals</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Households Reached</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{totalHH.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Verified reach nationwide</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Reporting Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{activePartnersCount}</div>
            <p className="text-xs text-muted-foreground">Active this period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Distribution Events</CardTitle>
          <CardDescription>Verified submissions from the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign / Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Reach (HH/Ind)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions?.map((dist) => (
                <TableRow key={dist._id} className="group">
                  <TableCell className="text-xs font-medium">
                    {new Date(dist.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary">{dist.campaignName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Package className="h-3 w-3" /> {dist.itemType} ({dist.quantity.toLocaleString()})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {facilities?.find(f => f._id === dist.facilityId)?.name || "Unknown Facility"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-600/10">
                      {partners?.find(p => p._id === dist.partnerId)?.acronym || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-blue-700">{dist.householdsReached.toLocaleString()} HH</span>
                      <span className="text-xs text-muted-foreground">{dist.beneficiariesReached.toLocaleString()} Ind</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                      {dist.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {(!distributions || distributions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Truck className="mx-auto h-12 w-12 opacity-10 mb-4" />
                    <p>No distribution records found.</p>
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


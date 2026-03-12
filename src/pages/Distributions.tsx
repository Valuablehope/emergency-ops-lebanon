import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, Users, Calendar } from "lucide-react";

export default function Distributions() {
  const distributions = useQuery(api.distributions.getDistributions);
  const facilities = useQuery(api.facilities.getFacilities, {});
  const partners = useQuery(api.masterData.getPartners);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Distribution Management</h2>
          <p className="text-muted-foreground">Track NFI kits, food parcels, and hygiene item distributions nationwide.</p>
        </div>
        <Button><Truck className="mr-2 h-4 w-4" /> Log Distribution</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Kits Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45,820</div>
            <p className="text-xs text-muted-foreground">Across all sectors</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Households Reached</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">9,164</div>
            <p className="text-xs text-muted-foreground">Target: 12,000 (76%)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">14</div>
            <p className="text-xs text-muted-foreground">Reporting this period</p>
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
                <TableRow key={dist._id}>
                  <TableCell className="text-xs font-medium">
                    {new Date(dist.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{dist.campaignName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" /> {dist.itemType} ({dist.quantity})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {facilities?.find(f => f._id === dist.facilityId)?.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-bold">
                    {partners?.find(p => p._id === dist.partnerId)?.acronym}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{dist.householdsReached} HH</span>
                      <span className="text-xs text-muted-foreground">{dist.beneficiariesReached} Ind</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                      {dist.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {(!distributions || distributions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No distribution records found.
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

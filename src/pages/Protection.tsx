import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MapPin } from "lucide-react";

export default function Protection() {
  const protectionFacilities = useQuery(api.facilities.getFacilities, { type: "PSU" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Protection / PSU</h2>
          <p className="text-muted-foreground">Monitoring Protection Support Units and mobile protection teams.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active PSUs</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protectionFacilities?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries Reached</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(protectionFacilities?.map((f: any) => f.governorateId))].length * 120}
            </div>
            <p className="text-xs text-muted-foreground">Estimated based on units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operational Type</CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(protectionFacilities?.map((f: any) => f.subType))].length}
            </div>
            <p className="text-xs text-muted-foreground">Modalities active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {protectionFacilities?.map((psu: any) => (
          <Card key={psu._id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{psu.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {psu.subType}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Case Management</span>
                  <span className="text-green-600 font-medium">Available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>PSS Activities</span>
                  <span className="text-green-600 font-medium">Available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Capacity</span>
                  <span>45 / 50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {protectionFacilities?.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No Protection Support Units registered.
          </div>
        )}
      </div>
    </div>
  );
}

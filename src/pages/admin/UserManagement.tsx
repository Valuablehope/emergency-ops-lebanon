import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
import { UserPlus, Shield, Mail, MapPin } from "lucide-react";

export default function UserManagement() {
  const users = useQuery(api.users.getUsers);
  const governorates = useQuery(api.masterData.getGovernorates);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "viewer",
    areaId: "",
    status: "active"
  });

  const handleSave = async () => {
    await createOrUpdateUser(newUser);
    // Reset or close
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Assign roles and area-scoped permissions to platform users.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with specific roles.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={val => setNewUser({...newUser, role: val})}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">National Admin</SelectItem>
                    <SelectItem value="manager">Partner Manager</SelectItem>
                    <SelectItem value="entry">Data Entry Clerk</SelectItem>
                    <SelectItem value="viewer">Viewer / IM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Area Scoping (Optional)</Label>
                <Select value={newUser.areaId} onValueChange={val => setNewUser({...newUser, areaId: val})}>
                  <SelectTrigger><SelectValue placeholder="All Areas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Governorates</SelectItem>
                    {governorates?.map((g: any) => (
                      <SelectItem key={g._id} value={g._id}>{g.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Area Scoping</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {user.areaId === "all" || !user.areaId ? "National" : 
                        governorates?.find((g: any) => g._id === user.areaId)?.nameEn || "Specific Area"
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === "active" ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

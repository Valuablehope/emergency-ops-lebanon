import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Package, ShieldAlert, Home } from "lucide-react";

interface QuickEntryDialogProps {
  trigger: React.ReactNode;
}

export function QuickEntryDialog({ trigger }: QuickEntryDialogProps) {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Entry</DialogTitle>
          <DialogDescription>
            Choose a type of record to add to the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2" 
            onClick={() => handleAction("/facilities")}
          >
            <Building2 className="h-8 w-8 text-blue-500" />
            <span>New Facility</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2" 
            onClick={() => handleAction("/distributions")}
          >
            <Package className="h-8 w-8 text-emerald-500" />
            <span>Log Distribution</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2" 
            onClick={() => handleAction("/danger-zones")}
          >
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <span>Danger Zone</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2" 
            onClick={() => handleAction("/shelters")}
          >
            <Home className="h-8 w-8 text-purple-500" />
            <span>Shelter Update</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

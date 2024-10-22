import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangleIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { TOKEN, URL } from "./constants";

export default function DeletePermissionDialog({ id, onClose, setFlag }: any) {
  const handleDelete = async (id: any) => {
    try {
      await axios.delete(`${URL}/open-vpn/${id}`, {
        headers: {
          Authorization: TOKEN,
        },
      });
      console.log("File deleted successfully");

      toast.success("File deleted successfully");

      setFlag((prev: any) => !prev);

      onClose();
    } catch (error) {
      console.log("Error deleting file:", error);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            Delete Permission
          </DialogTitle>
          <DialogDescription
            style={{ fontWeight: "600", fontSize: "17px", margin: "10px 0px" }}
          >
            Soch le Delete krna hai kya? ek baar file delete ho gayi toh wapas
            nahi aayegi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            style={{ width: "100%" }}
            onClick={() => handleDelete(id)}
          >
            Soch Le
          </Button>
          <Button
            type="button"
            style={{ width: "100%" }}
            variant="outline"
            onClick={() => onClose()}
          >
            Darr Gaya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

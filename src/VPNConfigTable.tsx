import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { TOKEN, URL } from "./constants";
import DeletePermissionDialog from "./DeleteModal";

type VPNType = "ALL" | "FREE_OPEN_VPN" | "PROTO";

interface VPNFile {
  _id: string;
  country: string;
  isFreeOpenVpn: boolean;
  username?: string;
  password?: string;
  url: string;
}

interface VPNFilesTableProps {
  flag: boolean;
  setShowUpdateForm: (data: {
    visible: boolean;
    id: string;
    data: VPNFile;
  }) => void;
}

interface DeleteDialogState {
  visible: boolean;
  id: string;
}

export const VPNFilesTable: React.FC<VPNFilesTableProps> = ({
  flag,
  setShowUpdateForm,
}) => {
  const [files, setFiles] = useState<VPNFile[]>([]);
  const [typeFilter, setTypeFilter] = useState<VPNType>("ALL");
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    visible: false,
    id: "",
  });
  const [deleteFlag, setDeleteFlag] = useState(false);

  const filteredData = useMemo(() => {
    if (typeFilter === "ALL") return files;
    return files.filter((file) =>
      typeFilter === "FREE_OPEN_VPN" ? file.isFreeOpenVpn : !file.isFreeOpenVpn
    );
  }, [files, typeFilter]);

  const downloadFile = async (url: string) => {
    try {
      const response = await axios.get(
        `https://rabbitvpn.sgp1.digitaloceanspaces.com/${url}`
      );
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "config.ovpn");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      // You might want to add a toast notification here
    }
  };

  const columnHelper = createColumnHelper<VPNFile>();

  const columns = useMemo<ColumnDef<VPNFile, any>[]>(
    () => [
      columnHelper.accessor("country", {
        header: "Country",
      }),
      columnHelper.accessor("isFreeOpenVpn", {
        header: "Type",
        cell: ({ row }) =>
          row.original.isFreeOpenVpn ? "FREE_OPEN_VPN" : "PROTON",
      }),
      columnHelper.accessor("username", {
        header: "Username",
        cell: ({ row }) => row.original.username || "N/A",
      }),
      columnHelper.accessor("password", {
        header: "Password",
        cell: ({ row }) => row.original.password || "N/A",
      }),
      columnHelper.accessor("url", {
        header: "Download",
        cell: ({ getValue }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadFile(getValue())}
            className="flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
        ),
      }),
      columnHelper.accessor("_id", {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowUpdateForm({
                  visible: true,
                  id: row.original._id,
                  data: row.original,
                })
              }
              className="flex items-center gap-2"
            >
              <Pencil1Icon className="h-4 w-4" />
              Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDeleteDialog({
                  visible: true,
                  id: row.original._id,
                })
              }
              className="flex items-center gap-2 border-red-500 text-red-500"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await axios.get(`${URL}/open-vpn/server/all`, {
          headers: {
            Authorization: TOKEN,
          },
        });
        setFiles(data.data);
      } catch (error) {
        console.error("Error fetching files:", error);
        // You might want to add a toast notification here
      }
    };

    fetchFiles();
  }, [flag, deleteFlag]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">VPN Configurations</h2>

        <div className="flex items-center gap-4">
          <ShadSelect
            value={typeFilter}
            onValueChange={(value: VPNType) => setTypeFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FREE_OPEN_VPN">Free Open VPN</SelectItem>
              <SelectItem value="PROTO">Proto</SelectItem>
            </SelectContent>
          </ShadSelect>
          <Input
            placeholder="Search files..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No VPN configurations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {deleteDialog.visible && (
        <DeletePermissionDialog
          id={deleteDialog.id}
          onClose={() => setDeleteDialog({ id: "", visible: false })}
          setFlag={setDeleteFlag}
        />
      )}
    </div>
  );
};

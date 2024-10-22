import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import VpnServerUpdateForm from "./UpdateForm";
import { TOKEN, URL } from "./constants";
import { Switch } from "./components/ui/switch";
import DeletePermissionDialog from "./DeleteModal";

export const CountryInput = ({
  country,
  onChange,
}: {
  country: { value: string; label: string } | null;
  onChange: (e: { value: string; label: string } | null) => void;
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data } = await axios.get(`${URL}/utility/countries`);
        const options = data.data.map((country: string) => ({
          value: country,
          label: country,
        }));
        setOptions(options);
      } catch (e) {
        console.log("Error fetching countries", e);
      }
    };
    fetchCountries();
  }, []);

  return (
    <div
      style={{
        minWidth: "100%",
      }}
    >
      <Label htmlFor="country-select">Select Country</Label>
      <Select
        id="country-select"
        options={options}
        value={country}
        onChange={onChange}
        placeholder="Select a country..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export const CitiesInput = ({
  city,
  country,
  onChange,
}: {
  city: { value: string; label: string } | null;
  country: { value: string; label: string } | null;
  onChange: (e: { value: string; label: string } | null) => void;
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  useEffect(() => {
    if (country) {
      const fetchCities = async () => {
        try {
          const { data } = await axios.get(
            `${URL}/utility/cities?country=${country.value}`
          );
          const options = data.data.map((city: string) => ({
            value: city,
            label: city,
          }));
          options.unshift({ value: "FREE", label: "FREE" });
          setOptions(options);
        } catch (e) {
          console.log("Error fetching cities", e);
        }
      };
      fetchCities();
    }
  }, [country]);

  return (
    <>
      <Label htmlFor="city-select">Select City</Label>
      <Select
        id="city-select"
        options={options}
        value={city}
        onChange={onChange}
        placeholder="Select a city..."
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={!country} // Disable the city select if no country is selected
      />
    </>
  );
};

export const CategoryInput = ({
  onChange,
}: {
  onChange: (e: { value: string; label: string } | null) => void;
}) => {
  return (
    <>
      <Label htmlFor="category-select">Select Category</Label>
      <Select
        id="category-select"
        options={["Generel", "Videos", "Games", "Social Media", "Sports"].map(
          (c) => ({ value: c, label: c })
        )}
        onChange={onChange}
        placeholder="Select a category..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </>
  );
};

export const TypeInput = ({
  onChange,
}: {
  onChange: (e: { value: string; label: string } | null) => void;
}) => {
  return (
    <>
      <Label htmlFor="category-select">Select Type</Label>
      <Select
        id="category-select"
        options={["Free", "Premium"].map((c) => ({ value: c, label: c }))}
        onChange={onChange}
        placeholder="Select a type..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </>
  );
};

export const VPNFilesTable = ({
  flag,
  setShowUpdateForm,
}: {
  flag: boolean;
  setShowUpdateForm: any;
}) => {
  const [files, setFiles] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [d, setD] = useState({
    visible: false,
    id: "",
  });
  const [delFlag, setDelFlag] = useState(false);

  const downloadFile = async (url: string) => {
    try {
      const response = await axios.get(url);

      console.log("response", response);

      // Create a URL for the blob
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));

      console.log("urlBlob", urlBlob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", "config.ovpn");

      // Append the anchor to the body and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up: remove the anchor and revoke the object URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleUpdate = (id: string, data: any) => {
    setShowUpdateForm({
      visible: true,
      id,
      data,
    });
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("country", {
        header: "Country",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("isFreeOpenVpn", {
        header: "Type",
        cell: (info) => {
          const row = info.row.original;
          //@ts-ignore
          return row.isFreeOpenVpn ? "FREE_OPEN_VPN" : "PROTO";
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Username",
        cell: (info) => {
          const row = info.row.original;
          //@ts-ignore
          return row.username || "N/A";
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "Password",
        cell: (info) => {
          const row = info.row.original;
          //@ts-ignore
          return row.password || "N/A";
        },
      }),
      columnHelper.accessor("url", {
        header: "Download",
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadFile(
                  `https:/rabbitvpn.sgp1.digitaloceanspaces.com/${info.getValue()}`
                )
              }
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </Button>
          </div>
        ),
      }),
      columnHelper.accessor("_id", {
        header: "Update",
        cell: (info) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleUpdate(`${info.getValue()}`, info.row.original)
            }
            className="flex items-center gap-2"
          >
            <Pencil1Icon className="h-4 w-4" />
            Update
          </Button>
        ),
      }),
      columnHelper.accessor("flag", {
        header: "Delete",
        cell: (info) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              //@ts-ignore
              setD({ id: `${info.row.original._id.toString()}`, visible: true })
            }
            className="flex items-center gap-2 border-red-500 text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: files,
    //@ts-ignore
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
      }
    };
    fetchFiles();
  }, [flag, delFlag]);

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Uploaded Files</h2>
        <Input
          placeholder="Search files..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup, i) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={i}>
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
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={i}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {d.visible && (
        <DeletePermissionDialog
          id={d.id}
          onClose={() => setD({ id: "", visible: false })}
          setFlag={setDelFlag}
        />
      )}
    </>
  );
};

export default function Component() {
  const [country, setCountry] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [city, setCity] = useState<{ value: string; label: string } | null>(
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [flag, setFlag] = useState(false);
  const [extra, setExtras] = useState({
    category: "",
    type: "",
  });

  const [provider, setProvider] = useState({
    isProton: false,
    isFreeOpenVpn: false,
  });

  const [showUpdateForm, setShowUpdateForm] = useState({
    visible: false,
    id: "",
    data: {},
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Create a new FormData object
    const formData = new FormData();

    // Append your form data
    if (country) formData.append("country", country.value);
    if (city) formData.append("cityname", city.value);
    if (file) formData.append("file", file);

    if (extra.category && extra.type) {
      formData.append("category", extra.category.toUpperCase());
      formData.append("type", extra.type.toUpperCase());
    }

    try {
      // Send the form data using Axios
      await axios.post(`${URL}/open-vpn`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: TOKEN,
        },
      });

      toast.success("Form submitted successfully");

      setCountry(null);
      setCity(null);
      setFile(null);
      setExtras({
        category: "",
        type: "",
      });

      setFlag(!flag);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">
          VPN File Config
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "50%",
              }}
            >
              <CountryInput country={country} onChange={(e) => setCountry(e)} />
            </div>
            <div
              style={{
                width: "50%",
              }}
            >
              <CitiesInput
                country={country}
                city={city}
                onChange={(e) => setCity(e)}
              />
            </div>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "10px",
            }}
          >
            <div style={{ width: "50%" }}>
              <CategoryInput
                onChange={(e) =>
                  setExtras((p) => ({
                    ...p,
                    category: e?.value ?? "",
                  }))
                }
              />
            </div>
            <div style={{ width: "50%" }}>
              <TypeInput
                onChange={(e) =>
                  setExtras((p) => ({
                    ...p,
                    type: e?.value ?? "",
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-base">OpenVPN</p>
                <p>Is this a free OpenVPN server?</p>
              </div>
              <>
                <Switch
                  checked={provider.isFreeOpenVpn}
                  onCheckedChange={() =>
                    setProvider((p) => ({
                      ...p,
                      isFreeOpenVpn: !p.isFreeOpenVpn,
                    }))
                  }
                />
              </>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-base">ProtoVPN</p>
                <p>Is this a free ProtoVPN server?</p>
              </div>
              <>
                <Switch
                  checked={provider.isProton}
                  onCheckedChange={() =>
                    setProvider((p) => ({
                      ...p,
                      isProton: !p.isProton,
                    }))
                  }
                />
              </>
            </div>
          </div>

          {provider.isFreeOpenVpn && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username" />
            </div>
          )}
          {provider.isFreeOpenVpn && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="Password" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="file-upload">File Upload</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files && e.target.files[0])}
              className="cursor-pointer"
            />
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
      <br />
      <VPNFilesTable flag={flag} setShowUpdateForm={setShowUpdateForm} />
      {showUpdateForm.visible && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowUpdateForm({ visible: false, data: {}, id: "" });
            }
          }}
        >
          <DialogContent
            style={{
              maxHeight: "700px",
              overflowY: "scroll",
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Form</DialogTitle>
            </DialogHeader>
            <VpnServerUpdateForm
              initialData={showUpdateForm.data}
              setShowUpdateForm={setShowUpdateForm}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

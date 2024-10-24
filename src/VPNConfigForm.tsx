import Select from "react-select";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import VpnServerUpdateForm from "./UpdateForm";
import { TOKEN, URL } from "./constants";
import { Switch } from "./components/ui/switch";
import { VPNFilesTable } from "./VPNConfigTable";

interface FormState {
  country: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  file: File | null;
  extras: {
    category: string;
    type: string;
  };
  provider: {
    isProton: boolean;
    isFreeOpenVpn: boolean;
  };
  credentials: {
    username: string;
    password: string;
  };
}

interface UpdateFormState {
  visible: boolean;
  id: string;
  data: Record<string, any>;
}

// Initial state
const initialFormState: FormState = {
  country: null,
  city: null,
  file: null,
  extras: {
    category: "",
    type: "",
  },
  provider: {
    isProton: false,
    isFreeOpenVpn: false,
  },
  credentials: {
    username: "",
    password: "",
  },
};

export default function VPNConfigForm() {
  // Combined state management
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [showUpdateForm, setShowUpdateForm] = useState<UpdateFormState>({
    visible: false,
    id: "",
    data: {},
  });
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Memoized handlers
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNestedInputChange = useCallback(
    (parent: keyof FormState, field: string, value: any) => {
      setFormState((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setRefreshFlag((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const formData = new FormData();
      const { country, city, file, extras, provider, credentials } = formState;

      // Append form data conditionally
      if (country?.value) formData.append("country", country.value);
      if (city?.value) formData.append("cityname", city.value);
      if (file) formData.append("file", file);
      if (extras.category && extras.type) {
        formData.append("category", extras.category.toUpperCase());
        formData.append("type", extras.type.toUpperCase());
      }

      formData.append("isProton", provider.isProton.toString());
      formData.append("isFreeOpenVpn", provider.isFreeOpenVpn.toString());

      if (provider.isFreeOpenVpn) {
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);
      }

      try {
        await axios.post(`${URL}/open-vpn`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: TOKEN,
          },
        });

        toast.success("Form submitted successfully");
        resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit form");
      }
    },
    [formState, resetForm]
  );

  return (
    <>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">
          VPN File Config
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <CountryInput
                country={formState.country}
                onChange={(value) => handleInputChange("country", value)}
              />
            </div>
            <div className="flex-1">
              <CitiesInput
                country={formState.country}
                city={formState.city}
                onChange={(value) => handleInputChange("city", value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <CategoryInput
                onChange={(value) =>
                  handleNestedInputChange(
                    "extras",
                    "category",
                    value?.value ?? ""
                  )
                }
              />
            </div>
            <div className="flex-1">
              <TypeInput
                onChange={(value) =>
                  handleNestedInputChange("extras", "type", value?.value ?? "")
                }
              />
            </div>
          </div>

          <ProviderToggle
            label="OpenVPN"
            description="Is this a free OpenVPN server?"
            checked={formState.provider.isFreeOpenVpn}
            onChange={(checked: any) =>
              handleNestedInputChange("provider", "isFreeOpenVpn", checked)
            }
          />

          <ProviderToggle
            label="ProtoVPN"
            description="Is this a free ProtoVPN server?"
            checked={formState.provider.isProton}
            onChange={(checked: any) =>
              handleNestedInputChange("provider", "isProton", checked)
            }
          />

          {formState.provider.isFreeOpenVpn && (
            <>
              <CredentialInput
                id="username"
                label="Username"
                value={formState.credentials.username}
                onChange={(value: any) =>
                  handleNestedInputChange("credentials", "username", value)
                }
              />
              <CredentialInput
                id="password"
                label="Password"
                value={formState.credentials.password}
                onChange={(value: any) =>
                  handleNestedInputChange("credentials", "password", value)
                }
              />
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload">File Upload</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) =>
                handleInputChange("file", e.target.files?.[0] ?? null)
              }
              className="cursor-pointer"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <VPNFilesTable
          flag={refreshFlag}
          setShowUpdateForm={setShowUpdateForm}
        />
      </div>

      {showUpdateForm.visible && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowUpdateForm({ visible: false, data: {}, id: "" });
            }
          }}
        >
          <DialogContent className="max-h-[700px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Form</DialogTitle>
            </DialogHeader>
            <VpnServerUpdateForm
              initialData={showUpdateForm.data}
              setShowUpdateForm={setShowUpdateForm}
              setFlag={setRefreshFlag}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Reusable components
const ProviderToggle = ({ label, description, checked, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <p className="text-base">{label}</p>
        <p>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  </div>
);

const CredentialInput = ({ id, label, value, onChange }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CountryInput = ({
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

const CitiesInput = ({
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

const CategoryInput = ({
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

const TypeInput = ({
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

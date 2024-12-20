//@ts-ignore
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { URL } from "./constants";
import { toast } from "sonner";
import { useEffect } from "react";
import { Label } from "./components/ui/label";
import { objectToFormData } from "./constants/objectToFormdata";

export default function VpnServerUpdateForm({
  initialData,
  setShowUpdateForm,
  setFlag,
}: {
  initialData: any;
  setShowUpdateForm: any;
  setFlag: any;
}) {
  const TOKEN = localStorage.getItem("token");
  const form = useForm({
    defaultValues: {
      ...initialData,
      hide: Boolean(initialData?.hide),
      isFreeOpenVpn: Boolean(initialData?.isFreeOpenVpn),
      isProton: Boolean(initialData?.isProton),
    },
  });

  const [userpassallow, setuserpassallow] = useState(
    Boolean(initialData?.isFreeOpenVpn)
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value?.isFreeOpenVpn === true) {
        setuserpassallow(value.isFreeOpenVpn);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: any) {
    try {
      const { _id, ...data } = values;

      console.log("Data", data);
      const formData = objectToFormData(data);

      await axios.patch(`${URL}/open-vpn/${_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${TOKEN}`,
        },
      });

      setShowUpdateForm({
        visible: false,
        id: "",
        data: {},
      });
      setFlag((prev: any) => !prev);
      toast.success("Form submitted successfully");
    } catch (error) {
      console.log("Error updating VPN server", error);
      toast.error("Error updating VPN server");
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cityname"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>CityName</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="isFreeOpenVpn"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">OpenVPN</FormLabel>
                    <FormDescription>
                      Is this a free OpenVPN server?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="isProton"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">ProtoVPN</FormLabel>
                  <FormDescription>
                    Is this a free ProtoVPN server?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GENEREL">Generel</SelectItem>
                    <SelectItem value="VIDEOS">Videos</SelectItem>
                    <SelectItem value="GAMES">Games</SelectItem>
                    <SelectItem value="SOCIAL MEDIA">Social Media</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="latitude,longitude" />
                </FormControl>
                <FormDescription>
                  Enter location as "latitude,longitude"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {userpassallow && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {userpassallow && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="grid w-full max-w-full items-center gap-3">
            <Label htmlFor="File">Flag File</Label>
            <Input id="File" type="file" {...form.register("flag")} />
          </div>
          <div className="grid w-full max-w-full items-center gap-3">
            <Label htmlFor="File">Config File</Label>
            <Input id="File" type="file" {...form.register("url")} />
          </div>

          <FormField
            control={form.control}
            name="hide"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Hide</FormLabel>
                  <FormDescription>
                    Hide this server from the list
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" style={{ width: "100%" }}>
            Update VPN Server
          </Button>
        </form>
      </Form>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Input,
  Button,
  Textarea,
  Switch,
  Select,
  SelectItem,
} from "@nextui-org/react";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { eventsService } from "../services/event.service";
import { PlacesAutocomplete } from "../components/ui/places-autocomplete";
import { filtersService } from "../services/filters.service";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  price: z.string().transform((val) => Number(val)),
  maxAttendees: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  format: z.string().min(1, "Format is required"),
  theme: z.string().min(1, "Theme is required"),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  publishDate: z.string().min(1, "Publish date is required"),
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");

  const [formats, setFormats] = useState([]);
  const [themes, setThemes] = useState([]);
  const [files, setFiles] = useState([]);
  const [isAttendeesHidden, setIsAttendeesHidden] = useState(false);
  const [notifyOrganizer, setNotifyOrganizer] = useState(true);
  const [promocodes, setPromocodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      publishDate: new Date().toISOString().split("T")[0],
      price: "0",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [formatsResponse, themesResponse] = await Promise.all([
          filtersService.getFormats(),
          filtersService.getThemes(),
        ]);

        console.log("Formats response:", formatsResponse);
        console.log("Themes response:", themesResponse);

        setFormats(formatsResponse || []);
        setThemes(themesResponse || []);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
        setError("Failed to load event formats and themes");
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    if (!companyId) {
      navigate("/");
    }
  }, [companyId, navigate]);

  const handleLocationSelect = (address, latLng) => {
    setValue("location", address);
    setCoordinates(latLng);
  };

  const handleFileUpload = (uploadedFiles) => {
    setFiles(uploadedFiles);
  };

  const addPromoCode = () => {
    setPromocodes([...promocodes, { code: "", discount: 0 }]);
  };

  const removePromoCode = (index) => {
    setPromocodes(promocodes.filter((_, i) => i !== index));
  };

  const updatePromoCode = (index, field, value) => {
    const updated = [...promocodes];
    updated[index][field] = value;
    setPromocodes(updated);
  };

  const onSubmit = async (data) => {
    try {
      console.log("Start form submission");
      setLoading(true);
      setError(null);

      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        date: new Date(data.date).toISOString(),
        price: parseFloat(data.price),
        maxAttendees: data.maxAttendees
          ? parseInt(data.maxAttendees)
          : undefined,
        format: data.format,
        theme: data.theme,
        redirectUrl: data.redirectUrl || undefined,
        publishDate: new Date(data.publishDate).toISOString(),
        companyId,
        isAttendeesHidden: Boolean(isAttendeesHidden),
        notifyOrganizer: Boolean(notifyOrganizer),
        promoCodes:
          promocodes.length > 0
            ? promocodes.map((promo) => ({
                code: promo.code,
                discount: parseFloat(promo.discount),
              }))
            : undefined,
        coordinates: coordinates
          ? {
              latitude: parseFloat(coordinates.lat),
              longitude: parseFloat(coordinates.lng),
            }
          : undefined,
      };

      console.log("Event data before submission:", eventData);

      const response = await eventsService.create(eventData, files);
      console.log("Response:", response);

      navigate(`/company/${companyId}`);
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        stack: err.stack,
      });
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold">Create New Event</h1>

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("Form validation failed:", errors);
          })}
          className="space-y-6"
        >
          <Input
            label="Title"
            {...register("title")}
            errorMessage={errors.title?.message}
          />

          <Textarea
            label="Description"
            {...register("description")}
            errorMessage={errors.description?.message}
          />

          <PlacesAutocomplete
            onSelect={handleLocationSelect}
            defaultValue=""
            error={errors.location?.message}
            register={register}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Event Date"
              {...register("date")}
              errorMessage={errors.date?.message}
            />

            <Input
              type="number"
              label="Price"
              {...register("price")}
              errorMessage={errors.price?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Format"
              isInvalid={!!errors.format}
              errorMessage={errors.format?.message}
              defaultSelectedKeys={[]}
              {...register("format")}
            >
              {Array.isArray(formats) &&
                formats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.label}
                  </SelectItem>
                ))}
            </Select>

            <Select
              label="Theme"
              isInvalid={!!errors.theme}
              errorMessage={errors.theme?.message}
              defaultSelectedKeys={[]}
              {...register("theme")}
            >
              {Array.isArray(themes) &&
                themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.label}
                  </SelectItem>
                ))}
            </Select>
          </div>

          <Input
            type="number"
            label="Max Attendees (optional)"
            {...register("maxAttendees")}
            errorMessage={errors.maxAttendees?.message}
          />

          <Input
            type="url"
            label="Redirect URL (optional)"
            {...register("redirectUrl")}
            errorMessage={errors.redirectUrl?.message}
          />

          <Input
            type="date"
            label="Publish Date"
            {...register("publishDate")}
            errorMessage={errors.publishDate?.message}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Images</h3>
            <FileUpload
              multiple
              onChange={handleFileUpload}
              accept="image/*"
              maxFiles={10}
            />
          </div>

          <div className="flex gap-6">
            <Switch
              isSelected={isAttendeesHidden}
              onValueChange={setIsAttendeesHidden}
            >
              Hide Attendees List
            </Switch>

            <Switch
              isSelected={notifyOrganizer}
              onValueChange={setNotifyOrganizer}
            >
              Notify About New Attendees
            </Switch>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Promo Codes</h3>
              <Button
                color="primary"
                variant="flat"
                onPress={addPromoCode}
                size="sm"
              >
                Add Promo Code
              </Button>
            </div>

            {promocodes.map((promo, index) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
                  placeholder="Code"
                  value={promo.code}
                  onChange={(e) =>
                    updatePromoCode(index, "code", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Discount %"
                  value={promo.discount}
                  onChange={(e) =>
                    updatePromoCode(index, "discount", Number(e.target.value))
                  }
                />
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => removePromoCode(index)}
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {error && <div className="text-red-500 text-center p-4">{error}</div>}

          <div className="flex justify-end gap-4">
            <Button
              color="danger"
              variant="light"
              onPress={() => navigate(`/company/${companyId}`)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={loading}
              disabled={loading}
              onPress={(e) => {
                console.log("Submit button clicked");
              }}
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}

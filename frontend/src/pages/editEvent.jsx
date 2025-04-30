import React from "react";
import { Form, Input, Textarea, Button, DatePicker, NumberInput, Autocomplete, AutocompleteItem } from "@heroui/react";
import DefaultLayout from "../layouts/default.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spotlight } from "../components/ui/spotlight-new";
import { FileUpload } from "../components/ui/file-upload";
import { now, getLocalTimeZone } from "@internationalized/date";

const schema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const formats = [
  { label: "Conferences", key: "conferences" },
  { label: "Lecture", key: "lecture" },
  { label: "Workshop", key: "workshop" }
];

const themes = [
  { label: "Cat", key: "cat" },
  { label: "Dog", key: "dog" },
  { label: "Elephant", key: "elephant" }
];

export default function createCompany() {
  const { err, setErr } = React.useState(null);
  const [files, setFiles] = React.useState([]);
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      name: "",
      description: "",
      date: now(getLocalTimeZone()),
      location: "",
      price: "",
      maxAttendees: "",
      format: "",
      theme: ""
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data) => {
    console.log(data);
  };


  const handleFileUpload = (files) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <DefaultLayout>
      <Spotlight />
      <div className="flex flex-col gap-10 rounded-lg w-full p-10">
        <h1 className="text-4xl font-bold text-center text-default-900">
          Edit event
        </h1>
        <Form
          className="mx-auto w-full gap-5"
          validationErrors={errors}
          onSubmit={handleSubmit(onSubmit)}>

          <Input
            {...register("name", { required: "Name is required" })}
            isRequired
            errorMessage={errors.name?.message}
            isInvalid={!!errors.name}
            label="Name"
            name="name"
            placeholder="Enter your name"
          />

          <Textarea
            {...register("description")}
            errorMessage={errors.description?.message}
            isInvalid={!!errors.description}
            label="Description"
            name="description"
            placeholder="Enter your description"
          />

          <div className="flex flex-col gap-4 md:flex-row w-full">
            <DatePicker
              {...register("date", { required: "Date is required" })}
              isRequired
              errorMessage={errors.date?.message}
              isInvalid={!!errors.date}
              hideTimeZone
              defaultValue={now(getLocalTimeZone())}
              selectorButtonPlacement="start"
              label="Event Date"
            />

            <Input
              {...register("location", { required: "location is required" })}
              isRequired
              errorMessage={errors.location?.message}
              isInvalid={!!errors.location}
              label="Location"
              name="location"
              placeholder="Enter your location"
            />
          </div>


          <div className="flex flex-col gap-4 md:flex-row w-full">
            <NumberInput
              {...register("price", { required: "Price is required" })}
              isRequired
              errorMessage={errors.price?.message}
              isInvalid={!!errors.price}
              formatOptions={{
                style: "currency",
                currency: "USD",
              }}
              label="Price"
              name="price"
              placeholder="Enter price"
            />

            <NumberInput
              {...register("maxAttendees", { required: "max attendees is required" })}
              errorMessage={errors.maxAttendees?.message}
              isInvalid={!!errors.maxAttendees}
              label="Max attendees"
              name="maxAttendees"
              placeholder="Enter max attendees"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row w-full">
            <Autocomplete
              {...register("format", { required: "Format is required" })}
              isRequired
              errorMessage={errors.format?.message}
              isInvalid={!!errors.format}
              defaultItems={formats}
              label="Format"
              name="format"
              placeholder="Choose a format"
            >
              {(format) => <AutocompleteItem key={format.key}>{format.label}</AutocompleteItem>}
            </Autocomplete>

            <Autocomplete
              {...register("theme", { required: "Theme is required" })}
              isRequired
              errorMessage={errors.theme?.message}
              isInvalid={!!errors.theme}
              defaultItems={themes}
              label="Theme"
              name="theme"
              placeholder="Choose a theme"
            >
              {(theme) => <AutocompleteItem key={theme.key}>{theme.label}</AutocompleteItem>}
            </Autocomplete>
          </div>

          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <FileUpload onChange={handleFileUpload} />
          </div>

          {err && <p className="text-red-500">{err}</p>}
          <div className="flex flex-col gap-4 w-full">
            <Button className="w-full" color="primary" type="submit" isDisabled={!isValid}>
              Save event
            </Button>
          </div>
        </Form>
        <Button className="w-full" onPress={() => navigate(`/event/${id}`)}>
          View event
        </Button>
      </div>
    </DefaultLayout>
  );
}
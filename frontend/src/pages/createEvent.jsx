import React from "react";
import { Form, Input, Textarea, Button, DatePicker, NumberInput, Autocomplete, AutocompleteItem, Card, Modal, ModalBody, ModalHeader, useDisclosure, ModalContent } from "@heroui/react";
import DefaultLayout from "../layouts/default.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spotlight } from "../components/ui/spotlight-new";
import { FileUpload } from "../components/ui/file-upload";
import { now, getLocalTimeZone } from "@internationalized/date";

const schema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
  description: z.string().optional(),
  date: z.any(),
  location: z.string().min(1, 'Location must be at least 1 character long'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  maxAttendees: z.coerce.number().min(1, 'Max attendees must be at least 1'),
  format: z.string().min(1, 'Format is required'),
  theme: z.string().min(1, 'Theme is required')
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

const promocodesData = [
  { promocode: "123456", discount: 10 },
  { promocode: "654321", discount: 20 },
  { promocode: "abcdef", discount: 30 },
  { promocode: "ghijkl", discount: 40 }
]

export default function createCompany() {
  const [ err, setErr ] = React.useState(null);
  const [files, setFiles] = React.useState([]);
  const [promocodes, setPromocodes] = React.useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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

  const { register: registerPromo, handleSubmit: handleSubmitPromo, formState: { errors: errorsPromo, isValid: isValidPromo } } = useForm({
    defaultValues: {
      promocode: "",
      discount: "",
    },
    resolver: zodResolver(z.object({
      promocode: z.string().min(1, 'Promocode must be at least 1 character long'),
      discount: z.coerce.number().min(1, 'Discount must be at least 1').max(100, 'Discount must be at most 100')
    })),
    mode: "onChange",
  });

  const onSubmit = (data) => {
    data.date = data.date.toDate(getLocalTimeZone()).toISOString();
    console.log(data);
  }

  const onSubmitPromo = (data) => {
    console.log(data);
    if (promocodes.find((promo) => promo.promocode === data.promocode)) {
      setErr("Promocode already exists");
      return;
    }
    setErr(null);
    setPromocodes((prev) => [...prev, data]);
  }

  const handleFileUpload = (files) => {
    setFiles(files);
    console.log(files);
  };

  const modal = () => {
    return (<Modal isOpen={isOpen} backdrop="blur" placement="center" onOpenChange={onOpenChange} className="z-50">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Add promocode</ModalHeader>
            <ModalBody className="p-5">
              <Form
                className="flex flex-col w-full gap-5"
                validationErrors={errorsPromo}
                onSubmit={handleSubmitPromo(onSubmitPromo)}>
                <Input
                  {...registerPromo("promocode", { required: "promocode is required" })}
                  isRequired
                  errorMessage={errorsPromo.promocode?.message}
                  isInvalid={!!errorsPromo.promocode}
                  label="Promocode"
                  name="promocode"
                  placeholder="Enter promocode"
                />
                <Input
                  {...registerPromo("discount", { required: "discount is required" })}
                  isRequired
                  errorMessage={errorsPromo.discount?.message}
                  isInvalid={!!errorsPromo.discount}
                  label="Discount"
                  name="discount"
                  placeholder="Enter discount"
                />

                <div className="w-full flex flex-row justify-end gap-4">
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cansel
                  </Button>
                  <Button color="primary" type="submit" onPress={onClose} isDisabled={!isValidPromo}>
                    Accept
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
    )
  }

  return (
    <DefaultLayout>
      <Spotlight />
      {modal()}
      <div className="flex flex-col gap-10 rounded-lg w-full p-10">
        <h1 className="text-4xl font-bold text-center text-default-900">
          Create event
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

          <div className="w-full flex gap-2 justify-center items-center">
            <FileUpload onChange={handleFileUpload} />
          </div>

          <div className="flex flex-wrap gap-4">
            {promocodes && promocodes.map((promo, index) => (
              <Card key={index} className="flex flex-col justify-start items-center gap-4 p-4">
                <p className="text-lg md:text-xl">Promo:{promo.promocode}</p>
                <h1>Discont:{promo.discount}%</h1>
              </Card>
            ))}
            <Card isPressable onPress={onOpen} className="flex flex-col justify-center items-center p-4">
              <p className="text-xl">Add promo</p>
            </Card>
          </div>

          {err && <p className="text-red-500">{err}</p>}
          <div className="flex flex-col gap-4 w-full">
            <Button className="w-full" color="primary" type="submit" >
              Create event
            </Button>
          </div>
        </Form>

      </div>
    </DefaultLayout>
  );
}
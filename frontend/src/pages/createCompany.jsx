"use client";

import React from "react";
import { Form, Input, Textarea, Button } from "@heroui/react";
import DefaultLayout from "../layouts/default.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spotlight } from "../components/ui/spotlight-new";
import { FileUpload } from "../components/ui/file-upload";


const schema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export default function createCompany() {
  const { err, setErr } = React.useState(null);
  const [files, setFiles] = React.useState([]);
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
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
          Create company
        </h1>
        <Form
          className="mx-auto w-full gap-5"
          validationErrors={errors}
          onSubmit={handleSubmit(onSubmit)}>

          <div className="flex flex-col gap-4 md:flex-row w-full">
            <Input
              {...register("name", { required: "Name is required" })}
              isRequired
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
              label="Name"
              name="name"
              placeholder="Enter your name"
            />

            <Input
              {...register("email", { required: "Email is required" })}
              isRequired
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              label="Email"
              name="email"
              placeholder="Enter your email"
              type="email"
            />
          </div>

          <Input
            {...register("location", { required: "location is required" })}
            isRequired
            errorMessage={errors.location?.message}
            isInvalid={!!errors.location}
            label="Location"
            name="location"
            placeholder="Enter your location"
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
            <Input
              {...register("website")}
              errorMessage={errors.website?.message}
              isInvalid={!!errors.website}
              label="Website"
              name="website"
              placeholder="Enter your website"
              type="url"
            />

            <Input
              {...register("phone")}
              errorMessage={errors.phone?.message}
              isInvalid={!!errors.phone}
              label="Phone"
              name="phone"
              placeholder="Enter your phone"
              type="tel"
            />
          </div>

          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <h1>Add your logo</h1>
            <FileUpload onChange={handleFileUpload} />
          </div>

          {err && <p className="text-red-500">{err}</p>}
          <div className="flex flex-col gap-4 w-full">
            <Button className="w-full" color="primary" type="submit" isDisabled={!isValid}>
              Create company
            </Button>
          </div>
        </Form>

      </div>
    </DefaultLayout>
  );
}
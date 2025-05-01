"use client";

import React from "react";
import { Form, Input, Textarea, Button } from "@heroui/react";
import DefaultLayout from "../layouts/default.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spotlight } from "../components/ui/spotlight-new";
import { FileUpload } from "../components/ui/file-upload";
import { companiesService } from "../services/company.service";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long"),
  email: z.string().email("Invalid email"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export default function CreateCompany() {
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [logo, setLogo] = React.useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const companyData = {
        ...data,
        logo: logo?.[0],
      };

      const response = await companiesService.create(companyData);
      navigate(`/company/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create company");
      console.error("Create company error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    setLogo(files);
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
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-4 md:flex-row w-full">
            <Input
              {...register("name")}
              isRequired
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
              label="Name"
              placeholder="Enter company name"
              disabled={loading}
            />

            <Input
              {...register("email")}
              isRequired
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              label="Email"
              placeholder="Enter company email"
              type="email"
              disabled={loading}
            />
          </div>

          <Input
            {...register("location")}
            isRequired
            errorMessage={errors.location?.message}
            isInvalid={!!errors.location}
            label="Location"
            placeholder="Enter company location"
            disabled={loading}
          />

          <Textarea
            {...register("description")}
            errorMessage={errors.description?.message}
            isInvalid={!!errors.description}
            label="Description"
            placeholder="Enter company description"
            disabled={loading}
          />

          <div className="flex flex-col gap-4 md:flex-row w-full">
            <Input
              {...register("website")}
              errorMessage={errors.website?.message}
              isInvalid={!!errors.website}
              label="Website"
              placeholder="Enter company website"
              type="url"
              disabled={loading}
            />

            <Input
              {...register("phone")}
              errorMessage={errors.phone?.message}
              isInvalid={!!errors.phone}
              label="Phone"
              placeholder="Enter company phone"
              type="tel"
              disabled={loading}
            />
          </div>

          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <h1>Add company logo</h1>
            <FileUpload onChange={handleFileUpload} disabled={loading} />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="flex flex-col gap-4 w-full">
            <Button
              className="w-full"
              color="primary"
              type="submit"
              isDisabled={!isValid || loading}
              isLoading={loading}
            >
              {loading ? "Creating..." : "Create company"}
            </Button>
          </div>
        </Form>
      </div>
    </DefaultLayout>
  );
}

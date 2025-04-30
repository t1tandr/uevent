import { Button, Image, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Tab, Tabs, Input, Card, CardHeader, CardBody, CardFooter, Form, Textarea } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { useNavigate } from "react-router-dom";

const dataTest = [
  { id: 1, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 2, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 3, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 4, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" }
];

const CompanyData = {
  name: "John Doe",
  email: "eege@gmail.com",
  location: "New York, USA",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  website: "https://example.com",
  phone: "+1 (555) 555-5555",
  avatar: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080"
}

export const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "ACTIONS", uid: "actions" }
];

export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
  },
];

const schema = z.object({
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  location: z.string().min(1, "Location is required").or(z.literal("")).optional(),
  description: z.string().min(1, "Description is required").or(z.literal("")).optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional(),
  phone: z.string().min(1, "Phone number is required").or(z.literal("")).optional(),
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [company, setCompany] = useState(null);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
      value: {
        email: "",
        location: "",
        description: "",
        website: "",
        phone: "",
      },
      resolver: zodResolver(schema),
      mode: "onChange",
    });

  useEffect(() => {
    setData(dataTest);
    setCompany(CompanyData);
  }, []);

  const handleEdit = () => {
    setEdit(!edit);
  }

  const handleAddMember = () => {

  }

  const [files, setFiles] = useState([]);
  const handleFileUpload = (files) => {
    setFiles(files);
    console.log(files);
  };

  const onSubmit = (data) => {
    console.log(data);
    setEdit(!edit);
  }

  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ src: user.avatar }}
            name={cellValue}
          />
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "actions":
        return (
          <div className="gap-2 flex">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              Edit
            </span>
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              Delete
            </span>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <DefaultLayout>
      <div className="min-h-screen flex flex-col gap-5">
        {company && (
          <div className="flex flex-col justify-start gap-4 p-4 bg-zinc-600/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {edit ? (
              <>
                <div className="w-[20vh] h-[20vh]">
                  <FileUpload onChange={handleFileUpload} />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Form
                    className="mx-auto w-full gap-5"
                    validationErrors={errors}
                    onSubmit={handleSubmit(onSubmit)}>
                    <Input
                      {...register("email")}
                      errorMessage={errors.email?.message}
                      isInvalid={!!errors.email}
                      label="Email"
                      name="email"
                      placeholder="Enter email"
                      type="email"
                    />
                    <Input
                      {...register("location")}
                      errorMessage={errors.location?.message}
                      isInvalid={!!errors.location}
                      label="Location"
                      name="location"
                      placeholder="Enter location"
                    />
                    <Textarea
                      {...register("description")}
                      errorMessage={errors.description?.message}
                      isInvalid={!!errors.description}
                      label="Description"
                      name="description"
                      placeholder="Enter description"
                    />
                    <Input
                      {...register("website")}
                      errorMessage={errors.website?.message}
                      isInvalid={!!errors.website}
                      label="Website"
                      name="website"
                      placeholder="Enter website"
                      type="website"
                    />
                    <Input
                      {...register("phone")}
                      errorMessage={errors.phone?.message}
                      isInvalid={!!errors.phone}
                      label="Phone"
                      name="phone"
                      placeholder="Enter phone"
                      type="phone"
                    />
                    <Button type="submit" className="bg-primary">Save</Button>
                  </Form>
                </div>
              </>
            ) : (
              <div className="relative">
                <img className="absolute top-0 left-0 w-full h-full object-cover blur-lg opacity-20" src={company.avatar} />
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center items-center">
                    <Image isBlurred className="w-[25vh] h-[25vh] object-cover rounded-md" src={company.avatar} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl">{company.name}</h2>
                    <h2 className="text-lg"><span className="text-xl text-black dark:text-white">Email:</span> {company.email}</h2>
                    <h2 className="text-lg"><span className="text-xl text-black dark:text-white">Location:</span> {company.location}</h2>
                    <h2 className="text-lg text-gray-400"><span className="text-xl text-black dark:text-white">Description:</span> {company.description}</h2>
                    <h2 className="text-lg text-gray-400"><span className="text-xl text-black dark:text-white">Website:</span> {company.website}</h2>
                    <h2 className="text-lg text-gray-400"><span className="text-xl text-black dark:text-white">Phone:</span> {company.phone}</h2>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-row w-full gap-2">
          <Button onPress={() => handleEdit()} className="w-full">Edit Company</Button>
          <Button onPress={() => navigate("/profile/delete")} className="w-full bg-red-500/30 ">Delete company</Button>
        </div>
        <Button onPress={() => navigate("/event/create")} className="w-full bg-primary/60">Create event</Button>
        <div>
          <Tabs size="lg" className="w-full" defaultSelectedKey="Comments">
            <Tab key="members" title="Members" className="flex flex-col gap-4">
              <Table>
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.uid}>
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={users}>
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Button onPress={() => handleAddMember()}>Add member</Button>
            </Tab>
            <Tab key="event" title="Events">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data && data.map((post, index) => (
                  <Card key={index} className="flex-grow w-full group/card">
                    <div onClick={() => navigate(`/event/${post.id}`)} className={"cursor-pointer overflow-hidden relative rounded-md shadow-xl max-w-sm mx-auto flex flex-col justify-between p-4"}>
                      <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-gray-400 dark:group-hover/card:bg-black opacity-60"></div>
                      <img className="absolute top-0 left-0 w-full h-full object-contain blur-lg opacity-20" src={post.image} />
                      <CardHeader>
                        <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">{post.title}</h2>
                      </CardHeader>

                      <CardBody className="">
                        <div className="rounded-lg overflow-hidden flex justify-center items-center h-60">
                          <Image
                            isBlurred
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                          />
                        </div>
                      </CardBody>

                      <CardFooter>
                        <div className="flex flex-row gap-2 w-full">
                          <Button onPress={() => navigate(`/event/edit/${post.id}`)} className="w-full">Edit event</Button>
                          <Button onPress={() => navigate(`/event/delete/${post.id}`)} className="bg-red-800/60 w-full">Delete event</Button>
                        </div>
                      </CardFooter>

                    </div>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </DefaultLayout >
  );
}
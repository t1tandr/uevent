import { Card, CardHeader, CardFooter, Button, Image, CardBody, Tab, Tabs, Input, Form } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';



const dataTest = [
  { id: 1, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 2, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 3, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 4, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" }
];

const ticketsData = [
  { id: 1, qr: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1280px-QR_code_for_mobile_English_Wikipedia.svg.png", price: "free" },
  { id: 1, qr: "", price: "paid" },
  { id: 1, qr: "", price: "vip" },
  { id: 1, qr: "", price: "early-bird" }
]

const notificationsData = [
  { event: "Breathing App", data: "02-05-25", id: 1, message: "Test notification 1" },
  { event: "Breathing App", data: "02-05-25", id: 2, message: "Test notification 2" },
  { event: "Breathing App", data: "02-05-25", id: 3, message: "Test notification 3" },
  { event: "Breathing App", data: "02-05-25", id: 4, message: "Test notification 4" }
]

const userData = {
  name: "John Doe",
  email: "eege@gmail.com",
  avatar: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080"
}

const schema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long').or(z.literal("")).optional(),
  email: z.string().email('Invalid email').or(z.literal("")).optional(),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("notification");

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    value: {
      name: "",
      email: ""
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    setData(dataTest);
    setTickets(ticketsData);
    setNotifications(notificationsData);
    setUser(userData);
  }, []);

  const handleEdit = () => {
    setEdit(!edit);
  }

  const handleMarkAsRead = (id) => {

  }

  const handleMarkAllAsRead = () => {

  }

  const onSubmit = (data) => {
    console.log(data);
    setEdit(!edit);
  }

  const [files, setFiles] = useState([]);
  const handleFileUpload = (files) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen flex flex-col justify-between">
        <div className="flex flex-col gap-4 flex-grow">
          {user && (
            <div className="flex flex-row justify-between gap-4 text-2xl p-4 bg-zinc-600/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.2)]">
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
                        {...register("name")}
                        errorMessage={errors.name?.message}
                        isInvalid={!!errors.name}
                        label="Name"
                        name="name"
                        placeholder="Enter name"
                      />
                      <Input
                        {...register("email")}
                        errorMessage={errors.email?.message}
                        isInvalid={!!errors.email}
                        label="Email"
                        name="email"
                        placeholder="Enter email"
                        type="email"
                      />
                      <Button type="submit" className="bg-primary">Save</Button>
                    </Form>
                  </div>
                </>
              ) : (
                <>
                  < div className="flex flex-row justify-center items-center gap-4">
                    <Image isBlurred className="w-[20vh] h-[20vh] object-cover rounded-md" src={user.avatar} />
                    <div className="flex flex-col gap-2">
                      <h2>{user.name}</h2>
                      <h2 className="text-bold text-xl">{user.email}</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onPress={() => handleEdit()} className="bg-primary ">Edit Profile</Button>
                    <Button onPress={() => navigate("/profile/delete")} className="bg-red-500 ">Delete profile</Button>
                    <Button onPress={() => navigate("/company/manage")} >Manage company</Button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Tabs size="lg" className="w-full" defaultSelectedKey="notification" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key)}>
                <Tab key="notification" title="Notifications" />
                <Tab key="ticket" title="Tickets" />
                <Tab key="event" title="Events" />
              </Tabs>

              {activeTab === "notification" && (<Button onPress={handleMarkAllAsRead}>
                Mark all as read
              </Button>)}
            </div>

            {activeTab === "notification" && (<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {notifications && notifications.map((notification, index) => (
                <Card key={index} onPress={() => navigate(`/event/${notification.id}`)} className="flex-grow w-full group/card">
                  <div className={"flex flex-col justify-between"}>
                    <CardHeader>
                      <div className="flex flex-col gap-2">
                        <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">{notification.event}</h2>
                        <p className="dark:text-white/60 text-black/60">{notification.data}</p>
                      </div>
                    </CardHeader>

                    <CardBody>
                      <p className="dark:text-white/60 text-black/60">{notification.message}</p>
                    </CardBody>

                    <CardFooter>
                      <Button onPress={handleMarkAsRead(notification.id)} className="bg-purple-500 w-full">
                        Mark as read
                      </Button>
                    </CardFooter>

                  </div>
                </Card>
              ))}
            </div>
            )}

            {activeTab === "ticket" && (<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {tickets && tickets.map((ticket, index) => (
                <Card key={index} onPress={() => navigate(`/event/${ticket.id}`)} className="flex-grow w-full group/card">
                  <div className={"flex flex-col justify-between"}>
                    <CardHeader>
                      <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">{ticket.title}</h2>
                    </CardHeader>

                    <CardBody className="">
                      <div className="overflow-hidden flex justify-center items-center">
                        <Image
                          isBlurred
                          src={ticket.qr}
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                    </CardBody>

                    <CardFooter>
                      <div className="flex flex-grow gap-2 items-center">
                        <p className="dark:text-white/60 text-black/60">{ticket.price}</p>
                      </div>
                    </CardFooter>

                  </div>
                </Card>
              ))}
            </div>
            )}

            {activeTab === "event" && (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data && data.map((post, index) => (
                <Card key={index} isPressable onPress={() => navigate(`/event/${post.id}`)} className="group/card">
                  <div className={"overflow-hidden relative rounded-md shadow-xl h-full max-w-sm flex flex-col p-4"}>
                    <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-gray-400 dark:group-hover/card:bg-black opacity-60"></div>
                    <img className="absolute top-0 left-0 w-full h-full object-contain blur-lg opacity-20" src={post?.image} />
                    <CardHeader>
                      <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">{post.title}</h2>
                    </CardHeader>

                    {post.image && <CardBody>
                      <div className="rounded-lg overflow-hidden flex justify-center items-center h-60">
                        <Image
                          src={post?.image}
                          alt={post.title}
                          loading="lazy"
                        />
                      </div>
                    </CardBody>}

                    <CardFooter>
                      <div className="flex flex-grow gap-2 items-center">
                        <p className="dark:text-white/60 text-black/60">{post.description}</p>
                      </div>
                    </CardFooter>

                  </div>
                </Card>
              ))}
            </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <Button onPress={() => navigate("/company/create")} className="bg-purple-600/50 w-full text-white">Create company</Button>
          <Button onPress={() => {authService.logout(); dispatch(logout());  navigate("/login")}} className="bg-red-600/50 w-full text-white">Logout Profile</Button>
        </div>
      </div>
    </DefaultLayout >
  );
}

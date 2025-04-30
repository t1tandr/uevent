import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Image,
  CardBody,
  Tab,
  Tabs,
  Input,
  Form,
} from "@heroui/react";
import { getAccessToken } from "../services/auth-token.service";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { ticketsService } from "@/services/ticket.service";
import { notificationsService } from "@/services/notification.service";
import { eventsService } from "@/services/event.service";
import { companiesService } from "@/services/company.service";
import { userService } from "@/services/user.service";

const schema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long"),
  email: z.string().email("Invalid email"),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("notifications");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await authService.getProfile();
      setUser(profileResponse.data);

      const [
        notificationsResponse,
        ticketsResponse,
        eventsResponse,
        companiesResponse,
      ] = await Promise.allSettled([
        notificationsService.getUserNotifications(),
        ticketsService.getUserTickets(),
        eventsService.getUserEvents(),
        companiesService.getUserCompanies(),
      ]);

      setNotifications(
        notificationsResponse.status === "fulfilled"
          ? notificationsResponse.value?.data || []
          : []
      );

      setTickets(
        ticketsResponse.status === "fulfilled"
          ? ticketsResponse.value?.data || []
          : []
      );

      setEvents(
        eventsResponse.status === "fulfilled"
          ? eventsResponse.value?.data || []
          : []
      );

      setCompanies(
        companiesResponse.status === "fulfilled"
          ? companiesResponse.value?.data || []
          : []
      );
    } catch (err) {
      console.error("Error details:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (files?.length) {
      try {
        setLoading(true);
        const updatedUser = await userService.updateAvatar(files[0]);
        setUser((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      } catch (err) {
        setError("Failed to update avatar");
        console.error("Failed to upload avatar:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      setEdit(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
            {error}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen flex flex-col gap-6 p-4">
        {/* Profile Header */}
        <div className="bg-gray-800/30 rounded-xl p-6 shadow-lg">
          {edit ? (
            <div className="flex gap-6">
              <div className="w-48">
                <FileUpload
                  onChange={handleFileUpload}
                  currentImage={user?.avatarUrl}
                  disabled={loading}
                />
              </div>
              <Form onSubmit={handleSubmit(onSubmit)} className="flex-1">
                <div className="space-y-4">
                  <Input
                    {...register("name")}
                    label="Name"
                    error={errors.name?.message}
                    disabled={loading}
                  />
                  <Input
                    {...register("email")}
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      color="primary"
                      disabled={loading}
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setEdit(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <Image
                  src={user?.avatarUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="w-48 h-48 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  color="primary"
                  onClick={() => setEdit(true)}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
                <Button
                  color="danger"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
          <Tab
            key="notifications"
            title={`Notifications (${notifications.length})`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardBody>
                    <p>{notification.message}</p>
                    <small className="text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </small>
                  </CardBody>
                  <CardFooter>
                    <Button
                      size="sm"
                      onPress={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Tab>

          <Tab key="tickets" title={`Tickets (${tickets.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  isPressable
                  onPress={() => navigate(`/event/${ticket.eventId}`)}
                >
                  <CardBody>
                    <h3 className="text-lg font-semibold">
                      {ticket.event.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(ticket.event.date).toLocaleDateString()}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <Button
                      size="sm"
                      onClick={() =>
                        ticketsService.downloadTicketPDF(ticket.id)
                      }
                    >
                      Download PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Tab>

          <Tab key="events" title={`Events (${events.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  isPressable
                  onPress={() => navigate(`/event/${event.id}`)}
                >
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                  </CardHeader>
                  <CardBody>
                    {event.image && (
                      <Image
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                    <p className="mt-2">{event.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>

          <Tab key="companies" title={`Companies (${companies.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                  </CardHeader>
                  <CardBody>
                    {company.logo && (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                    <p className="mt-2">{company.description}</p>
                  </CardBody>
                  <CardFooter>
                    <Button
                      color="primary"
                      onClick={() => navigate(`/company/${company.id}`)}
                    >
                      View Company
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Tab>
        </Tabs>

        {/* Create Company Button */}
        <Button
          color="secondary"
          className="mt-auto"
          onClick={() => navigate("/company/create")}
        >
          Create New Company
        </Button>
      </div>
    </DefaultLayout>
  );
}

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
  Spinner,
  Chip,
  Badge,
} from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { getAccessToken } from "../services/auth-token.service";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { ticketsService } from "../services/ticket.service";
import { notificationsService } from "../services/notification.service";
import { eventsService } from "../services/event.service";
import { companiesService } from "../services/company.service";
import { userService } from "../services/user.service";
import { subscribersService } from "../services/subscribe.service";

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
  const [subscriptions, setSubscriptions] = useState([]);
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("notifications");
  const [unsubscribeLoading, setUnsubscribeLoading] = useState({});

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
        subscriptionsResponse,
      ] = await Promise.allSettled([
        notificationsService.getUserNotifications(),
        ticketsService.getUserTickets(),
        eventsService.getUserEvents(),
        companiesService.getUserCompanies(),
        subscribersService.getUserSubscriptions(),
      ]);

      setNotifications(
        notificationsResponse.status === "fulfilled"
          ? notificationsResponse.value?.data || []
          : []
      );

      setTickets(
        ticketsResponse.status === "fulfilled"
          ? ticketsResponse.value || []
          : []
      );

      setEvents(
        eventsResponse.status === "fulfilled"
          ? eventsResponse.value?.data || []
          : []
      );

      setCompanies(
        companiesResponse.status === "fulfilled"
          ? companiesResponse.value?.data?.map((member) => member.company) || []
          : []
      );

      // Установка подписок - извлекаем компании из ответа API
      setSubscriptions(
        subscriptionsResponse.status === "fulfilled"
          ? subscriptionsResponse.value?.data?.map((sub) => sub.company) || []
          : []
      );
    } catch (err) {
      console.error("Error details:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (companyId) => {
    try {
      setUnsubscribeLoading((prev) => ({ ...prev, [companyId]: true }));

      await subscribersService.unsubscribeFromCompany(companyId);

      setSubscriptions((prev) =>
        prev.filter((company) => company.id !== companyId)
      );
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    } finally {
      setUnsubscribeLoading((prev) => ({ ...prev, [companyId]: false }));
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

  const handleDownloadTicket = async (ticketId) => {
    try {
      const response = await ticketsService.downloadTicketPdf(ticketId);

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download ticket:", err);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
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
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
                <div className="space-y-4">
                  <Input
                    {...register("name")}
                    label="Name"
                    errorMessage={errors.name?.message}
                    isDisabled={loading}
                  />
                  <Input
                    {...register("email")}
                    label="Email"
                    type="email"
                    errorMessage={errors.email?.message}
                    isDisabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      color="primary"
                      isDisabled={loading}
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      onPress={() => setEdit(false)}
                      isDisabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
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
                  onPress={() => setEdit(true)}
                  isDisabled={loading}
                >
                  Edit Profile
                </Button>
                <Button
                  color="danger"
                  onPress={handleLogout}
                  isDisabled={loading}
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
              {notifications.length === 0 ? (
                <div className="col-span-full text-center p-6">
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
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
                ))
              )}
            </div>
          </Tab>

          <Tab key="tickets" title={`Tickets (${tickets.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.length === 0 ? (
                <div className="col-span-full text-center p-6">
                  <p className="text-gray-500">No tickets yet</p>
                  <Button
                    color="primary"
                    className="mt-4"
                    onPress={() => navigate("/")}
                  >
                    Browse Events
                  </Button>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardHeader className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {ticket.event.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          ID: {ticket.id.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="bg-success-50 text-success px-2 py-1 rounded-full text-xs">
                        {ticket.status}
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-col gap-2">
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {new Date(ticket.event.date).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-semibold">Location:</span>{" "}
                          {ticket.event.location}
                        </p>
                        <p>
                          <span className="font-semibold">Price:</span> $
                          {ticket.price}
                        </p>
                        {ticket.qrCode && (
                          <div className="mt-2">
                            <img
                              src={ticket.qrCode}
                              alt="Ticket QR Code"
                              className="mx-auto h-32 w-auto"
                            />
                          </div>
                        )}
                      </div>
                    </CardBody>
                    <CardFooter className="flex justify-between">
                      <Button
                        color="primary"
                        variant="light"
                        onPress={() => navigate(`/event/${ticket.event.id}`)}
                      >
                        View Event
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => handleDownloadTicket(ticket.id)}
                      >
                        Download PDF
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </Tab>

          <Tab key="events" title={`Events (${events.length})`}>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  You haven't created any events yet
                </p>
                <Button
                  color="primary"
                  className="mt-4"
                  startContent={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  onPress={() => navigate("/event/create")}
                >
                  Create First Event
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-md text-gray-500">
                    Showing {events.length} events you've created
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    onPress={() => navigate("/event/create")}
                  >
                    Create Event
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="transition-shadow hover:shadow-lg"
                      isPressable
                      onPress={() => navigate(`/event/${event.id}`)}
                    >
                      <div className="relative">
                        {event.imagesUrls && event.imagesUrls.length > 0 ? (
                          <Image
                            src={event.imagesUrls[0]}
                            alt={event.title}
                            className="w-full h-40 object-cover"
                            radius="none"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900" />
                        )}

                        <div className="absolute top-3 right-3 flex gap-2">
                          <Chip size="sm" color="primary">
                            ${event.price || 0}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="flat"
                            className={`${
                              event.status === "PUBLISHED"
                                ? "bg-success-100 text-success-700"
                                : event.status === "DRAFT"
                                  ? "bg-warning-100 text-warning-700"
                                  : "bg-danger-100 text-danger-700"
                            }`}
                          >
                            {event.status}
                          </Chip>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-white font-medium truncate">
                            {event.title}
                          </p>
                        </div>
                      </div>

                      <CardBody className="p-3 pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500 truncate">
                              {event.location}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex gap-2 mt-3">
                          {event.format && (
                            <Chip size="sm" variant="flat">
                              {event.format}
                            </Chip>
                          )}
                          {event.theme && (
                            <Chip size="sm" variant="flat" color="secondary">
                              {event.theme}
                            </Chip>
                          )}
                        </div>
                      </CardBody>

                      <CardFooter className="pt-0 pb-3 px-3">
                        <div className="flex justify-between w-full">
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            onPress={() => navigate(`/event/edit/${event.id}`)}
                          >
                            Edit
                          </Button>
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500">
                              {event._count?.attendees || 0} attendees
                            </span>
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Tab>

          {/* Tab для Companies */}
          <Tab key="companies" title={`Companies (${companies.length})`}>
            {companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  You haven't created any companies yet
                </p>
                <Button
                  color="primary"
                  className="mt-4"
                  startContent={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  onPress={() => navigate("/company/create")}
                >
                  Create First Company
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-md text-gray-500">
                    Showing {companies.length} companies you manage
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    onPress={() => navigate("/company/create")}
                  >
                    Create Company
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {companies.map((company) => (
                    <Card
                      key={company.id}
                      className="transition-shadow hover:shadow-lg relative"
                      isPressable
                      onPress={() => navigate(`/company/${company.id}`)}
                    >
                      <div className="relative">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-48 object-cover"
                            radius="none"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-secondary-100 to-primary-100 dark:from-secondary-900 dark:to-primary-900 flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardBody className="p-4">
                        <h3 className="text-xl font-semibold mb-1">
                          {company.name}
                        </h3>

                        <div className="flex flex-col gap-2 mt-3">
                          <div className="flex items-start gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {company.email}
                            </span>
                          </div>
                          {company.location && (
                            <div className="flex items-start gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {company.location}
                              </span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-start gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {company.phone}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mt-3">
                          {company.description || "No description provided"}
                        </p>
                      </CardBody>

                      <CardFooter className="pt-0 pb-3 px-4">
                        <div className="flex justify-between w-full">
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            onPress={() =>
                              navigate(`/company/manage?id=${company.id}`)
                            }
                          >
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={(e) => {
                              e.stopPropagation();
                              navigate(`/event/create?company=${company.id}`);
                            }}
                          >
                            Create Event
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Tab>
          <Tab
            key="subscriptions"
            title={`Subscriptions (${subscriptions.length})`}
          >
            {subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  You're not subscribed to any companies yet
                </p>
                <Button
                  color="primary"
                  className="mt-4"
                  onPress={() => navigate("/")}
                >
                  Explore Companies
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-md text-gray-500">
                    You're subscribed to {subscriptions.length}{" "}
                    {subscriptions.length === 1 ? "company" : "companies"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subscriptions.map((company) => (
                    <Card
                      key={company.id}
                      className="transition-shadow hover:shadow-lg"
                      isPressable
                      onPress={() => navigate(`/company/${company.id}`)}
                    >
                      <div className="relative">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-48 object-cover"
                            radius="none"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}

                        {/* Badge showing subscriber count */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            content={
                              <div className="flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                            }
                            color="primary"
                          >
                            <div className="w-6 h-6"></div>
                          </Badge>
                        </div>
                      </div>

                      <CardBody className="p-4">
                        <h3 className="text-xl font-semibold mb-2">
                          {company.name}
                        </h3>

                        <div className="flex flex-col gap-2 mb-3">
                          {company.location && (
                            <div className="flex items-start gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {company.location}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {company.description || "No description provided"}
                        </p>
                      </CardBody>

                      <CardFooter className="flex justify-between p-4">
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => navigate(`/company/${company.id}`)}
                        >
                          View Events
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleUnsubscribe(company.id);
                          }}
                          isLoading={unsubscribeLoading[company.id]}
                          isDisabled={unsubscribeLoading[company.id]}
                        >
                          Unsubscribe
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Tab>
        </Tabs>

        {/* Create Company Button */}
        <Button
          color="secondary"
          className="mt-auto"
          onPress={() => navigate("/company/create")}
        >
          Create New Company
        </Button>
      </div>
    </DefaultLayout>
  );
}

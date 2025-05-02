import {
  Button,
  Image,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Form,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Spinner,
  Avatar,
  Divider,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import DefaultLayout from "../layouts/default";
import { useNavigate, useParams } from "react-router-dom";
import { companiesService } from "../services/company.service";
import { subscribersService } from "../services/subscribe.service";
import { FileUpload } from "../components/ui/file-upload";
import { useSelector } from "react-redux";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export default function CompanyPage() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [company, setCompany] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState(null);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchSubscribers = async () => {
    try {
      setLoadingSubscribers(true);
      const response = await subscribersService.getCompanySubscribers(id);
      setSubscribers(response.data);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        companyData,
        eventsData,
        subscriptionData,
        permissionData,
        subscribersCountData,
      ] = await Promise.all([
        companiesService.getCompanyById(id),
        companiesService.getCompanyEvents(id),
        subscribersService.checkSubscription(id),
        companiesService.checkEditPermission(id),
        subscribersService.getSubscribersCount(id),
      ]);

      const company = companyData.data;
      setCompany(company);
      setEvents(eventsData.data.data || eventsData.data);
      setIsSubscribed(subscriptionData.data.isSubscribed);
      setCanEdit(permissionData.data.canEdit);
      setSubscriberCount(
        subscribersCountData.data.count || company._count?.subscribers || 0
      );

      if (permissionData.data.canEdit) {
        reset({
          name: company.name,
          email: company.email,
          location: company.location,
          description: company.description,
          website: company.website,
          phone: company.phone,
        });
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(err.response?.data?.message || "Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const handleShowSubscribers = async () => {
    setShowSubscribers(true);
    await fetchSubscribers();
  };

  const handleSubscribeToggle = async () => {
    try {
      setLoading(true);
      if (isSubscribed) {
        await subscribersService.unsubscribeFromCompany(id);
        setSubscriberCount((prev) => Math.max(0, prev - 1));
      } else {
        await subscribersService.subscribeToCompany(id);
        setSubscriberCount((prev) => prev + 1);
      }
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleLogoUpload = (files) => {
    setLogo(files[0]);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (logo) {
        await companiesService.updateLogo(id, logo);
      }

      const updatedCompany = await companiesService.update(id, {
        name: data.name,
        email: data.email,
        location: data.location,
        description: data.description || "",
        website: data.website || "",
        phone: data.phone || "",
      });

      setCompany(updatedCompany.data);
      setIsEditing(false);

      reset(updatedCompany.data);

      setLogo(null);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update company");
    } finally {
      setLoading(false);
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
        {/* Company Header */}
        {company && (
          <Card className="overflow-hidden relative shadow-lg">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10" />
              {company.logoUrl && (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover blur-lg opacity-30"
                />
              )}
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-6 relative z-20">
              <div className="md:w-1/3">
                <div className="rounded-lg overflow-hidden shadow-xl border-4 border-white border-opacity-10">
                  <Image
                    src={company.logoUrl || "/default-company.png"}
                    alt={company.name}
                    className="w-full aspect-square object-cover"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    color={isSubscribed ? "danger" : "primary"}
                    className="w-full"
                    onPress={handleSubscribeToggle}
                    isLoading={loading}
                    startContent={
                      isSubscribed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4l-1.4 1.866a4 4 0 00-.8 2.4z" />
                        </svg>
                      )
                    }
                  >
                    {isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      className="flex-1"
                      startContent={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      }
                      onPress={handleShowSubscribers}
                    >
                      {subscriberCount}{" "}
                      {subscriberCount === 1 ? "Subscriber" : "Subscribers"}
                    </Button>

                    {canEdit && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="flex-1"
                        onPress={handleEdit}
                        startContent={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold mb-2">{company.name}</h1>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{company.email}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{company.location}</span>
                  </div>

                  {company.phone && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{company.phone}</span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>

                {company.description && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-300">{company.description}</p>
                  </div>
                )}

                {canEdit && (
                  <div className="mt-6">
                    <Button
                      color="success"
                      startContent={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                      onPress={() =>
                        navigate(`/event/create?companyId=${company.id}`)
                      }
                    >
                      Create New Event
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Modal for subscribers */}
        <Modal
          isOpen={showSubscribers}
          onOpenChange={(open) => setShowSubscribers(open)}
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Company Subscribers ({subscribers.length})
                </ModalHeader>
                <ModalBody>
                  {loadingSubscribers ? (
                    <div className="flex justify-center p-4">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() =>
                            navigate(`/profile/${subscriber.user.id}`)
                          }
                          role="button"
                        >
                          <Avatar
                            src={
                              subscriber.user.avatarUrl || "/default-avatar.png"
                            }
                            name={subscriber.user.name.charAt(0)}
                            size="md"
                          />
                          <div>
                            <p className="font-medium">
                              {subscriber.user.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscriber.user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                      {subscribers.length === 0 && (
                        <div className="text-center py-10">
                          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500">No subscribers yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal for editing */}
        <Modal
          isOpen={isEditing}
          onOpenChange={(open) => setIsEditing(open)}
          size="3xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Edit Company</ModalHeader>
                <ModalBody>
                  <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FileUpload
                      onChange={handleLogoUpload}
                      currentImage={company.logoUrl}
                      label="Company Logo"
                    />
                    <Input
                      {...register("name")}
                      label="Company Name"
                      placeholder="Enter company name"
                      errorMessage={errors.name?.message}
                    />
                    <Input
                      {...register("email")}
                      label="Email"
                      placeholder="company@example.com"
                      errorMessage={errors.email?.message}
                    />
                    <Input
                      {...register("location")}
                      label="Location"
                      placeholder="City, Country"
                      errorMessage={errors.location?.message}
                    />
                    <Textarea
                      {...register("description")}
                      label="Description"
                      placeholder="Tell about your company..."
                      errorMessage={errors.description?.message}
                    />
                    <Input
                      {...register("website")}
                      label="Website"
                      placeholder="https://example.com"
                      errorMessage={errors.website?.message}
                    />
                    <Input
                      {...register("phone")}
                      label="Phone"
                      placeholder="+1 123 456 7890"
                      errorMessage={errors.phone?.message}
                    />
                  </Form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleSubmit(onSubmit)}>
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Events Section */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Events by {company?.name}</h2>

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="bg-gray-100/10 dark:bg-gray-800/20 rounded-lg p-10 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
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
              </div>
              <p className="text-gray-500 mb-4">
                No events for this company yet
              </p>
              {canEdit && (
                <Button
                  color="primary"
                  size="sm"
                  onPress={() =>
                    navigate(`/event/create?companyId=${company.id}`)
                  }
                >
                  Create First Event
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <Card
                  key={event.id}
                  isPressable
                  onPress={() => navigate(`/event/${event.id}`)}
                  className="group/card h-full"
                >
                  <div className="overflow-hidden relative rounded-md shadow-xl h-full flex flex-col p-4">
                    <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-gray-400 dark:group-hover/card:bg-black opacity-60"></div>
                    {event.imagesUrls?.[0] && (
                      <img
                        className="absolute top-0 left-0 w-full h-full object-contain blur-lg opacity-20"
                        src={event.imagesUrls[0]}
                        alt={event.title}
                      />
                    )}

                    <CardHeader className="flex flex-col items-start z-10 p-0 pb-4">
                      <div className="flex justify-between w-full items-center">
                        <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">
                          {event.title}
                        </h2>
                        <Chip size="sm" color="primary">
                          ${event.price}
                        </Chip>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(event.date)}
                      </p>
                      {event.format && (
                        <Chip size="sm" className="mt-2" variant="flat">
                          {event.format}
                        </Chip>
                      )}
                    </CardHeader>

                    {event.imagesUrls?.[0] && (
                      <CardBody className="z-10 p-0 pb-4">
                        <div className="rounded-lg overflow-hidden flex justify-center items-center h-48">
                          <Image
                            src={event.imagesUrls[0]}
                            alt={event.title}
                            loading="lazy"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </CardBody>
                    )}

                    <CardFooter className="z-10 p-0 mt-auto">
                      <div className="flex flex-col gap-2 w-full">
                        <p className="dark:text-white/60 text-black/60 line-clamp-2 text-sm">
                          {event.description}
                        </p>
                        <div className="flex justify-between items-center w-full mt-2">
                          <span className="text-xs text-gray-500">
                            {event.location}
                          </span>
                          {event.theme && (
                            <Chip size="sm" variant="flat" color="secondary">
                              {event.theme}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

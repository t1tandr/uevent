import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useTheme } from "next-themes";
import DefaultLayout from "../layouts/default";
import { eventsService } from "../services/event.service";
import { commentsService } from "../services/comment.service";
import { ticketsService } from "../services/ticket.service";
import { companiesService } from "../services/company.service";
import { getAccessToken } from "../services/auth-token.service";
import {
  Button,
  Image,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  Tab,
  Avatar,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Badge,
  Chip,
} from "@nextui-org/react";
import "leaflet/dist/leaflet.css";

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isLoggedIn = !!getAccessToken();

  const [event, setEvent] = useState(null);
  const [companyEvents, setCompanyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [IsSelectedMap, setIsSelectedMap] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [parentCommentId, setParentCommentId] = useState(null);
  const [promocode, setPromocode] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketCheckLoading, setTicketCheckLoading] = useState(true);

  const mapUrl = IsSelectedMap
    ? "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
    : theme === "dark"
      ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    fetchEventData();
    if (isLoggedIn) {
      checkTicket();
    } else {
      setTicketCheckLoading(false);
    }
  }, [id, isLoggedIn]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getById(id);
      setEvent(response.data);

      if (response.data.Company?.id) {
        fetchCompanyEvents(response.data.Company.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyEvents = async (companyId) => {
    try {
      const response = await companiesService.getCompanyEvents(companyId, {
        status: "PUBLISHED",
      });
      const otherEvents = response.data.data.filter((e) => e.id !== id);
      setCompanyEvents(otherEvents);
    } catch (err) {
      console.error("Failed to load company events:", err);
    }
  };

  const checkTicket = async () => {
    try {
      setTicketCheckLoading(true);
      const tickets = await ticketsService.getUserTickets();
      const hasEventTicket = tickets.some(
        (ticket) => ticket.eventId === id && ticket.status === "ACTIVE"
      );
      setHasTicket(hasEventTicket);
    } catch (err) {
      console.error("Failed to check ticket:", err);
    } finally {
      setTicketCheckLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateComment = async () => {
    try {
      await commentsService.createComment({
        content: newCommentContent,
        eventId: id,
        parentId: parentCommentId,
      });
      setNewCommentContent("");
      setParentCommentId(null);
      fetchEventData();
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  const handleReply = (commentId) => {
    setParentCommentId(parentCommentId === commentId ? null : commentId);
  };

  const renderComments = (comments) => {
    if (!comments || comments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      );
    }

    return comments.map((comment) => (
      <Card
        key={comment.id}
        className={`${comment.parentId ? "ml-10" : ""} mb-4`}
      >
        <CardHeader className="flex gap-3">
          <Avatar src={comment.user.avatarUrl || "/default-avatar.png"} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-medium">{comment.user.name}</p>
              <span className="text-tiny text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {isLoggedIn && (
              <Button
                size="sm"
                variant="light"
                onPress={() => handleReply(comment.id)}
                color={parentCommentId === comment.id ? "primary" : "default"}
                className="justify-start px-0"
              >
                Reply
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm">{comment.content}</p>
        </CardBody>
      </Card>
    ));
  };

  const handlePurchaseTicket = async () => {
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);

      console.log("Initiating ticket purchase for event:", id);
      console.log("With promocode:", promocode || "none");

      const response = await ticketsService.initiateTicketPurchase(
        id,
        promocode || undefined
      );

      console.log("Checkout response:", response);

      if (!response || !response.url) {
        throw new Error("Invalid response from server");
      }

      window.location.href = response.url;
    } catch (err) {
      console.error("Purchase error details:", err);

      let errorMessage = "Failed to process purchase";
      if (err.response) {
        console.log("Error response:", err.response);
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }

      setPurchaseError(errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const testCardInfo = {
    number: "4242 4242 4242 4242",
    expiry: "Any future date",
    cvc: "Any 3 digits",
  };

  const EventCard = ({ event }) => (
    <Card
      isPressable
      onPress={() => navigate(`/event/${event.id}`)}
      className="overflow-hidden"
    >
      <div className="relative">
        {event.imagesUrls?.length > 0 ? (
          <Image
            src={event.imagesUrls[0]}
            alt={event.title}
            width="100%"
            height={140}
            radius="none"
            className="object-cover w-full h-36"
          />
        ) : (
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 h-36 w-full" />
        )}
        <div className="absolute top-2 right-2">
          <Chip color="primary" size="sm">
            ${event.price}
          </Chip>
        </div>
      </div>

      <CardBody className="p-3">
        <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
        <p className="text-sm line-clamp-2 mt-2">{event.description}</p>
      </CardBody>

      <CardFooter className="flex justify-between items-center p-3 pt-0">
        <Chip size="sm" variant="flat">
          {event.format}
        </Chip>
        <span className="text-xs">{event.location}</span>
      </CardFooter>
    </Card>
  );

  if (loading)
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );

  if (error)
    return (
      <DefaultLayout>
        <div className="text-center text-red-500">
          Error loading event: {error}
        </div>
      </DefaultLayout>
    );

  if (!event) return null;

  return (
    <DefaultLayout>
      {/* Purchase Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Purchase Ticket</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">${event.price}</span>
                  </div>

                  <Input
                    label="Promocode"
                    placeholder="Enter your promocode (optional)"
                    value={promocode}
                    onValueChange={setPromocode}
                  />

                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <p className="font-semibold mb-1">Test Card Details:</p>
                    <p>Number: {testCardInfo.number}</p>
                    <p>Expiry: {testCardInfo.expiry}</p>
                    <p>CVC: {testCardInfo.cvc}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is a test mode - no real charges will be made
                    </p>
                  </div>

                  {purchaseError && (
                    <div className="text-danger text-sm">{purchaseError}</div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={purchaseLoading}
                  onPress={handlePurchaseTicket}
                >
                  Proceed to Payment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Hero section */}
      <div className="relative">
        {event.imagesUrls?.length > 0 ? (
          <div className="w-full h-64 md:h-96 relative overflow-hidden rounded-lg">
            <Image
              src={event.imagesUrls[0]}
              alt={event.title}
              width="100%"
              height="100%"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 rounded-lg" />
        )}

        <div className="container mx-auto px-4 relative -mt-16 z-10">
          <Card className="p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Chip variant="flat" color="primary">
                    {event.format}
                  </Chip>
                  <Chip variant="flat">{event.theme}</Chip>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold">${event.price}</span>
                {isLoggedIn ? (
                  <>
                    {ticketCheckLoading ? (
                      <Spinner size="sm" />
                    ) : hasTicket ? (
                      <div className="flex items-center gap-2 text-success mt-2">
                        <span>You have a ticket</span>
                      </div>
                    ) : (
                      <Button color="primary" onPress={onOpen} className="mt-2">
                        Buy Ticket
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    color="primary"
                    onPress={() => navigate("/login")}
                    className="mt-2"
                  >
                    Login to buy ticket
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-10 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About This Event</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <Card className="p-4 h-fit">
            <CardBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-default-500">Date:</span>
                  <span className="font-semibold">
                    {formatDate(event.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-default-500">Location:</span>
                  <span className="font-semibold">{event.location}</span>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-center gap-2">
                    <span className="text-default-500">Max Attendees:</span>
                    <span className="font-semibold">{event.maxAttendees}</span>
                  </div>
                )}
                {event._count && (
                  <div className="flex items-center gap-2">
                    <span className="text-default-500">Tickets Sold:</span>
                    <span className="font-semibold">
                      {event._count.attendees}
                      {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                    </span>
                  </div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-2">
                    <span className="text-default-500">Organizer:</span>
                    <span
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${event.organizer.id}`)}
                    >
                      {event.organizer.name}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {event.coordinates && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Location</h2>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={[
                  event.coordinates.latitude,
                  event.coordinates.longitude,
                ]}
                zoom={13}
                className="h-full"
              >
                <TileLayer url={mapUrl} />
                <Marker
                  position={[
                    event.coordinates.latitude,
                    event.coordinates.longitude,
                  ]}
                >
                  <Popup>{event.location}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        <Tabs aria-label="Event tabs" className="mt-8">
          {!event.isAttendeesHidden && (
            <Tab key="attendees" title="Attendees">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {event.attendees && event.attendees.length > 0 ? (
                  event.attendees.map((attendee) => (
                    <Card key={attendee.user.id} isPressable className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={attendee.user.avatarUrl || "/default-avatar.png"}
                        />
                        <p>{attendee.user.name}</p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No attendees yet
                  </div>
                )}
              </div>
            </Tab>
          )}

          <Tab key="comments" title="Comments">
            <div className="flex flex-col gap-6 mt-4">
              {event.comments && renderComments(event.comments)}

              {isLoggedIn ? (
                <div className="flex flex-col gap-4 mt-4">
                  <Textarea
                    label="Add a comment"
                    placeholder="Write your comment here..."
                    value={newCommentContent}
                    onValueChange={setNewCommentContent}
                  />
                  <Button
                    color="primary"
                    onPress={handleCreateComment}
                    disabled={!newCommentContent.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-2">Login to leave comments</p>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </Tab>

          {event.similarEvents && event.similarEvents.length > 0 && (
            <Tab key="similar" title="Similar Events">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                {event.similarEvents.map((similarEvent) => (
                  <EventCard key={similarEvent.id} event={similarEvent} />
                ))}
              </div>
            </Tab>
          )}

          {companyEvents.length > 0 && (
            <Tab key="companyEvents" title="More from this Company">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                {companyEvents.map((companyEvent) => (
                  <EventCard key={companyEvent.id} event={companyEvent} />
                ))}
              </div>
            </Tab>
          )}

          {event.Company && (
            <Tab key="company" title="About Organizer">
              <div className="mt-4">
                <Card
                  className="p-6"
                  isPressable
                  onPress={() => navigate(`/company/${event.Company.id}`)}
                  role="button"
                >
                  <CardHeader className="flex gap-4 px-0 pt-0">
                    {event.Company.logoUrl && (
                      <Image
                        src={event.Company.logoUrl}
                        alt={event.Company.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {event.Company.name}
                      </h2>
                      <p className="text-gray-600">{event.Company.email}</p>
                      {event.Company.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          {event.Company.location}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody className="px-0">
                    <p>{event.Company.description}</p>
                  </CardBody>
                  <CardFooter className="px-0 pb-0">
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      onPress={() => navigate(`/company/${event.Company.id}`)}
                    >
                      View Company Profile
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </Tab>
          )}
        </Tabs>
      </section>
    </DefaultLayout>
  );
}

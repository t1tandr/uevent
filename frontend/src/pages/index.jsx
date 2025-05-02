import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Image,
  CardBody,
  Autocomplete,
  AutocompleteItem,
  Divider,
  Chip,
  Spinner,
  Input,
} from "@nextui-org/react";
import DefaultLayout from "../layouts/default";
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards";
import { useNavigate } from "react-router-dom";
import { eventsService } from "../services/event.service";
import { filtersService } from "../services/filters.service";
import { subscribersService } from "../services/subscribe.service";
import { getAccessToken } from "../services/auth-token.service";

const sorts = [
  { label: "Date (newest first)", value: "date_desc" },
  { label: "Date (oldest first)", value: "date_asc" },
  { label: "Price (low to high)", value: "price_asc" },
  { label: "Price (high to low)", value: "price_desc" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
];

export default function IndexPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();

  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [subscribedCompanies, setSubscribedCompanies] = useState([]);
  const [companyEvents, setCompanyEvents] = useState([]);
  const [formats, setFormats] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSort, setSelectedSort] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [formatsData, themesData] = await Promise.all([
          filtersService.getFormats(),
          filtersService.getThemes(),
        ]);

        console.log("Formats from API:", formatsData);
        console.log("Themes from API:", themesData);

        setFormats(formatsData || []);
        setThemes(themesData || []);

        const featuredResponse = await eventsService.searchEvents(
          {},
          {
            page: 1,
            limit: 5,
            sortBy: "date",
            sortOrder: "desc",
          }
        );

        let featuredData = [];
        if (Array.isArray(featuredResponse.data)) {
          featuredData = featuredResponse.data;
        } else if (
          featuredResponse.data &&
          Array.isArray(featuredResponse.data.items)
        ) {
          featuredData = featuredResponse.data.items;
        } else if (
          featuredResponse.data &&
          Array.isArray(featuredResponse.data.data)
        ) {
          featuredData = featuredResponse.data.data;
        }

        setFeaturedEvents(featuredData || []);

        if (isLoggedIn) {
          try {
            const userSubscriptions =
              await subscribersService.getUserSubscriptions();
            setSubscribedCompanies(userSubscriptions.data || []);

            if (userSubscriptions.data?.length > 0) {
              const companyIds = userSubscriptions.data.map(
                (sub) => sub.companyId
              );
              const companyEventsPromises = companyIds.map((id) =>
                eventsService
                  .getCompanyEvents(id, { status: "PUBLISHED" })
                  .catch(() => ({ data: { items: [] } }))
              );

              const companyEventsResults = await Promise.all(
                companyEventsPromises
              );

              const allCompanyEvents = companyEventsResults
                .flatMap((res) => res.data?.items || [])
                .filter(Boolean);

              setCompanyEvents(allCompanyEvents);
            }
          } catch (err) {
            console.error("Error fetching subscriptions:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchEvents();
  }, [isLoggedIn]);

  const fetchEvents = async (resetPage = true) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }

      const [sortField, sortOrder] = selectedSort
        ? selectedSort.split("_")
        : ["date", "desc"];

      const params = {
        page: currentPage,
        limit: 8,
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      if (selectedFormat) params.format = selectedFormat;
      if (selectedTheme) params.theme = selectedTheme;
      if (searchQuery) params.search = searchQuery;

      console.log("Fetching events with params:", params);

      const response = await eventsService.searchEvents({}, params);
      console.log("API response:", response);

      let newEvents = [];
      let metaInfo = {};

      if (Array.isArray(response.data)) {
        newEvents = response.data;
        metaInfo = response.meta || {};
      } else if (response.data && Array.isArray(response.data.items)) {
        newEvents = response.data.items;
        metaInfo = response.data.meta || {};
      } else if (response.data && Array.isArray(response.data.data)) {
        newEvents = response.data.data;
        metaInfo = response.data.meta || {};
      } else if (response.data) {
        newEvents = response.data;
        metaInfo = response.meta || {};
      }

      setEvents(resetPage ? newEvents : [...events, ...newEvents]);
      setHasMore(metaInfo.hasNextPage === true);
      setPage(currentPage + 1);

      console.log("Processed events:", newEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedFormat, selectedTheme, selectedSort]);

  const handleSearch = () => {
    fetchEvents();
  };

  const handleLoadMore = () => {
    fetchEvents(false);
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

  const EventCard = ({ event }) => (
    <Card
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

        <CardHeader className="flex flex-col items-start z-10">
          <div className="flex justify-between w-full items-center">
            <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">
              {event.title}
            </h2>
            <Chip size="sm" color="primary">
              ${event.price}
            </Chip>
          </div>
          <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
          {event.format && (
            <Chip size="sm" className="mt-2" variant="flat">
              {event.format}
            </Chip>
          )}
        </CardHeader>

        {event.imagesUrls?.[0] && (
          <CardBody className="z-10">
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

        <CardFooter className="z-10">
          <div className="flex flex-col gap-2 w-full">
            <p className="dark:text-white/60 text-black/60 line-clamp-2 text-sm">
              {event.description}
            </p>
            <div className="flex justify-between items-center w-full mt-2">
              <span className="text-xs text-gray-500">{event.location}</span>
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
  );

  if (loading && events.length === 0) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-10 py-8 md:py-10">
        {/* Featured events carousel */}
        {/* {featuredEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
            <InfiniteMovingCards
              items={featuredEvents}
              direction="right"
              speed="slow"
              renderItem={(event) => (
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm">{formatDate(event.date)}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              )}
            />
          </div>
        )} */}

        <Divider />

        {/* Subscribed companies events */}
        {isLoggedIn && companyEvents.length > 0 && (
          <>
            <h1 className="text-3xl font-bold">
              Events from your subscriptions
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {companyEvents.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {companyEvents.length > 4 && (
              <div className="flex justify-center">
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => navigate("/subscriptions")}
                >
                  See all events from your subscriptions
                </Button>
              </div>
            )}

            <Divider />
          </>
        )}

        {/* All events with filters */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold">Upcoming events</h1>

          <div className="flex flex-row items-center gap-4 flex-wrap">
            <div className="flex-1 md:min-w-[200px]">
              <Input
                label="Search events"
                placeholder="Search by title, description or location"
                value={searchQuery}
                onValueChange={setSearchQuery}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Исправленный селектор Format */}
            <Autocomplete
              defaultItems={formats}
              label="Format"
              placeholder="Any format"
              selectedKey={selectedFormat}
              onSelectionChange={setSelectedFormat}
              className="flex-1 md:min-w-[180px]"
            >
              {(item) => (
                <AutocompleteItem key={item.id} textValue={item.label}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Исправленный селектор Theme */}
            <Autocomplete
              defaultItems={themes}
              label="Theme"
              placeholder="Any theme"
              selectedKey={selectedTheme}
              onSelectionChange={setSelectedTheme}
              className="flex-1 md:min-w-[180px]"
            >
              {(item) => (
                <AutocompleteItem key={item.id} textValue={item.label}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              defaultItems={sorts}
              label="Sort by"
              placeholder="Sort by..."
              selectedKey={selectedSort}
              onSelectionChange={setSelectedSort}
              className="flex-1 md:min-w-[180px]"
            >
              {(sort) => (
                <AutocompleteItem key={sort.value} textValue={sort.label}>
                  {sort.label}
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Button color="primary" onPress={handleSearch} className="self-end">
              Search
            </Button>
          </div>

          {events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button
                    color="primary"
                    variant="light"
                    onPress={handleLoadMore}
                    isLoading={loading}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">
                {error ||
                  "No events match your criteria. Try changing filters or check back later."}
              </p>
              {error && (
                <Button color="primary" className="mt-4" onPress={handleSearch}>
                  Try Again
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}

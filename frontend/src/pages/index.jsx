import { Link, Card, CardHeader, CardFooter, Button, Image, CardBody, Autocomplete, AutocompleteItem, Divider } from "@heroui/react";

import { useState, useEffect } from "react";
import DefaultLayout from "../layouts/default";
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards";
import { useNavigate } from "react-router-dom";

const dataTest = [
  {id: 1, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  {id: 2, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  {id: 3, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  {id: 4, title: "Breathing App", description: "Get a good night's sleep." }
];

const formats = [
  { label: "Conferences", key: "conferences" },
  { label: "Lecture", key: "lecture" },
  { label: "Workshop", key: "workshop" }
];

const sorts = [
  { label: "Date", key: "date" },
  { label: "Title", key: "title" },
  { label: "Description", key: "description" }
]

const themes1 = [
  { label: "Cat", key: "cat"},
  { label: "Dog", key: "dog"},
  { label: "Elephant", key: "elephant"}
];

export default function IndexPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [themes, setThemes] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSort, setSelectedSort] = useState(null);

  useEffect(() => {
    setData(dataTest);
    setThemes(themes1)
  }, [selectedFormat, selectedTheme]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-10 py-8 md:py-10">
        <InfiniteMovingCards
          items={dataTest}
          direction="right"
          speed="slow"
        />
        <Divider/>
        <h1 className="text-4xl font-bold">Upcoming events</h1>
        <div className="flex flex-row items-start gap-4 md:w-1/2">
          <Autocomplete
            defaultItems={formats}
            label="Filter by format"
            placeholder="Search an format"
            selectedKey={selectedFormat}
            onSelectionChange={setSelectedFormat}
          >
            {(format) => <AutocompleteItem key={format.key}>{format.label}</AutocompleteItem>}
          </Autocomplete>
          <Autocomplete
            defaultItems={themes || []}
            label="Filter by theme"
            placeholder="Search an theme"
            selectedKey={selectedTheme}
            onSelectionChange={setSelectedTheme}
          >
            {(theme) => <AutocompleteItem key={theme.key}>{theme.label}</AutocompleteItem>}
          </Autocomplete>
          <Autocomplete
            defaultItems={sorts}
            label="Sort by"
            selectedKey={selectedSort}
            onSelectionChange={setSelectedSort}
          >
            {(sort) => <AutocompleteItem key={sort.key}>{sort.label}</AutocompleteItem>}
          </Autocomplete>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      </section>
    </DefaultLayout>
  );
}

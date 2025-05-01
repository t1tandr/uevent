import {
  Button,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Tab,
  Tabs,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Textarea,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import DefaultLayout from "../layouts/default";
import { FileUpload } from "../components/ui/file-upload";
import { useNavigate } from "react-router-dom";

const dataTest = [
  {
    id: 1,
    title: "Breathing App",
    description: "Get a good night's sleep.",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080",
  },
  {
    id: 2,
    title: "Breathing App",
    description: "Get a good night's sleep.",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080",
  },
  {
    id: 3,
    title: "Breathing App",
    description: "Get a good night's sleep.",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080",
  },
  {
    id: 4,
    title: "Breathing App",
    description: "Get a good night's sleep.",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080",
  },
];

const CompanyData = {
  name: "John Doe",
  email: "eege@gmail.com",
  location: "New York, USA",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  website: "https://example.com",
  phone: "+1 (555) 555-5555",
  folow: false,
  avatar:
    "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [company, setCompany] = useState(null);

  const handleFollowUnfollow = () => {
    setCompany((prev) => ({
      ...prev,
      folow: !prev.folow,
    }));
  };

  useEffect(() => {
    setData(dataTest);
    setCompany(CompanyData);
  }, []);

  return (
    <DefaultLayout>
      <div className="min-h-screen flex flex-col gap-5">
        {company && (
          <div className="flex flex-col justify-start gap-4 p-4 bg-zinc-600/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <div className="relative">
              <img
                className="absolute top-0 left-0 w-full h-full object-cover blur-lg opacity-20"
                src={company.avatar}
              />
              <div className="flex flex-col gap-4">
                <div className="flex justify-center items-center">
                  <Image
                    isBlurred
                    className="w-[25vh] h-[25vh] object-cover rounded-md"
                    src={company.avatar}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl">{company.name}</h2>
                  <h2 className="text-lg">
                    <span className="text-xl text-black dark:text-white">
                      Email:
                    </span>{" "}
                    {company.email}
                  </h2>
                  <h2 className="text-lg">
                    <span className="text-xl text-black dark:text-white">
                      Location:
                    </span>{" "}
                    {company.location}
                  </h2>
                  <h2 className="text-lg text-gray-400">
                    <span className="text-xl text-black dark:text-white">
                      Description:
                    </span>{" "}
                    {company.description}
                  </h2>
                  <h2 className="text-lg text-gray-400">
                    <span className="text-xl text-black dark:text-white">
                      Website:
                    </span>{" "}
                    {company.website}
                  </h2>
                  <h2 className="text-lg text-gray-400">
                    <span className="text-xl text-black dark:text-white">
                      Phone:
                    </span>{" "}
                    {company.phone}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}
        <Button
          className="bg-purple-500"
          onPress={() => handleFollowUnfollow()}
        >
          {company.folow ? "Unfollow the company" : "Follow the company"}
        </Button>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data &&
              data.map((post, index) => (
                <Card key={index} className="flex-grow w-full group/card">
                  <div
                    onClick={() => navigate(`/event/${post.id}`)}
                    className={
                      "cursor-pointer overflow-hidden relative rounded-md shadow-xl max-w-sm mx-auto flex flex-col justify-between p-4"
                    }
                  >
                    <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-gray-400 dark:group-hover/card:bg-black opacity-60"></div>
                    <img
                      className="absolute top-0 left-0 w-full h-full object-contain blur-lg opacity-20"
                      src={post.image}
                    />
                    <CardHeader>
                      <h2 className="dark:text-white/90 text-black/90 font-medium text-xl">
                        {post.title}
                      </h2>
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
                      <div className="flex flex-grow gap-2 items-center">
                        <p className="dark:text-white/60 text-black/60">
                          {post.description}
                        </p>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

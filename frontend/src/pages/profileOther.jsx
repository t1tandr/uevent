import { Card, CardHeader, CardFooter, Image, CardBody, Divider } from "@heroui/react";
import { useState, useEffect } from "react";
import DefaultLayout from "../layouts/default";
import { useNavigate } from "react-router-dom";

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);



  useEffect(() => {
    setData(dataTest);
    setUser(userData);
  }, []);

  return (
    <DefaultLayout>
      <div className="min-h-screen flex flex-col justify-between">
        <div className="flex flex-col gap-6 flex-grow">
          {user && (
            <div className="flex flex-row justify-between gap-4 text-2xl p-4 bg-zinc-600/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              < div className="flex flex-row justify-center items-center gap-4">
                <Image isBlurred className="w-[20vh] h-[20vh] object-cover rounded-md" src={user.avatar} />
                <div className="flex flex-col gap-2">
                  <h2>{user.name}</h2>
                  <h2 className="text-bold text-xl">{user.email}</h2>
                </div>
              </div>
            </div>
          )}
          <div className="h-[1vh]"></div>
          <div className="w-full flex justify-center items-center">
            <p className="text-2xl md:text-4xl">Events</p>
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
        </div>
      </div>
    </DefaultLayout >
  );
}

import { Button, Image, Spinner, Card, CardHeader, CardBody, CardFooter, Switch, Tabs, Tab, Avatar, Textarea, Modal, ModalBody, ModalHeader, ModalFooter, Divider, useDisclosure, ModalContent, Input } from "@heroui/react";
import { useState, useEffect } from "react";
import DefaultLayout from "../layouts/default";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { useTheme } from "next-themes";

const dataTest =
{
  author: "John Doe",
  authorInfo: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  location: [51.505, -0.09],
  date: "2023-10-01",
  visitors: 50,
  price: 100,
  title: "Breathing App",
  description: "Get a good night's sleep. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
};

const dataTest2 = [
  { id: 1, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 2, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 3, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 4, title: "Breathing App", description: "Get a good night's sleep." }
];

const relevantData = [
  { id: 1, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 2, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
  { id: 3, title: "Breathing App", description: "Get a good night's sleep.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJsdXUlMjBzaWxlbnxlbnwwfHx8fDE2OTI3NTY5NzE&ixlib=rb-4.0.3&q=80&w=1080" },
];

const userData = [
  { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  { id: 2, name: "Jane Doe", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  { id: 3, name: "John Smith", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  { id: 4, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" }
];

const commentsData = [
  { id: 1, name: "John Doe", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { parent_comment: 1, id: 2, name: "Jane Doe", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: 3, name: "John Smith", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: 4, name: "Jane Smith", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }
];

const organizationData = {
  name: "nexo",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  folow: true
}

export default function EventPage() {
  const { theme, setTheme } = useTheme();
  const [post, setPost] = useState(null);
  const [data, setData] = useState(null);
  const [users, setUsers] = useState(null);
  const [IsSelectedMap, setIsSelectedMap] = useState(false);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [parentComment, setParentComment] = useState(null);
  const [userComment, setUserComment] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [relevant, setRelevant] = useState(null);
  const [promocode, setPromocode] = useState(null);
  const navigate = useNavigate();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { id } = useParams();
  const mapUrl = IsSelectedMap ? "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png" :
    theme === "dark"
      ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    setPost(dataTest);
    setData(dataTest2);
    setUsers(userData);
    setComments(commentsData);
    setOrganization(organizationData);
    setRelevant(relevantData);
  }, []);

  const handleFollowUnfollow = () => {
    setOrganization((prev) => ({
      ...prev,
      folow: !prev.folow
    }));
  }

  const handlePayment = async (type) => {
    if (type === "with") {

    } else {

    }
  }

  const handleCreateComment = async () => {
    try {
      parentComment === null ? await axiosConfigurated.post('/posts/' + id + '/comments', { content: newCommentContent }) :
        await axiosConfigurated.post('/posts/' + id + '/comments', { content: newCommentContent, parent_comment: parentComment });
      setNewCommentContent('');
      //updateComments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReply = (commentId) => {
    console.log(commentId);
    if (parentComment === commentId) {
      setParentComment(null);
      return;
    }
    setParentComment(commentId);
  }

  const updateComments = () => {
    axiosConfigurated.get('/posts/' + id + '/comments').then(async (response) => {
      setComments(response.data);
      const comments = response.data;

      const userPromises = comments.map(comment => getUserData(comment.author));
      const users = await Promise.all(userPromises);
      const userMap = users.reduce((acc, user, i) => {
        acc[comments[i].author] = user.data;
        return acc;
      }, {});

      setUserComment(userMap);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  const commentRes = () => {
    const commentWithReplies = {};
    const commentResult = [];

    comments.forEach((comment) => {
      commentWithReplies[comment.id] = { ...comment, subComments: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent_comment) {
        commentWithReplies[comment.parent_comment]?.subComments.push(commentWithReplies[comment.id]);
      } else {
        commentResult.push(commentWithReplies[comment.id]);
      }
    });

    return commentResult;
  }

  const renderComments = (comments) => {
    return comments.map((comment) => {
      /*       const user = userData[comment.author];
            if (!user) {
              return <Spinner key={comment.id} />;
            } */
      return (
        <Card className={`ml-${comment.parent_comment ? 20 : 0} p-4`}>
          <div className="flex flex-row gap-2">
            {/* <Avatar src={user.avatar} />
            <p size="lg">{user.login}</p> */}
            <Button onPress={() => handleReply(comment.id)} size="sm" className={`${parentComment === comment.id ? 'bg-purple-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}>Reply</Button>
          </div>
          <p className="text-gray-500">{comment.content}</p>
          {comment.subComments.length > 0 && (
            <div className="flex flex-col gap-5" style={{ marginTop: 10 }}>
              {renderComments(comment.subComments)}
            </div>
          )}
        </Card>
      );
    });
  }

  const usersCard = () => {
    return (users && users.map((user, index) => (
      <Card key={index} isPressable onPress={() => navigate(`/profile/${user.id}`)} className="flex flex-row w-full justify-start items-center gap-4 p-1">
        <img
          src={user.avatar}
          alt="Background blur"
          className="absolute top-0 left-0 w-full h-full object-contain blur-lg opacity-20"
        />
        <Avatar size="lg" src={user.avatar} />
        <h1>{user.name}</h1>
      </Card>
    )))
  };

  const card = () => {
    return (data && data.map((post, index) => (
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
    )))
  };

  const cardRelevant = () => {
    return (relevant && relevant.map((post, index) => (
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
    )))
  };

  const modal = () => {
    return (<Modal isOpen={isOpen} backdrop="blur" placement="center" onOpenChange={onOpenChange} className="z-50">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
            <ModalBody>
              <p>Do you have a promo code? If so, enter it below</p>
              <Input label="Promocode" placeholder="Enter your promocode" value={promocode} onValueChange={setPromocode} />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cansel
              </Button>
              <Button onPress={() => handlePayment()}>
                Skip
              </Button>
              <Button color="primary" onPress={() => handlePayment("with")}>
                Accept
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    )
  }

  if (!post) {
    return (
      <DefaultLayout>
        <Spinner />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {modal()}
      <section className="flex flex-col gap-10">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl md:text-4xl font-bold">{post.title}</h1>
          <h3 className="text-xl md:text-2xl">{post.date}</h3>
        </div>
        {post.image && <div className="relative">
          <div className="absolute inset-0 bg-center blur-md" style={{ backgroundImage: `url(${post?.image})` }} />
          <div className="rounded-lg overflow-hidden flex justify-center items-center">
            <Image
              isBlurred
              className="h-[50vh]"
              src={post?.image}
              alt={post.title}
              loading="lazy"
            />
          </div>
        </div>}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row gap-4 justify-between">
            <p className="text-2xl md:text-4xl">{post.price}$</p>
            <div className="flex flex-row gap-4">
              <Button className="bg-primary" onPress={onOpen}>Buy</Button>
              <Button onPress={() => handleFollowUnfollow()}>{organization.folow ? "Unfollow the company" : "Follow the company"}</Button>
            </div>
          </div>
          <div className="w-full">
            <p className="text-gray-500">{post.description}</p>
          </div>
          <div className="w-full relative">
            <div className="absolute top-2 right-2 z-[10] flex bg-white/50 dark:bg-black/50 rounded-md p-2">
              <Switch isSelected={IsSelectedMap} onValueChange={setIsSelectedMap}><span className="text-black dark:text-white">Color map</span></Switch>
            </div>
            <MapContainer center={post.location} scrollWheelZoom={false} zoom={13} className="z-[-10]" style={{ height: "25vh" }}>
              <TileLayer
                url={mapUrl}
              />
              <Marker position={post.location}>
                <Popup>
                  {post.location}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
        <Tabs size="lg" className="w-full" defaultSelectedKey="Comments">
          <Tab key="about_organization" title="About the organization">
            <div className="flex flex-col gap-4">
              <p className="text-gray-500">{organization.description}</p>
              <p className="text-xl md:text-2xl">Other event organization</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {card()}
              </div>
            </div>
          </Tab>
          <Tab key="visitors" title="Visitors">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {usersCard()}
            </div>
          </Tab>
          <Tab key="comments" title="Comments">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                {renderComments(commentRes())}
              </div>
              <div className="flex flex-col gap-3">
                <Textarea label="Comment" placeholder="Enter your comment" value={newCommentContent} onValueChange={setNewCommentContent} />
                <div className="flex items-end justify-start">
                  <Button>Post</Button>
                </div>
              </div>
            </div>
          </Tab>
          <Tab key="relevant" title="Relevant events">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cardRelevant()}
            </div>
          </Tab>
        </Tabs>
      </section>
    </DefaultLayout>
  );
}

import { Link } from "@heroui/link";
import { User } from "@heroui/user";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { ThemeSwitch } from "../components/theme-switch";
import { useEffect, useState } from "react";

const userInfo = {
  name: "John Doe",
  avatar: "https://example.com/avatar.jpg"
}

export const Navbar = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(userInfo);
  }, []);

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/">
            <p className="font-bold text-inherit">Uevent</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          <NavbarItem key={1}>
            <Link
              color="foreground" href="/">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem key={2}>
            <Link
              color="foreground" href="/">
              Company
            </Link>
          </NavbarItem>
          <NavbarItem key={3}>
            <Link
              color="foreground" href="/">
              New event
            </Link>
          </NavbarItem>
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
          {user && (
            <Link href="/profile">
              <User name={user.name} avatarProps={{ src: user.avatar }} className="hidden sm:flex" />
            </Link>
          )}
        </NavbarItem>

      </NavbarContent>
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <NavbarMenuItem key={1}>
            <Link
              href="/"
              size="lg"
            >
              Home
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key={2}>
            <Link
              href="/"
              size="lg"
            >
              Company
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key={3}>
            <Link
              href="/"
              size="lg"
            >
              New event
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key={4}>
            <Link
              href="/profile"
              size="lg"
            >
              Profile
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};

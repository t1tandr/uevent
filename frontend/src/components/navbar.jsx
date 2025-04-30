import { Link } from "@heroui/link";
import { User } from "@heroui/user";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from "@heroui/navbar";
import { useSelector } from "react-redux";
import { ThemeSwitch } from "../components/theme-switch";
import { useEffect, useState } from "react";

const userInfo = {
  name: "John Doe",
  avatar: "https://example.com/avatar.jpg"
}

export const Navbar = () => {
  const user = useSelector((state) => state.auth);
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
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-5">
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
        {user && (
          <Link href="/profile">
            <User name={user.name} avatarProps={{ src: user.avatar }} className="sm:flex" />
          </Link>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

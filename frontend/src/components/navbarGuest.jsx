import { Link } from "@heroui/link";
import { User } from "@heroui/user";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from "@heroui/navbar";
import { ThemeSwitch } from "./theme-switch";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

const userInfo = {
  name: "John Doe",
  avatar: "https://example.com/avatar.jpg"
}

export const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-5">
          <ThemeSwitch />
          <Button className="ml-2" onPress={() => {navigate("/login")}}>Sign in</Button>
          <Button variant="outline" className="ml-2" onPress={() => {navigate("/register")}}>Sign up</Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <Button>Sign in</Button>
        <Button variant="outline" className="ml-2">Sign up</Button>
      </NavbarContent>
    </HeroUINavbar>
  );
};

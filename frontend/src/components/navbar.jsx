import { Link } from "@heroui/link";
import { User } from "@heroui/user";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { useSelector } from "react-redux";
import { ThemeSwitch } from "../components/theme-switch";
import { useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit">Uevent</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-5">
          <ThemeSwitch />
          {isAuthenticated && user ? (
            <Link href="/profile">
              <User
                name={user.name}
                avatarProps={{
                  src: user.avatarUrl || "/default-avatar.png",
                }}
                className="hidden sm:flex"
              />
            </Link>
          ) : (
            !isAuthPage && (
              <div className="flex gap-2">
                <Button size="sm" onPress={() => navigate("/login")}>
                  Sign in
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => navigate("/register")}
                >
                  Sign up
                </Button>
              </div>
            )
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {isAuthenticated && user ? (
          <Link href="/profile">
            <User
              name={user.name}
              avatarProps={{
                src: user.avatarUrl || "/default-avatar.png",
              }}
              className="sm:flex"
            />
          </Link>
        ) : (
          !isAuthPage && (
            <Button size="sm" onPress={() => navigate("/login")}>
              Sign in
            </Button>
          )
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

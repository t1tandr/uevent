import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background.jsx";
import React from "react";
import { Form, Input, Link, Button } from "@heroui/react";
import LogLayout from "../layouts/log.jsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import IconGoogle from "../icons/icons8-google.svg?react";
import { authService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Login() {
  const { err, setErr } = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(data);
      navigate("/"); // Redirect to home page after successful login
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google/login";
  };

  // Handle Google OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");

    if (accessToken) {
      const handleGoogleCallback = async () => {
        try {
          setIsLoading(true);
          await authService.googleAuth(accessToken);
          navigate("/");
        } catch (err) {
          setError("Google login failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      handleGoogleCallback();
    }
  }, [navigate]);

  return (
    <AuroraBackground>
      <LogLayout>
        <motion.div
          className="flex flex-row items-center justify-center w-full h-full"
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <div className="md:w-1/2 items-center justify-center flex">
            <div className="flex flex-col bg-gray-200 dark:bg-black gap-10 bg-opacity-50 dark:bg-opacity-50 rounded-lg lg:w-2/3 p-10 w-full">
              <h1 className="text-4xl font-bold text-center text-default-900">
                Log in
              </h1>
              <Form
                className="mx-auto w-full gap-5"
                validationErrors={errors}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Input
                  {...register("email")}
                  isRequired
                  errorMessage={errors.email?.message}
                  isInvalid={!!errors.email}
                  label="Email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  disabled={isLoading}
                />

                <Input
                  {...register("password")}
                  isRequired
                  errorMessage={errors.password?.message}
                  isInvalid={!!errors.password}
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  disabled={isLoading}
                />

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex flex-col gap-4 w-full">
                  <Button
                    className="w-full"
                    color="primary"
                    type="submit"
                    isDisabled={!isValid || isLoading}
                    isLoading={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                  <Button
                    onPress={handleGoogleLogin}
                    startContent={<IconGoogle />}
                    className="google-login-button bg-blue-700 color-white"
                    isDisabled={isLoading}
                  >
                    Login with Google
                  </Button>
                </div>
              </Form>

              <div className="flex flex-col items-center justify-between">
                <Link
                  href="/register"
                  className="text-primary"
                >
                  Don't have an account? Sign up
                </Link>
                <Link
                  href="/forgot-password"
                  className="text-black dark:text-white"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex w-1/2 items-center justify-center">
            <div className="w-2/3 bg-gray-200 dark:bg-black bg-opacity-50 dark:bg-opacity-50 rounded-lg p-10">
              <p className="text-6xl xl:text-8xl font-extrabold text-primary font-open">
                Uevent
              </p>
              <p className="text-black dark:text-white">
                Find interesting events
              </p>
              <p className="text-black dark:text-white">
                Find out which friends are attending them
              </p>
              <p className="text-black dark:text-white">
                Connect with like-minded people
              </p>
            </div>
          </div>
        </motion.div>
      </LogLayout>
    </AuroraBackground>
  );
}

import Cookies from "js-cookie";

export const EnumTokens = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

export const getAccessToken = () => {
  const token = Cookies.get("accessToken");
  return token;
};

export const saveTokenStorage = (accessToken) => {
  Cookies.set("accessToken", accessToken, {
    expires: 1,
    path: "/",
    sameSite: "strict",
  });
};

export const removeFromStorage = () => {
  Cookies.remove(EnumTokens.ACCESS_TOKEN);
};

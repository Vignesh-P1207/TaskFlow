import client from "./client";

export const registerUser = (data) => client.post("/auth/register", data).then((r) => r.data);
export const loginUser = (data) => client.post("/auth/login", data).then((r) => r.data);
export const logoutUser = () => client.post("/auth/logout").then((r) => r.data);
export const getMe = () => client.get("/auth/me").then((r) => r.data);
export const forgotPassword = (data) => client.post("/auth/forgot-password", data).then((r) => r.data);
export const resetPassword = (data) => client.post("/auth/reset-password", data).then((r) => r.data);

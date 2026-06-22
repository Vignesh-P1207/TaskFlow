import client from "./client";

export const getTasks = (params) => client.get("/tasks", { params }).then((r) => r.data);
export const createTask = (data) => client.post("/tasks", data).then((r) => r.data);
export const updateTask = (id, data) => client.put(`/tasks/${id}`, data).then((r) => r.data);
export const completeTask = (id) => client.patch(`/tasks/${id}/complete`).then((r) => r.data);
export const uncompleteTask = (id) => client.patch(`/tasks/${id}/uncomplete`).then((r) => r.data);
export const deleteTask = (id) => client.delete(`/tasks/${id}`).then((r) => r.data);

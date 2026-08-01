import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const{}={},
  },
);
// Create an empty array where we'll export future Inngest functions
export const functions = [];

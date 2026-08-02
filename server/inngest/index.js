import { Inngest } from "inngest";
import { serve } from "inngest/express";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    // Check availability of the username
    const user = await User.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_photo: image_url,
      username,
    };
    await User.create(userData);
  },
);
const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    
    const updatedUserData = {
      // _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_photo: image_url,
      // username,
    };
    await User.findByIdAndUpdate({ _id: id }, updatedUserData);
  },
);
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete({ _id: id });
  },
);
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdate, syncUserDeletion];

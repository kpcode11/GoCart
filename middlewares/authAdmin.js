import { clerkClient } from "@clerk/nextjs/server";
import { decodeAction } from "next/dist/server/app-render/entry-base";

const authAdmin = async (userId) => {
  try {
    if (!userId) {
      return false;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return process.env.ADMIN_EMAIL.split(",").includes(
      user.emailAddresses[o].emailAddress,
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default authAdmin;

import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (
      !name ||
      !username ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !image
    ) {
      return NextResponse.json(
        { error: "missing store info" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });

    if (store) {
      return NextResponse.json({ status: store.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.lowercase() },
    });

    if (isUsernameTaken) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      filename: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: response.filepath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: 512 }],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.lowercase(),
        email,
        contact,
        address,
        image: optimizedImage,
      },
    });

    //link the store with the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        store: { connect: { id: newStore.id } },
      },
    });

    return NextResponse.json(
      { message: "applied, waiting for approval" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });

    if (store) {
      return NextResponse.json({ status: store.status });
    }

    return NextResponse.json({ message: "store not registered" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

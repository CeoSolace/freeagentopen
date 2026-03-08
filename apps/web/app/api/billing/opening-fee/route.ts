import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "../../../../lib/mongoose";
import { UserModel } from "../../../../models/user";

type SessionUserWithId = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function POST() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUserWithId | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await UserModel.findById(sessionUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.openingFeeDue = false;
  user.openingFeePaidAt = new Date();

  await user.save();

  return NextResponse.json({
    success: true,
    message: "Opening fee marked as paid"
  });
}

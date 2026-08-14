import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Curriculum version API is not configured yet." },
    { status: 501 },
  );
}

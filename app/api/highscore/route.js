import JsonDB from "@/helper/jsonDB";
import { NextResponse } from "next/server";
import path from "path";
let db;
try {
  db = new JsonDB( "/local.db");
} catch (e) {
  console.log(e);
}

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET() {
  return await getHighScore();
}
export async function POST(request) {
  return await updateHighScore(request);
}

const getHighScore = async () => {
  try {
    return NextResponse.json({ score: db.get("high_score") }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json("Hayoloh", { status: 500 });
  }
};

const updateHighScore = async (req) => {
  try {
    const { high_score } = await req.json();
    if (high_score >= 1000000) {
      return NextResponse.json("Hayoloh ngecheat", { status: 500 });
    }
    db.set("high_score", high_score);
    return NextResponse.json({ score: high_score }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json("Hayoloh", { status: 500 });
  }
};

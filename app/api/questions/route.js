// ...existing code...
import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { testName, examType, question, options } = body || {};

  if (!testName || !question || !Array.isArray(options)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid payload: testName, question and options are required",
      },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Normalize options: accept strings or { text, isCorrect } objects
    const normalizedOptions = options
      .map((opt) => {
        if (typeof opt === "string") {
          return { text: opt.trim(), isCorrect: false };
        }
        if (opt && typeof opt === "object") {
          return {
            text: String(opt.text || "").trim(),
            isCorrect: !!opt.isCorrect,
          };
        }
        return null;
      })
      .filter(Boolean)
      .filter((o) => o.text !== "");

    if (normalizedOptions.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "At least two non-empty options are required",
        },
        { status: 400 },
      );
    }

    const doc = {
      testName,
      examType: examType || null,
      question: String(question).trim(),
      options: normalizedOptions,
      createdAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save question:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // optional: allow filtering by testName via query param ?testName=test1
    const url = new URL(request.url);
    const testName = url.searchParams.get("testName");

    const filter = testName ? { testName } : {};
    const questions = await db.collection("questions").find(filter).toArray();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
// ...existing code...

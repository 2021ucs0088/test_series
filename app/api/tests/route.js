import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Try driver v4+ option
    let res = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "testCounter" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );

    // Fallback for driver v3 (returnOriginal)
    if (!res || !res.value) {
      res = await db
        .collection("counters")
        .findOneAndUpdate(
          { _id: "testCounter" },
          { $inc: { seq: 1 } },
          { upsert: true, returnOriginal: false },
        );
    }

    // Final fallback: read/initialize the counter
    let seq;
    if (res && res.value && typeof res.value.seq === "number") {
      seq = res.value.seq;
    } else {
      const doc = await db
        .collection("counters")
        .findOne({ _id: "testCounter" });
      if (!doc) {
        // create initial counter
        await db
          .collection("counters")
          .insertOne({ _id: "testCounter", seq: 1 });
        seq = 1;
      } else {
        seq = doc.seq;
      }
    }

    const testName = `test${seq}`;

    // Optional: store test metadata
    await db.collection("tests").insertOne({ testName, createdAt: new Date() });

    return NextResponse.json({ success: true, testName }, { status: 201 });
  } catch (error) {
    console.error("Failed to create test:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

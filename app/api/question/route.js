import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { question, options } = await request.json();
  try {
    const client = await clientPromise;
    const db = client.db(); // default DB from URI
    const result = await db.collection('questions').insertOne({
      question,
      options: options.filter(opt => opt.trim() !== '')
    });
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const questions = await db.collection('questions').find({}).toArray();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
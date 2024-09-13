// app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const client = new MongoClient(MONGODB_URI);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("DragAndDrop");
    const collection = db.collection("Todos");
    const todos = await collection.find().toArray();
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, columnId } = await request.json();
    await client.connect();
    const db = client.db("DragAndDrop");
    const collection = db.collection("Todos");
    const result = await collection.insertOne({ content, columnId });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add todo" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, columnId, content } = await request.json();

    // Ensure id is a valid ObjectId string
    const objectId = new ObjectId(id as string);

    await client.connect();
    const db = client.db("DragAndDrop");
    const collection = db.collection("Todos");

    const updateData: { columnId?: string; content?: string } = {};
    if (columnId) updateData.columnId = columnId;
    if (content) updateData.content = content;

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Ensure id is a valid ObjectId string
    const objectId = new ObjectId(id as string); // Cast id to string

    await client.connect();
    const db = client.db("DragAndDrop");
    const collection = db.collection("Todos");

    const result = await collection.deleteOne({ _id: objectId });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

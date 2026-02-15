import { backup } from "@/lib/backup";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Run the backup
    await backup();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

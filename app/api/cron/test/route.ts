import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Simulate test action (no backup performed)
    return NextResponse.json({
      success: true,
      message: "Test route reached successfully. Secret is valid.",
    });
  } catch (err) {
    console.error("Test route failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

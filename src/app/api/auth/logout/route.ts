import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })
}
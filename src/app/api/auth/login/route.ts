import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:5050"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Login request:", { email: body.email })

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    console.log("Backend response:", { success: data.success, status: response.status })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Login failed",
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
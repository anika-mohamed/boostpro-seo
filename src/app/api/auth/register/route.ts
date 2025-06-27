import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5050";


export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log("Register request received:", { email: body.email, name: body.name });

    // Validate the request payload
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Parse the backend response
    const data = await response.json();
    console.log("Backend response:", { success: data.success, status: response.status });

    // Handle backend errors
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Registration failed",
        },
        { status: response.status }
      );
    }

    // Return the successful response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
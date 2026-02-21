import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { moduleId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 1. Check if already completed
    const { data: existingProgress, error: checkError } = await supabase
      .from("educational_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("module_id", moduleId)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error checking progress:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingProgress?.status === "completed") {
      return NextResponse.json({ error: "Module already completed" }, { status: 400 });
    }

    // Insert or update educational_progress
    const { error: progressError } = await supabase
      .from("educational_progress")
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        status: "completed",
        score: 100,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id, module_id" });

    if (progressError) {
      console.error("Error updating progress:", progressError);
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Learn complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

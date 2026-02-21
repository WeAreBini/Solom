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
    const { moduleId, reward } = body;

    if (!moduleId || typeof reward !== "number") {
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

    // 2. Start a transaction (using RPC or sequential updates since Supabase JS doesn't support true transactions natively without RPC)
    // We'll do sequential updates and hope for the best, or we can use an RPC if one exists.
    // For now, sequential updates:

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

    // Update user_profiles paper_balance
    // We need to fetch current balance first, then add.
    // A better way is an RPC, but we'll do a read-modify-write for simplicity if no RPC exists.
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("paper_balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    const newBalance = Number(profile.paper_balance) + reward;

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ paper_balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating balance:", updateError);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (error: unknown) {
    console.error("Learn complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

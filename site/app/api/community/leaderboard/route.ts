import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch top 10 users by paper_balance
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, username, paper_balance, avatar_url")
      .order("paper_balance", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

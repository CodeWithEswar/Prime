import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function parseEnv() {
  const env: Record<string, string> = {};
  if (fs.existsSync(".env.local")) {
    const lines = fs.readFileSync(".env.local", "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        env[k] = v;
      }
    }
  }
  return env;
}

async function main() {
  const env = parseEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let allProblems: Array<{
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    leetcode_slug: string | null;
  }> = [];

  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("problems")
      .select("id, slug, title, difficulty, leetcode_slug")
      .order("id")
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error fetching problems:", error);
      break;
    }
    if (!data || data.length === 0) break;
    allProblems = allProblems.concat(data);
    from += batchSize;
    if (data.length < batchSize) break;
  }

  console.log(`Loaded ${allProblems.length} problems total.`);

  const lookup: Record<string, { id: string; slug: string; title: string; difficulty: string }> = {};
  for (const p of allProblems) {
    lookup[p.slug.toLowerCase()] = p;
    if (p.leetcode_slug) {
      lookup[p.leetcode_slug.toLowerCase()] = p;
    }
  }

  if (!fs.existsSync("data/prime-core")) {
    fs.mkdirSync("data/prime-core", { recursive: true });
  }

  fs.writeFileSync(
    "data/prime-core/catalog-cache.json",
    JSON.stringify(lookup, null, 2),
    "utf8"
  );
  console.log(`Saved catalog cache.`);
}

main().catch(console.error);

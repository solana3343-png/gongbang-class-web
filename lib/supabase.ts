import { createClient } from "@supabase/supabase-js";

// 창고(Supabase) — 주소와 공개(publishable) 열쇠는 .env.local 에. secret 열쇠는 쓰지 않는다
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

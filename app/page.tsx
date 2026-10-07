import { redirect } from "next/navigation";

// PRD 웹 공통 틀 — `/` 로 들어오면 `/today` 로 보낸다
export default function Home() {
  redirect("/today");
}

import { supabase } from "@/lib/supabase";

// 창고에서 꺼내온 데이터 — 화면은 예전 가짜 데이터와 같은 모양으로 받는다 (PRD 4장)

export type Status = "대기" | "확정" | "거절" | "취소";

export type Person = { id: number; name: string; phone: string };

export type ClassSlot = {
  id: number;
  name: string;
  start: Date;
  duration: string;
  summary: string;
  capacity: number;
};

export type Application = {
  id: number;
  personId: number;
  classId: number;
  appliedAt: Date;
  status: Status;
  attended: boolean;
};

export async function loadData() {
  const [p, c, a] = await Promise.all([
    supabase.from("people").select("id, name, phone"),
    supabase.from("classes").select("id, name, starts_at, duration, summary, capacity"),
    supabase.from("applications").select("id, person_id, class_id, applied_at, status, attended"),
  ]);
  const error = p.error ?? c.error ?? a.error;
  if (error) throw new Error(`창고에서 불러오지 못했습니다: ${error.message}`);

  const people: Person[] = p.data!;
  const classes: ClassSlot[] = c.data!.map((r) => ({
    id: r.id,
    name: r.name,
    start: new Date(r.starts_at),
    duration: r.duration,
    summary: r.summary,
    capacity: r.capacity,
  }));
  const applications: Application[] = a.data!.map((r) => ({
    id: r.id,
    personId: r.person_id,
    classId: r.class_id,
    appliedAt: new Date(r.applied_at),
    status: r.status as Status,
    attended: r.attended,
  }));
  return { people, classes, applications };
}

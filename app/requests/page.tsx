import { connection } from "next/server";
import TopBar from "@/components/TopBar";
import RequestsTable, { type RequestRow } from "@/components/RequestsTable";
import { loadData } from "@/lib/data";

// PRD 3-3 받은 신청 — 상태가 `대기`인 신청 전부, 최근 신청이 위

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function appliedLabel(d: Date, now: Date) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const yesterday = new Date(day);
  yesterday.setDate(day.getDate() - 1);
  if (d >= day) return `오늘 ${hhmm(d)}`;
  if (d >= yesterday) return `어제 ${hhmm(d)}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(d)}`;
}

export default async function RequestsPage() {
  await connection();
  const { people, classes, applications } = await loadData();
  const now = new Date();

  const taken = (classId: number) =>
    applications.filter((a) => a.classId === classId && (a.status === "대기" || a.status === "확정")).length;

  const rows: RequestRow[] = applications
    .filter((a) => a.status === "대기")
    .sort((x, y) => y.appliedAt.getTime() - x.appliedAt.getTime())
    .map((a) => {
      const person = people.find((p) => p.id === a.personId)!;
      const slot = classes.find((c) => c.id === a.classId)!;
      return {
        id: a.id,
        applied: appliedLabel(a.appliedAt, now),
        name: person.name,
        phone: person.phone,
        classDate: `${slot.start.getMonth() + 1}/${slot.start.getDate()} (${WEEKDAYS[slot.start.getDay()]}) ${hhmm(slot.start)}`,
        className: slot.name,
        seats: `${taken(slot.id)} / ${slot.capacity}`,
      };
    });

  return (
    <>
      <TopBar current="/requests" />
      <main className="mx-auto max-w-[1120px] px-6 py-8">
        <RequestsTable initialRows={rows} />
      </main>
    </>
  );
}

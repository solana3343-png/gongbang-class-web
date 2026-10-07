import { connection } from "next/server";
import TopBar from "@/components/TopBar";
import TodayTable, { type PersonDetail, type TodayRow } from "@/components/TodayTable";
import { loadData } from "@/lib/data";

// PRD 3-2 오늘 클래스 — 윗줄 · 제목 줄 · 검색 · 명단 표 · 3-2-1 자세히 (출석 누르기는 7장 8번)

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default async function TodayPage() {
  await connection(); // 「오늘」은 들어올 때마다 새로 센다
  const { people, classes, applications } = await loadData();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const isToday = (d: Date) => d.toDateString() === now.toDateString();
  const slotOf = (classId: number) => classes.find((c) => c.id === classId)!;

  const rows: TodayRow[] = applications
    .filter((a) => a.status === "확정" || a.status === "대기")
    .map((a) => ({ a, person: people.find((p) => p.id === a.personId)!, slot: slotOf(a.classId) }))
    .filter((r) => isToday(r.slot.start))
    .sort((x, y) => x.slot.start.getTime() - y.slot.start.getTime() || x.person.name.localeCompare(y.person.name, "ko"))
    .map(({ a, person, slot }) => ({
      id: a.id,
      personId: person.id,
      name: person.name,
      phone: person.phone,
      classLabel: `${hhmm(slot.start)} ${slot.name}`,
      status: a.status,
      attended: a.attended,
    }));

  // 3-2-1 — 명단에 있는 사람마다 모든 신청 기록
  const details: Record<number, PersonDetail> = {};
  for (const r of rows) {
    if (details[r.personId]) continue;
    const mine = applications
      .filter((a) => a.personId === r.personId)
      .map((a) => ({ a, slot: slotOf(a.classId) }));
    const upcoming = mine.filter((m) => m.slot.start >= todayStart).sort((x, y) => x.slot.start.getTime() - y.slot.start.getTime());
    const past = mine.filter((m) => m.slot.start < todayStart).sort((x, y) => y.slot.start.getTime() - x.slot.start.getTime());
    details[r.personId] = {
      name: r.name,
      phone: r.phone,
      history: [...upcoming, ...past].map(({ a, slot }) => ({
        id: a.id,
        label: `${slot.start.getMonth() + 1}/${slot.start.getDate()} (${WEEKDAYS[slot.start.getDay()]}) ${hhmm(slot.start)} ${slot.name}`,
        status: a.status,
        attended: a.attended,
        upcoming: slot.start >= todayStart,
      })),
    };
  }

  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 (${WEEKDAYS[now.getDay()]})`;

  return (
    <>
      <TopBar current="/today" />
      <main className="mx-auto max-w-[1120px] px-6 py-8">
        <TodayTable dateLabel={dateLabel} rows={rows} details={details} />
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Status } from "@/lib/data";

// PRD 3-2 오늘 클래스 — 검색칸 + 명단 표 + 3-2-1 이름 누르면 자세히

export type HistoryItem = {
  id: number;
  label: string; // `9/28 (월) 10:00 도자기 물레`
  status: Status;
  attended: boolean;
  upcoming: boolean; // 오늘 포함 앞으로
};

export type PersonDetail = {
  name: string;
  phone: string;
  history: HistoryItem[]; // 다가오는 것은 가까운 순, 지난 것은 최근 순으로 이미 정렬
};

export type TodayRow = {
  id: number;
  personId: number;
  name: string;
  phone: string;
  classLabel: string; // `10:00 도자기 물레`
  status: Status;
  attended: boolean;
};

function StatusPill({ status }: { status: Status }) {
  const tone = status === "확정" ? "bg-accent/12 text-accent" : "bg-wait-bg text-wait-fg";
  return (
    <span className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[12px] font-semibold ${tone}`}>
      {status}
    </span>
  );
}

const pastLabel = (h: HistoryItem) =>
  h.status === "확정" ? (h.attended ? "다녀옴" : "지난 클래스") : h.status === "대기" ? "지난 클래스" : h.status;

function DetailPanel({ person, onClose }: { person: PersonDetail; onClose: () => void }) {
  const upcoming = person.history.filter((h) => h.upcoming);
  const past = person.history.filter((h) => !h.upcoming);
  const visited = past.filter((h) => h.status === "확정" && h.attended).length;
  const cancelled = person.history.filter((h) => h.status === "취소").length;

  return (
    <aside className="fixed top-14 right-0 bottom-0 w-[360px] overflow-y-auto border-l border-line bg-card px-6 py-6 shadow-[-8px_0_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold">{person.name}</h2>
          <p className="mt-0.5 text-[13px] text-ink/60 tabular-nums">{person.phone}</p>
        </div>
        <button onClick={onClose} aria-label="닫기" className="grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:bg-line">
          ✕
        </button>
      </div>

      <p className="mt-4 text-[15px]">
        다녀옴 {visited}번 · 취소 {cancelled}번
      </p>

      <h3 className="mt-6 text-[13px] text-ink/60">다가오는 것</h3>
      <ul className="mt-2 divide-y divide-line">
        {upcoming.map((h) => (
          <li key={h.id} className="py-3">
            <p className="tabular-nums">{h.label}</p>
            <p className="mt-1 flex items-center gap-2">
              <StatusPill status={h.status} />
              {h.attended && <span className="text-[13px] text-accent">출석 ✓</span>}
            </p>
          </li>
        ))}
      </ul>

      {past.length > 0 && (
        <>
          <h3 className="mt-6 text-[13px] text-ink/60">지난 것</h3>
          <ul className="mt-2 divide-y divide-line text-ink/55">
            {past.map((h) => (
              <li key={h.id} className="py-3">
                <p className="tabular-nums">{h.label}</p>
                <p className="mt-1">
                  <span className="inline-flex h-[22px] items-center rounded-full bg-ink/8 px-2.5 text-[12px] font-semibold">
                    {pastLabel(h)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

export default function TodayTable({
  dateLabel,
  rows,
  details,
}: {
  dateLabel: string;
  rows: TodayRow[];
  details: Record<number, PersonDetail>;
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const q = query.trim();
  const shown = q ? rows.filter((r) => r.name.includes(q)) : rows;

  useEffect(() => {
    if (openId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold">오늘 클래스</h1>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="text-[32px] leading-none font-bold tabular-nums">{rows.length}명</span>
            <span className="text-[13px] text-ink/60">{dateLabel} · 오늘 오는 사람</span>
          </p>
        </div>
        {rows.length > 0 && (
          <label className="flex h-9 w-60 items-center gap-2 rounded-lg border border-line bg-card px-3">
            <span aria-hidden>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름으로 찾기"
              className="w-full bg-transparent outline-none placeholder:text-ink/40"
            />
          </label>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-card">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-ink/60">오늘은 열리는 클래스가 없습니다</p>
        ) : (
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-40" />
              <col className="w-40" />
              <col />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="h-11 border-b border-line text-[13px] text-ink/60">
                <th className="px-5 font-normal">이름</th>
                <th className="px-5 font-normal">연락처</th>
                <th className="px-5 font-normal">클래스</th>
                <th className="px-5 font-normal">상태</th>
                <th className="px-5 font-normal">출석</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink/60">
                    찾는 분이 없습니다
                  </td>
                </tr>
              ) : (
                shown.map((r) => (
                  <tr
                    key={r.id}
                    className={`h-11 border-b border-line last:border-b-0 ${r.personId === openId ? "bg-accent/8" : ""}`}
                  >
                    <td className="px-5">
                      <button
                        onClick={() => setOpenId(r.personId)}
                        className="font-semibold whitespace-nowrap text-accent hover:underline"
                      >
                        {r.name}
                      </button>
                    </td>
                    <td className="px-5 tabular-nums">{r.phone}</td>
                    <td className="px-5 tabular-nums">{r.classLabel}</td>
                    <td className="px-5">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5">
                      {r.status === "대기" ? (
                        <span className="text-[13px] text-ink/40">확정 후</span>
                      ) : (
                        <span
                          className={`inline-grid h-[18px] w-[18px] place-items-center rounded border text-[12px] ${
                            r.attended ? "border-accent bg-accent text-white" : "border-line"
                          }`}
                        >
                          {r.attended ? "✓" : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {openId !== null && details[openId] && <DetailPanel person={details[openId]} onClose={() => setOpenId(null)} />}
    </>
  );
}

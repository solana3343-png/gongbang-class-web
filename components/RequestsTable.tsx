"use client";

import { Fragment, useState } from "react";
import { supabase } from "@/lib/supabase";

// PRD 3-3 받은 신청 — 대기 표 · 확정 · 거절(한 번 묻는다) · 확인 한 줄

export type RequestRow = {
  id: number;
  applied: string; // `오늘 09:12` · `어제 22:40` · `9/12 14:00`
  name: string;
  phone: string;
  classDate: string; // `9/14 (일) 14:00`
  className: string;
  seats: string; // `6 / 6`
};

export default function RequestsTable({ initialRows }: { initialRows: RequestRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [asking, setAsking] = useState<number | null>(null); // 거절을 묻는 줄 — 한 번에 하나
  const [notice, setNotice] = useState<string | null>(null); // 다음에 뭔가 누를 때까지 남는다

  // 창고의 상태를 바꾼다 — 새로고침해도 남는다
  const decide = async (r: RequestRow, status: "확정" | "거절") => {
    setAsking(null);
    const { error } = await supabase.from("applications").update({ status }).eq("id", r.id);
    if (error) {
      setNotice(`저장하지 못했습니다. 다시 시도해 주세요`);
      return;
    }
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    setNotice(`${r.name}님 신청을 ${status === "확정" ? "확정" : "거절"}했습니다`);
  };
  const confirm = (r: RequestRow) => decide(r, "확정");
  const reject = (r: RequestRow) => decide(r, "거절");

  return (
    <>
      <h1 className="text-[20px] font-bold">받은 신청</h1>
      <p className="mt-1 text-[13px] text-ink/60">확정 안 한 것 {rows.length}건</p>
      {notice && <p className="mt-3 text-[15px] text-accent">{notice}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-card">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-ink/60">확정할 신청이 없습니다</p>
        ) : (
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-40" />
              <col />
              <col className="w-24" />
              <col className="w-44" />
            </colgroup>
            <thead>
              <tr className="h-11 border-b border-line text-[13px] text-ink/60">
                <th className="px-5 font-normal">신청한 때</th>
                <th className="px-5 font-normal">이름</th>
                <th className="px-5 font-normal">연락처</th>
                <th className="px-5 font-normal">클래스</th>
                <th className="px-5 font-normal">자리</th>
                <th className="px-5 font-normal" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3 tabular-nums text-ink/60">{r.applied}</td>
                    <td className="px-5 py-3 font-semibold whitespace-nowrap">{r.name}</td>
                    <td className="px-5 py-3 tabular-nums">{r.phone}</td>
                    <td className="px-5 py-3">
                      <p className="tabular-nums">{r.classDate}</p>
                      <p className="text-[13px] text-ink/60">{r.className}</p>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{r.seats}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => confirm(r)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-[15px] font-semibold text-white"
                        >
                          확정
                        </button>
                        <button
                          onClick={() => {
                            setAsking(r.id);
                            setNotice(null);
                          }}
                          className="rounded-lg border border-line px-3 py-1.5 text-[15px]"
                        >
                          거절
                        </button>
                      </div>
                    </td>
                  </tr>
                  {asking === r.id && (
                    <tr className="border-b border-line bg-stop-bg/50">
                      <td colSpan={6} className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <span>{r.name}님 신청을 거절할까요?</span>
                          <button
                            onClick={() => reject(r)}
                            className="rounded-lg bg-stop-fg px-3 py-1.5 text-[15px] font-semibold text-white"
                          >
                            거절하기
                          </button>
                          <button
                            onClick={() => setAsking(null)}
                            className="rounded-lg border border-line bg-card px-3 py-1.5 text-[15px]"
                          >
                            그대로
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > 0 && (
        <p className="mt-3 text-[13px] text-ink/60">
          확정하면 오늘 클래스 명단으로 넘어가고, 거절하면 앱 「내 신청」에 &quot;자리가 없어요&quot;로 표시됩니다.
        </p>
      )}
    </>
  );
}

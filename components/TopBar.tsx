import Link from "next/link";

// PRD 웹 공통 틀 — 윗줄 (높이 56 · 지금 화면은 강조색 글자 · 굵게 · 아래 2px 선)
const MENU = [
  { href: "/today", label: "오늘 클래스" },
  { href: "/requests", label: "받은 신청" },
  { href: "/week", label: "주간" },
  { href: "/notice", label: "알림판" },
];

export default function TopBar({ current }: { current: string }) {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-8 px-6">
        <span className="font-bold">공방 클래스 예약</span>
        <nav className="flex h-full gap-6">
          {MENU.map((m) => {
            const on = m.href === current;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex h-full items-center border-b-2 ${
                  on ? "border-accent font-semibold text-accent" : "border-transparent"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
        <span className="ml-auto text-[13px] text-ink/60">운영자</span>
      </div>
    </header>
  );
}

// 아직 안 만든 메뉴 — 가운데 `준비 중입니다`
export function NotReady({ current }: { current: string }) {
  return (
    <>
      <TopBar current={current} />
      <main className="mx-auto max-w-[1120px] px-6 py-24 text-center text-ink/60">준비 중입니다</main>
    </>
  );
}

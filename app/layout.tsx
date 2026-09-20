import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나잘알 — 솔직히 너, 나 잘 알지?",
  description: "친구들이 나를 얼마나 맞힐 수 있는지 시험해보세요. 10문제 · 회원가입 없음 · 약 1분.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-md px-5 py-8">{children}</div>
      </body>
    </html>
  );
}

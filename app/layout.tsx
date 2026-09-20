import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나잘알 — 친구들은 나를 얼마나 알고 있을까?",
  description: "10개 질문으로 만드는 나를 맞히는 퀴즈. 회원가입 없음, 약 1분.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-md bg-white px-5 py-8 shadow-sm">{children}</div>
      </body>
    </html>
  );
}

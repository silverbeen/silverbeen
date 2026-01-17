import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary-500">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-8 text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

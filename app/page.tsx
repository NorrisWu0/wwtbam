import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-5xl font-bold text-black dark:text-zinc-50">
          Who wants to be a m______?
        </h1>
        <Link
          href="/session"
          className="rounded-full bg-foreground px-8 py-4 text-lg font-semibold text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Start Game
        </Link>
      </main>
    </div>
  );
}

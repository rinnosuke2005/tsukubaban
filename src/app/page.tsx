import Image from "next/image";

export default function Home() {
  return (
    <div className="text-foreground min-h-screen bg-white">
      <header className="border-border border-b px-6 py-7">
        <div className="flex flex-col items-center justify-center gap-1">
          <Image
            src="/title.png"
            alt="つくばばん"
            width={763}
            height={238}
            className="h-20 w-auto object-contain"
          />
          <p className="text-xs text-black">
            「データがない！」を「集まった！」に変える
          </p>
        </div>
      </header>

      <main className="flex justify-center p-6"></main>
    </div>
  );
}

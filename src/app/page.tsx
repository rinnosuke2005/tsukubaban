import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/rogo.png"
            alt=""
            width={48}
            height={48}
            className="h-30 w-30 object-contain"
          />
          <h1 className="text-3xl font-bold">つくばばん</h1>
        </div>
      </header>

      <main className="jsutify-center p-6 text-center">
        「データがない！」を「集まった！」に変える。卒論・研究のための即効アンケートアプリ。
      </main>
    </div>
  );
}

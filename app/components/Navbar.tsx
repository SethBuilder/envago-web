import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E1DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="Envago – Passeios e Aventuras no Brasil"
            width={140}
            height={40}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <div className="flex-1" />
      </div>
    </header>
  );
}

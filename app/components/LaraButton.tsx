'use client';

export default function LaraButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-lara'))}
      className="cursor-pointer inline-block bg-white text-[#ff2924] font-bold px-8 py-3 rounded-full hover:bg-[#fff0f0] transition-colors"
    >
      Listar meu passeio grátis
    </button>
  );
}

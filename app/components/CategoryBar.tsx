import Image from "next/image";
import { categories } from "../data";

export default function CategoryBar() {
  return (
    <div className="bg-white border-b border-[#E5E1DC] sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl flex-shrink-0 transition-all group
                ${cat.slug === "todos"
                  ? "bg-[#ff2924] text-white"
                  : "hover:bg-[#ECEAE6] text-[#555]"
                }`}
            >
              {cat.icon ? (
                <Image
                  src={cat.icon}
                  alt={cat.label}
                  width={72}
                  height={72}
                  className={`w-18 h-18 object-contain ${
                    cat.slug === "todos"
                      ? "brightness-0 invert"
                      : "opacity-90 group-hover:opacity-100"
                  }`}
                />
              ) : (
                <span className="w-7 h-7 flex items-center justify-center text-lg">🗺️</span>
              )}
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

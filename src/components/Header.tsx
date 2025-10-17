import Logo from "../../public/Logo.png";
import Image from "next/image";

export function Header() {
  return (
    <header className="py-4 px-2.5">
      <div className="max-w-7xl mx-auto">
        <Image src={Logo} alt="Splint Invest logo" className="h-8" />
      </div>
    </header>
  );
}

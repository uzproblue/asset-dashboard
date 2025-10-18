import Logo from "../../public/Logo.png";
import Image from "next/image";

export function Header() {
  return (
    <header className="py-4">
      <div className="max-w-7xl mx-auto">
        <Image
          src={Logo}
          alt="Splint Invest logo"
          className="h-5"
          width={134}
          height={20}
        />
      </div>
    </header>
  );
}

import Logo from "../../public/Logo.png"
import Image from "next/image";

export function Header() {
  return (
    <header className="py-6 px-2.5 align-center">
      <Image src={Logo} alt="Splint Invest logo" />
    </header>
  );
}
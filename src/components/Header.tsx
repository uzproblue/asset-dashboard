import Logo from "../../public/Logo.png"
import Image from "next/image";

export function Header() {
  return (
    <header className="py-6">
      <Image src={Logo} alt="Splint Invest logo" className="" />
    </header>
  );
}
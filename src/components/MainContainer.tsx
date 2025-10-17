import { FilterSection } from "./FilterSection";

export function MainContainer() {
  return (
    <div className="flex flex-col xl:gap-12 md:gap-8 gap-6">
    {/*Title container*/}
      <div className="flex flex-col gap-4 ">
        <h1 className="font-bold text-2xl w-full leadeing-[1.5] tracking-[-0.01em] text-brand-900 m-0">
          Alternative Assets — Value per Splint (Monthly)
        </h1>
        <h2 className="m-0 text-lg font-normal leadeing-[1.5] text-neutral-70">
          Explore performance by asset, expert, category or your own selection.
        </h2>
      </div>
      {/*Content container*/}
      <div className="flex flex-col gap-6 max-sm:gap-4 w-full">
        <FilterSection />
      </div>
    </div>
  );
}
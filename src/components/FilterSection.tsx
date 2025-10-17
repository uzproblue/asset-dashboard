import FilterTabs from "./FilterTabs";

export function FilterSection() {;
  return (

    <section
      className="w-full flex flex-col gap-2.5 rounded-4xl p-2 shadow-filter border-neutral-200"
    >
      {/*Filter row*/}
      <div className="w-full border-4 pt-5 px-6 max-sm:px-4 max-sm:pt-4 border-neutral-200 h-14 bg-filter-row rounded-3xl">
        {/*Tabs*/}
        <FilterTabs />

      </div>

    </section>
  );
}
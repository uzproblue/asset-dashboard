'use client';

import React, { useState } from 'react';

const FilterTabs: React.FC = () => {
  const tabs = ['Asset search', 'Custom basket'];
  const [active, setActive] = useState(0);

  return (
    <div className="relative w-full border-b border-neutral-200 flex flex-113/130">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => setActive(index)}
          className={`relative px-4 py-2 text-sm font-semibold leading-1.5  text-brand-500 transition-colors
            ${active === index ? 'border-brand-500 border-b-2' : 'hover:text-gray-900'}
          `}
        >
          {tab}
          {active === index && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-500"></span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
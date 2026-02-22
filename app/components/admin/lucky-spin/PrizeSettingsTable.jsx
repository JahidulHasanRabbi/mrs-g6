"use client";

import { useState } from "react";

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 left-full ml-2 top-1/2 -translate-y-1/2">
          <div className="backdrop-blur-[25px] bg-[rgba(179,179,179,0.2)] border-[0.5px] border-[rgba(255,255,132,0.2)] rounded-[8px] p-3 w-[258px]">
            <div className="flex flex-col gap-1 leading-[18px] not-italic text-[12px] text-white">
              <p className="font-bold font-['Times_New_Roman']">
                {content.value}
              </p>
              <p className="font-['Times_New_Roman']">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PRIZE_SETTINGS_DATA = [
  {
    id: 1,
    setting: "Min Spin Amount",
    value: "RM10",
    hasEdit: false,
    toggleState: true,
    tooltip: {
      value: "RM10",
      description: "Minimum amount required to spin the wheel."
    },
  },
  {
    id: 2,
    setting: "Max Prize Pool Per Day",
    value: "RM1,000",
    hasEdit: false,
    toggleState: true,
    tooltip: {
      value: "RM1,000",
      description: "Total prize probability must stay under 100%."
    },
  },
  {
    id: 3,
    setting: "Max Total Probability (%)",
    value: "100%",
    hasEdit: true,
    toggleState: false,
    tooltip: {
      value: "100%",
      description: "Maximum probability percentage for all prizes combined."
    },
  },
  {
    id: 4,
    setting: "Auto-disable Big Prizes",
    value: "Enabled",
    hasEdit: true,
    toggleState: false,
    tooltip: {
      value: "Enabled",
      description: "Automatically disable high-value prizes when limit is reached."
    },
  },
  {
    id: 5,
    setting: "Enable Category Weighting",
    value: "On",
    hasEdit: true,
    toggleState: false,
    tooltip: {
      value: "On",
      description: "Enable weighted probability distribution across prize categories."
    },
  },
];

const ToggleSwitch = ({ isOn, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        isOn ? "bg-[#7f56d9]" : "bg-[#eaecf0] hover:bg-[#d5d7db]"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          isOn ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

export default function PrizeSettingsTable() {
  const [toggleStates, setToggleStates] = useState(
    PRIZE_SETTINGS_DATA.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.toggleState,
    }), {})
  );

  const handleToggle = (id) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black border-b border-white/10">
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Setting
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Value
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Edit
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Enable/Disable
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {PRIZE_SETTINGS_DATA.map((item) => (
            <tr
              key={item.id}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-[14px] text-white font-['Times_New_Roman']">
                  {item.setting}
                </p>
              </td>
              <td className="px-4 py-4">
                <Tooltip content={item.tooltip}>
                  <p className="text-[14px] text-white/80 font-['Times_New_Roman'] cursor-help">
                    {item.value}
                  </p>
                </Tooltip>
              </td>
              <td className="px-4 py-4">
                {item.hasEdit ? (
                  <div className="flex justify-start">
                    <button className="rounded bg-[#06b800] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#06b800]/90 w-[86px]">
                      Edit
                    </button>
                  </div>
                ) : (
                  <p className="text-[14px] text-white font-['Times_New_Roman'] text-start">
                    No
                  </p>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-start">
                  <ToggleSwitch
                    isOn={toggleStates[item.id]}
                    onChange={() => handleToggle(item.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

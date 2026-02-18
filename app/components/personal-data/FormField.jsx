"use client";

import Image from "next/image";
import { FORM_COLORS } from "./constants";
import { CalendarIcon, ArrowIcon } from "./FormIcons";

export default function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  options = [],
}) {
  const renderInput = () => {
    const commonClasses = "absolute inset-0 bg-transparent px-4 outline-none";
    const commonStyles = {
      fontFamily: '"Times New Roman", serif',
      color: FORM_COLORS.textInput,
    };

    switch (type) {
      case "select":
        return (
          <>
            <select
              id={id}
              value={value}
              onChange={(e) => onChange(id, e.target.value)}
              className={`${commonClasses} pr-12 appearance-none`}
              style={commonStyles}
            >
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#1a1a1a]"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {icon === "arrow" && (
              <div className="absolute right-[23px] top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none rotate-90">
                <ArrowIcon />
              </div>
            )}
          </>
        );

      case "date":
        return (
          <>
            <input
              id={id}
              type="date"
              value={value}
              onChange={(e) => onChange(id, e.target.value)}
              className={`${commonClasses} pr-12`}
              style={commonStyles}
            />
            {icon === "calendar" && (
              <div className="absolute right-[23px] top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none">
                <CalendarIcon />
              </div>
            )}
          </>
        );

      default:
        return (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder={placeholder}
            className={commonClasses}
            style={commonStyles}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-[6px]">
      <label
        htmlFor={id}
        className="text-sm tracking-[-0.28px]"
        style={{
          fontFamily: '"Times New Roman", serif',
          fontWeight: "bold",
          color: FORM_COLORS.textLabel,
        }}
      >
        {label}
      </label>
      <div className="relative h-[40px] w-full">
        <Image
          src="/assets/personal-data/input-bg.png"
          alt=""
          fill
          className="object-cover"
        />
        {renderInput()}
      </div>
    </div>
  );
}

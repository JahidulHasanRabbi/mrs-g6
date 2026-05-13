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
  disabled = false,
}) {
  const renderInput = () => {
    const commonClasses = `absolute inset-0 bg-transparent px-4 outline-none ${disabled ? 'cursor-not-allowed opacity-50' : ''}`;
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
              disabled={disabled}
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
              <div className={`absolute right-[23px] top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none rotate-90 ${disabled ? 'opacity-50' : ''}`}>
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
              disabled={disabled}
              className={`${commonClasses} pr-12 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={commonStyles}
              onClick={(e) => !disabled && e.currentTarget.showPicker?.()}
            />
            {icon === "calendar" && (
              <div 
                className={`absolute right-[23px] top-1/2 -translate-y-1/2 w-6 h-6 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !disabled && document.getElementById(id)?.showPicker?.()}
              >
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
            disabled={disabled}
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
        className={`text-sm tracking-[-0.28px] ${disabled ? 'opacity-50' : ''}`}
        style={{
          fontFamily: '"Times New Roman", serif',
          fontWeight: "bold",
          color: FORM_COLORS.textLabel,
        }}
      >
        {label}
        {disabled && (
          <span className="ml-1 text-[10px]" title="This field cannot be changed once set">
            🔒
          </span>
        )}
      </label>
      <div className={`relative h-[40px] w-full ${disabled ? 'opacity-60' : ''}`}>
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

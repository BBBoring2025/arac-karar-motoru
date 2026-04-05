import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      options,
      placeholder,
      helperText,
      error = false,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "flex w-full px-3 py-2 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none cursor-pointer bg-white";

    const stateStyles = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500";

    const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} className={combinedClassName} {...props}>
            {placeholder && (
              <option value="" disabled selected>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
        </div>
        {errorMessage && error && (
          <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-2">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

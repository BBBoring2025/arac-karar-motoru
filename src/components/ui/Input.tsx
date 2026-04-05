import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  turkishNumberFormat?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      helperText,
      error = false,
      errorMessage,
      turkishNumberFormat = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "flex w-full px-3 py-2 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const stateStyles = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500";

    const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (turkishNumberFormat && type === "text") {
        const value = e.target.value.replace(/\D/g, "");
        const formatted = new Intl.NumberFormat("tr-TR").format(Number(value));
        e.target.value = formatted;
      }
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={combinedClassName}
          onChange={handleChange}
          {...props}
        />
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

Input.displayName = "Input";

export default Input;

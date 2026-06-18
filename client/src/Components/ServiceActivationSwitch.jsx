import React from "react";

const ServiceActivationSwitch = ({
  checked,
  disabled = false,
  loading = false,
  onChange,
  title,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      disabled={disabled || loading}
      onClick={(event) => {
        event.stopPropagation();
        onChange?.(!checked);
      }}
      className={`relative h-7 w-12 rounded-full border transition-all duration-200 ${
        checked
          ? "border-green-500/60 bg-green-500/30"
          : "border-white/10 bg-white/10"
      } ${disabled || loading ? "cursor-not-allowed opacity-60" : "hover:border-green-500/50"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        } ${loading ? "animate-pulse" : ""}`}
      />
    </button>
  );
};

export default ServiceActivationSwitch;

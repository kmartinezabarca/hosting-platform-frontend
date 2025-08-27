export const useInputClass = (touched, errors, name, extraNeutral = false) => {
  const base =
    "w-full rounded-xl px-4 py-3 bg-white dark:bg-[#12151c] text-foreground placeholder:text-black/40 dark:placeholder:text-white/55 border transition focus:outline-none";
  const isTouched = !!touched[name];
  const hasError = !!errors[name];

  if (!isTouched || (!extraNeutral && name === "domain" && !errors[name] && !touched[name]))
    return `${base} border-black/10 dark:border-white/10 focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30`;

  if (hasError)
    return `${base} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50 dark:bg-red-500/10 placeholder:text-red-600/70`;

  return `${base} border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25`;
};

import slugify from "slugify";

export const generateUsername = (fullName?: string, email?: string): string => {
  const base = fullName
    ? slugify(fullName, { lower: true, strict: true })
    : email?.split("@")[0] || "user";

  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
};
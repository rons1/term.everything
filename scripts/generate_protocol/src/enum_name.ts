export const enum_name = (
  interface_name: string,
  enum_name_with_dot: string
) => {
  let new_enum_name = enum_name_with_dot;
  if (!enum_name_with_dot.includes(".")) {
    new_enum_name = `${interface_name}_${enum_name_with_dot}`;
  }
  return new_enum_name.replace(/\./g, "_");
};

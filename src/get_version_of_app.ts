import package_ from "../package.json" with { type: "json" };

export const get_version_of_app = () => {
  return package_.version;
};

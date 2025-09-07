export type Object_ID<T = any> = number & { __type__: T };
export type File_Descriptor =
  | (number & { __type__: "file_descriptor" })
  | (null & { __type__: "file_descriptor" });

/**
 * always safe to pass version 1 
 * because as long as the client is bound
 * it is bound to at least version 1
 */
export type version =
  | (number & {
      __brand: "version";
    })
  | 1;

export type UInt32 = number;
export type Int32 = number;
export type Fixed = number;

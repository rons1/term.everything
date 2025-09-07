import { File_Descriptor } from "./wayland_types.ts";

export interface File_Descriptor_Claim {
  claim_file_descriptor: () => File_Descriptor;
}

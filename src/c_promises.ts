import c, { Client_State } from "./c_interop.ts";

export const get_message_and_file_descriptors = (
  client_socket: number,
  buffer: Uint8Array,
  fd_buffer: Uint32Array
) => {
  const { promise, resolve } = Promise.withResolvers<{
    should_continue: boolean;
    bytes_read: number;
    number_of_file_descriptors: number;
  }>();
  c.get_message_and_file_descriptors(
    client_socket,
    buffer,
    fd_buffer,
    (_error, should_continue, bytes_read, file_descriptors) => {
      resolve({
        should_continue,
        bytes_read,
        number_of_file_descriptors: file_descriptors,
      });
    }
  );
  return promise;
};

export const send_message_and_file_descriptors = (
  client_socket: number,
  buffer: Uint8Array,
  fd_buffer: Uint32Array
) => {
  const { promise, resolve } = Promise.withResolvers<{
    should_continue: boolean;
    bytes_written: number;
  }>();
  c.send_message_and_file_descriptors(
    client_socket,
    buffer,
    fd_buffer,
    (_error, should_continue, bytes_written) => {
      resolve({ should_continue, bytes_written });
    }
  );
  return promise;
};

export const listen_for_client = (socket_file_descriptor: number) => {
  const { promise, resolve } = Promise.withResolvers<{
    client_socket: number;
    client_state: Client_State;
  }>();
  c.listen_for_client(
    socket_file_descriptor,
    (_error, client_socket, client_state) => {
      resolve({
        client_socket,
        client_state,
      });
    }
  );
  return promise;
};

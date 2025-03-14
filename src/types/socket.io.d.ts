declare module "socket.io" {
  import { Server as HttpServer } from "http";
  import { EventEmitter } from "events";

  export class Server extends EventEmitter {
    constructor(httpServer?: HttpServer, options?: any);
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
    to(room: string): this;
    in(room: string): this;
    close(): void;
  }
}

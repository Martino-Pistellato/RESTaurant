import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  constructor() {
    this.socket = io('https://localhost:3000');
  }

  listenToServer(connection: string, cb: Function): void{
    this.socket.on(connection, (...args: any[]) => {console.log("inside socket"); cb(...args)});
  }

  disconnect(){
    this.socket.disconnect();
  }
}

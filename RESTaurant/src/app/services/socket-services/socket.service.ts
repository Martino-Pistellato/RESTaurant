import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket:any;
  constructor() {
    this.socket = io('https://localhost:3000');
  }

  //Tell the socket to listen for something (i.e. notification events)
  listenToServer(connection: string): Observable<any>{
    this.socket = io('https://localhost:3000');
    return new Observable( (observer) => {
      this.socket.on(connection, (arg: any) => {
        observer.next(arg);
      });

      this.socket.on('error', (err:any) => {
        console.log('Socket.io error: ' + err );
        observer.error( err );
      });

      return { 
        unsubscribe: () => {
          this.socket.disconnect();
        } 
      };

    });
  }

  //Disconnets the socket
  disconnect(){
    this.socket.disconnect();
  }
}

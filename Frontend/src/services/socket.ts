import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private static instance: SocketService;

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(serverUrl: string = 'http://localhost:3000'): void {
    if (this.socket) {
      return;
    }

    // Get JWT token for authentication
    const token = localStorage.getItem('token');
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token && token !== 'demo-token' ? token : undefined
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server via Socket.IO');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Backend event listeners
  public onAttendanceMarked(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('attendance-marked', callback);
    }
  }

  public onLiveStatsUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('live-stats-update', callback);
    }
  }

  public onNotification(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Legacy event listeners (for backward compatibility)
  public onAttendanceUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('attendance_updated', callback);
    }
  }

  public onActivityUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('activity_updated', callback);
    }
  }

  // Client emits
  public joinClass(classId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-class', { classId });
    }
  }

  public sendAttendanceUpdate(data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('attendance_update', data);
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = SocketService.getInstance();
export default socketService;

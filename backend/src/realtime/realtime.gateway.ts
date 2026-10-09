import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

/**
 * Real-time layer. Clients join per-user and per-thread rooms; the server
 * pushes chat messages and order/escrow status changes as they happen in
 * the database, instead of the frontend having to poll.
 */
@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join:user')
  joinUser(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user:${userId}`);
  }

  @SubscribeMessage('join:thread')
  joinThread(@MessageBody() threadId: string, @ConnectedSocket() client: Socket) {
    client.join(`thread:${threadId}`);
  }

  emitChatMessage(threadId: string, message: unknown) {
    this.server?.to(`thread:${threadId}`).emit('chat:message', message);
  }

  emitOrderUpdate(orderId: string, status: string) {
    this.server?.emit('order:update', { orderId, status });
  }

  emitFraudQueueUpdate(item: unknown) {
    this.server?.to('admin').emit('fraud:update', item);
  }

  @SubscribeMessage('join:admin')
  joinAdmin(@ConnectedSocket() client: Socket) {
    client.join('admin');
  }
}

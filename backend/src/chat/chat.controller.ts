import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class ChatController {
  constructor(private svc: ChatService) {}

  @Get('chat/threads')
  threads(@Req() req: any) { return ok(this.svc.threadsFor(req.user.id)); }

  @Get('chat/threads/:id/messages')
  messages(@Param('id') id: string) { return ok(this.svc.messages(id)); }

  @Post('chat/threads/:id/messages')
  send(@Req() req: any, @Param('id') id: string, @Body() body: { body: string }) {
    return ok(this.svc.send(req.user.id, id, body.body));
  }
}

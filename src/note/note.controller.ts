import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MyJwtGuard } from '../auth/guard';
import { NoteService } from './note.service';
import { GetUser } from '../auth/decorator';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';

@UseGuards(MyJwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Get()
  getNotes(@GetUser('id') userId: number) {
    return this.noteService.getNotes(userId);
  }

  @Get(':id')
  getNoteById(@Param('id', ParseIntPipe) noteId: number) {
    return this.noteService.getNoteById(noteId);
  }

  @Post()
  createNote(@GetUser('id') userId: number, @Body() body: InsertNoteDTO) {
    return this.noteService.createNote(userId, body);
  }

  @Patch(':id')
  updateNoteById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) noteId: number,
    @Body() body: UpdateNoteDTO,
  ) {
    return this.noteService.updateNoteById(userId, noteId, body);
  }

  @Delete(':id')
  deleteNoteById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) noteId: number,
  ) {
    return this.noteService.deleteNoteById(userId, noteId);
  }
}

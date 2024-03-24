import { Injectable } from '@nestjs/common';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}

  getNotes(userId: number) {
    return this.prismaService.note.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
      },
    });
  }

  getNoteById(noteId: number) {
    return this.prismaService.note.findUnique({
      where: {
        id: noteId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
      },
    });
  }

  createNote(userId: number, body: InsertNoteDTO) {
    return this.prismaService.note.create({
      data: {
        ...body,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
      },
    });
  }

  updateNoteById(
    userId: number,
    noteId: number,

    body: UpdateNoteDTO,
  ) {
    return this.prismaService.note.update({
      where: {
        id: noteId,
        userId,
      },
      data: {
        ...body,
      },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
      },
    });
  }

  deleteNoteById(userId: number, noteId: number) {
    return this.prismaService.note.delete({
      where: {
        id: noteId,
        userId,
      },
      select: {
        id: true,
      },
    });
  }
}

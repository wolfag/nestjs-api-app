import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { gte } from 'pactum-matchers';

const PORT = 3002;

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = appModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.listen(PORT);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${PORT}`);
  });

  afterAll(async () => {
    app.close();
  });

  it.todo('should pass');

  describe('Test Authentication', () => {
    describe('Register', () => {
      it('should register', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'email@gmail.com',
            password: '123456',
          })
          .expectStatus(201)
          .stores('userId', 'res.body.id');
        // .inspect();
      });
      it('should show error if email is invalid', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'emailgmail.com',
            password: '123456',
          })
          .expectStatus(400);
        // .inspect();
      });
      it('should show error if email is empty', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: '',
            password: '123456',
          })
          .expectStatus(400);
        // .inspect();
      });
      it('should show error if password is empty', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'email@gmail.com',
            password: '',
          })
          .expectStatus(400);
        // .inspect();
      });
    });

    describe('Login', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            email: 'email@gmail.com',
            password: '123456',
          })
          .expectStatus(201)
          .stores('accessToken', 'accessToken');
        // .inspect();
      });
      it('should show error if email is invalid', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            email: 'emailgmail.com',
            password: '123456',
          })
          .expectStatus(400);
        // .inspect();
      });
      it('should show error if email is empty', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            email: '',
            password: '123456',
          })
          .expectStatus(400);
        // .inspect();
      });
      it('should show error if password is empty', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            email: 'email@gmail.com',
            password: '',
          })
          .expectStatus(400);
        // .inspect();
      });
    });

    describe('User detail', () => {
      it('should get user detail', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .expectStatus(200)
          .expectJson({
            email: 'email@gmail.com',
            firstName: '',
            id: '$S{userId}',
            lastName: '',
          });
      });
      it('should error if miss token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });

    describe('Note', () => {
      const note = { title: 'title', description: 'description', url: 'url' };
      describe('Insert note', () => {
        it('should insert note success', () => {
          return pactum
            .spec()
            .post('/notes')
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withBody({
              ...note,
            })
            .expectStatus(201)
            .stores('noteId', 'res.body.id')
            .expectJsonLike({
              ...note,
              id: /\d+/,
            });
          // .inspect();
        });
        it('should insert note success without description', () => {
          return pactum
            .spec()
            .post('/notes')
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withBody({
              title: 'title',
              url: 'url',
            })
            .expectStatus(201)
            .expectJsonLike({
              id: /\d+/,
              title: 'title',
              url: 'url',
            });
          // .inspect();
        });
        it('should insert note fail if no token', () => {
          return pactum
            .spec()
            .post('/notes')
            .withBody({
              title: 'title',
              description: 'description',
              url: 'url',
            })
            .expectStatus(401);
          // .inspect();
        });
        it('should insert note fail if no title', () => {
          return pactum
            .spec()
            .post('/notes')
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withBody({
              url: 'url',
            })
            .expectStatus(400);
          // .inspect();
        });
        it('should insert note fail if no url', () => {
          return pactum
            .spec()
            .post('/notes')
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withBody({
              title: 'title',
            })
            .expectStatus(400);
          // .inspect();
        });
      });
      describe('Get all note', () => {
        it('should get all note', () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .expectStatus(200)
            .expectJsonLength('.', gte(1));
          // .inspect();
        });
        it('should get all note fail if no token', () => {
          return pactum.spec().get('/notes').expectStatus(401);
          // .inspect();
        });
      });
      describe('Get note by id', () => {
        it('should get note by id', () => {
          return pactum
            .spec()
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withPathParams('id', '$S{noteId}')
            .get('/notes/{id}')
            .expectStatus(200)
            .expectJson({
              ...note,
              id: '$S{noteId}',
            })
            .inspect();
        });
        it('should get note by id fail if no token', () => {
          return pactum
            .spec()
            .withPathParams('id', '$S{noteId}')
            .get('/notes/{id}')
            .expectStatus(401);
          // .inspect();
        });
      });
      describe('Update note by id', () => {
        it('should update note title by id', () => {
          return pactum
            .spec()
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withPathParams('id', '$S{noteId}')
            .withBody({
              title: 'titleupdate',
            })
            .patch('/notes/{id}')
            .expectStatus(200)
            .expectJsonLike({
              ...note,
              title: 'titleupdate',
            });
        });
        it('should update note description by id', () => {
          return pactum
            .spec()
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withPathParams('id', '$S{noteId}')
            .withBody({
              description: 'descriptionupdate',
            })
            .patch('/notes/{id}')
            .expectStatus(200)
            .expectJsonLike({
              ...note,
              title: 'titleupdate',
              description: 'descriptionupdate',
            });
        });
        it('should update note url by id', () => {
          return pactum
            .spec()
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withPathParams('id', '$S{noteId}')
            .withBody({
              url: 'urlupdate',
            })
            .patch('/notes/{id}')
            .expectStatus(200)
            .expectJsonLike({
              ...note,
              title: 'titleupdate',
              description: 'descriptionupdate',
              url: 'urlupdate',
            });
        });
        it('should update note by id fail if no token', () => {
          return pactum
            .spec()
            .withPathParams('id', '$S{noteId}')
            .withBody({
              title: 'title',
            })
            .patch('/notes/{id}')
            .expectStatus(401);
          // .inspect();
        });
      });
      describe('Delete note by id', () => {
        it('should delete note by id', () => {
          return pactum
            .spec()
            .withHeaders({ Authorization: `Bearer $S{accessToken}` })
            .withPathParams('id', '$S{noteId}')
            .delete('/notes/{id}')
            .expectStatus(200)
            .expectJson({
              id: '$S{noteId}',
            });
          // .inspect();
        });
        it('should delete note by id fail if no token', () => {
          return pactum
            .spec()
            .withPathParams('id', '$S{noteId}')
            .delete('/notes/{id}')
            .expectStatus(401);
          // .inspect();
        });
      });
    });
  });
});

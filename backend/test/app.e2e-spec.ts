import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token: string; // Store auth token here

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'string' });
    console.log(authResponse.body);
    token = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return 200 OK', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${token}`) // 🔹 Add auth token
      .expect(200)
      .expect('Hello World!');
  });
});

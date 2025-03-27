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

    // 🔹 Fetch authentication token before running tests
    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login') // Adjust endpoint if needed
      .send({ email: 'user@example.com', password: 'string' });
    console.log(authResponse.body);
    token = authResponse.body.accessToken; // Adjust based on your API response
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

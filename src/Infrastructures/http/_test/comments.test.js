const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  let accessToken;
  let threadId;
  let server;

  beforeEach(async () => {
    const addUserPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };

    const userLoginPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const addThreadPayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    server = await createServer(container);

    /** add user */
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: addUserPayload,
    });

    /** user login */
    const responseLogin = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayload,
    });

    const { data: { accessToken: token } } = JSON.parse(responseLogin.payload);
    accessToken = token;

    /** add thread */
    const addedThread = await server.inject({
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      url: '/threads',
      payload: addThreadPayload,
    });

    const { data: { addedThread: { id: addedThreadId } } } = JSON.parse(addedThread.payload);
    threadId = addedThreadId;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 401 Unauthorized when user not login', async () => {
      // arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 NotFoundError when thread is not found', async () => {
      // arrange
      threadId = 'thread-123';
      const requestPayload = {
        content: 'sebuah comment',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/'${threadId}'/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan!');
    });

    it('should response 400 InvariantError when request payload not contain needed property', async () => {
      // arrange
      const requestPayload = {
        content: '',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 InvariantError when request payload not meet data type specification', async () => {
      // arrange
      const requestPayload = {
        content: 123,
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar baru karena tipe data tidak sesuai');
    });
  });
});

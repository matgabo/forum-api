const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let accessToken;
  let server;
  let threadId;

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
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);

      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should throw an UnauthorizedError when user not login', async () => {
      // arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: '',
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: true,
      };

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and persisted thread', async () => {
      // arrange
      const addCommentPayload = {
        content: 'sebuah comment',
      };

      /** create comment on added thread */
      await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: addCommentPayload,
      });

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);

      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();

      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0]).toBeDefined();
    });

    it('should response 200 and return deleted comment correctly', async () => {
      // arrange
      const addCommentAPayload = {
        content: 'sebuah comment',
      };

      const addCommentBPayload = {
        content: 'comment akan dihapus',
      };

      /** add first comment on added thread */
      await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: addCommentAPayload,
      });

      /** add second comment on added thread */
      const commentBResponse = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: addCommentBPayload,
      });
      const { data: { addedComment: { id: commentBResponseId } } } = JSON
        .parse(commentBResponse.payload);
      const commentId = commentBResponseId;

      /** delete second comment on added thread */
      await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      console.log(responseJson.data.thread.comments);
      expect(response.statusCode).toEqual(200);

      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0]).toBeDefined();
      expect(responseJson.data.thread.comments[1]).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('sebuah comment');
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
      /** belum ada statement untuk validasi komentar sudah diurutkan berdasarkan tanggal */
    });

    it('should response 404 not found error when thread is not found', async () => {
      // arrange
      const notFoundThreadId = 'thread-missing';

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${notFoundThreadId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);

      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan!');
    });
  });
});

const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
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

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
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

    it('should throw an UnauthorizedError when user not login', async () => {
      // arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/{threadId}/comments',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads/{threadId}/comments',
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan!');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // arrange
      const requestPayload = {
        content: '',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat menambahkan komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // arrange
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat menambahkan komentar baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment correctly', async () => {
      // arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      const createdComment = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
      });

      const commentId = JSON.parse(createdComment.payload).data.addedComment.id;

      // action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments/${commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should throw UnauthorizedError when user not login', async () => {
      // arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      const createdComment = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
      });

      const commentId = JSON.parse(createdComment.payload).data.addedComment.id;

      // action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
        url: `/threads/${addedThreadId}/comments/${commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw 404 not found error when comment not found', async () => {
      // arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const requestAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuth = JSON.parse(requestAuth.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      const createdComment = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
      });

      const commentId = JSON.parse(createdComment.payload).data.addedComment.id;

      // action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments/{commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should throw 403 authorization error when comment not owned by user', async () => {
      // arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'john',
          password: 'secret',
          fullname: 'John Doe',
        },
      });

      const requestAuthUserA = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const responseAuthUserA = JSON.parse(requestAuthUserA.payload);

      const requestAuthUserB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'john',
          password: 'secret',
        },
      });
      const responseAuthUserB = JSON.parse(requestAuthUserB.payload);

      const addedThread = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuthUserA.data.accessToken}`,
        },
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
      });

      const addedThreadId = JSON.parse(addedThread.payload).data.addedThread.id;

      const createdComment = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuthUserA.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
      });

      const commentId = JSON.parse(createdComment.payload).data.addedComment.id;

      // action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${responseAuthUserB.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments/${commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak menghapus comment ini!');
    });
  });
});

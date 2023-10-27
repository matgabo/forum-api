const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
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

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
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

      const server = await createServer(container);

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

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
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

      // action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
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

      const thread = await server.inject({
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
      const threadId = JSON.parse(thread.payload).data.addedThread.id;

      await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah comment' },
      });

      // masalahnya, kembalian comment masih berupa object

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
      expect(responseJson.data.thread.comments[0]).toBeDefined();
    });

    it('should response 200 and return deleted comment correctly', async () => {
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

      const thread = await server.inject({
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
      const addedThreadId = JSON.parse(thread.payload).data.addedThread.id;
      const { addedThread } = JSON.parse(thread.payload).data.addedThread;

      await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: { content: 'sebuah comment' },
      });

      const commentId = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments`,
        payload: { content: 'comment yang dihapus' },
      });
      const commentIdJson = JSON.parse(commentId.payload).data.addedComment.id;
      console.log(commentIdJson);

      const deletedComment = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${responseAuth.data.accessToken}`,
        },
        url: `/threads/${addedThreadId}/comments/${commentIdJson}`,
      });
      console.log(JSON.parse(deletedComment.payload));
      console.log(addedThread);

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThreadId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      console.log(responseJson);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      console.log(responseJson.data.thread);

      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.comments[0]).toBeDefined();
      expect(responseJson.data.thread.comments[1]).toBeDefined();

      const threadsDetails = await ThreadsTableTestHelper.findThreadById(addedThreadId);
      console.log(threadsDetails);

      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('sebuah comment');
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });
  });
});

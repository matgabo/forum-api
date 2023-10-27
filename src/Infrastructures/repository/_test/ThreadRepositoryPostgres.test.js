const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // arrange
      const owner = 'user-123';
      const addThread = new AddThread(owner, {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });

      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // action
      await threadRepositoryPostgres.addThread(addThread);

      // assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // arrange
      const owner = 'user-123';
      const addThread = new AddThread(owner, {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });

      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // assert
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('sebuah thread');
      expect(addedThread.owner).toEqual('user-123');
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw error when thread not found', async () => {
      // arrange
      const threadId = 'thread-123';

      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // action & assert
      await expect(threadRepositoryPostgres.verifyAvailableThread(threadId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should verify thread correctly when thread is available', async () => {
      // arrange
      const addThread = new AddThread('user-123', {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const threadId = 'thread-123';

      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(addThread);

      // action and assert
      await expect(threadRepositoryPostgres.verifyAvailableThread(threadId))
        .resolves.not.toThrowError();
    });
  });

  describe('getDetailsThreadById funtion', () => {
    it('should return thread details correctly', async () => {
      // arrange
      await ThreadsTableTestHelper.addThread({});
      const threadId = 'thread-123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // action
      const threadDetails = await threadRepositoryPostgres.getDetailsThreadById(threadId);

      // assert
      expect(threadDetails).toHaveProperty('id', 'thread-123');
      expect(threadDetails).toHaveProperty('title', 'sebuah thread');
      expect(threadDetails).toHaveProperty('body', 'sebuah body thread');
      expect(threadDetails).toHaveProperty('date');
      expect(threadDetails).toHaveProperty('username', 'dicoding');
    });
  });
});

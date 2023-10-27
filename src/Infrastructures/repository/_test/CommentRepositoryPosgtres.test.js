const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const addComment = new AddComment(owner, threadId, {
        content: 'sebuah comment',
      });

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // action
      await commentRepositoryPostgres.addComment(addComment);

      // assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return addComment correctly', async () => {
      // arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const addComment = new AddComment(owner, threadId, {
        content: 'sebuah comment',
      });

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // assert
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toEqual('comment-123');
      expect(addedComment.content).toEqual('sebuah comment');
      expect(addedComment.owner).toEqual('user-123');
    });
  });

  describe('verifyCommentById function', () => {
    it('should throw not found error when comment is not found', async () => {
      // arrange
      const commentId = '';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // action and assert
      await expect(commentRepositoryPostgres.verifyCommentById(commentId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should verify comment correctly when comment is found', async () => {
      // arrange
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // action and assert
      await expect(commentRepositoryPostgres.verifyCommentById(commentId))
        .resolves.not.toThrowError();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw authorization error when comment is not owned by user', async () => {
      // arrange
      const owner = '';
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // action and assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(owner, commentId))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should verify comment correctly when comment is found and owned by user', async () => {
      // arrange
      const owner = 'user-123';
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // action and assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(owner, commentId))
        .resolves.not.toThrowError();
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // arrange
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getThreadCommentById function', () => {
    it('should return thread comment correctly', async () => {
      // arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({ id: commentId });

      // action
      await commentRepositoryPostgres.getThreadCommentById(threadId);

      // assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(commentId);
      expect(comments[0].is_delete).toEqual(false);
    });
  });
});

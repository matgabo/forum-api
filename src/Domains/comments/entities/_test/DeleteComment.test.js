const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entities', () => {
  it('should throw error when owner is invalid', () => {
    // arrange
    const owner = '';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when owner did not meet data specification', () => {
    // arrange
    const owner = 123;
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = '';

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data specification', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 123;

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should throw error when threadId is invalid', () => {
    // arrange
    const owner = 'user-123';
    const threadId = '';
    const commentId = 'comment-123';

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when commentId is invalid', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = '';

    // action and assert
    expect(() => new DeleteComment(owner, threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should not to throw error when payload meet all needed property', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // action
    const deleteComment = new DeleteComment(owner, threadId, commentId);

    // assert
    expect(() => new DeleteComment(owner, threadId, commentId)).not.toThrowError(Error);
    expect(deleteComment).toBeInstanceOf(DeleteComment);

    expect(deleteComment.owner).toEqual(owner);
    expect(deleteComment.threadId).toEqual(threadId);
    expect(deleteComment.commentId).toEqual(commentId);
  });
});

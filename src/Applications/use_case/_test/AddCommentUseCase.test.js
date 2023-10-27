const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // arrange
    const useCaseThreadId = 'thread-123';
    const useCaseOwner = 'user-123';
    const useCasePayload = {
      content: 'sebuah comment',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCaseOwner,
    });

    /** dependency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mock */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // action
    const addedComment = await addCommentUseCase
      .execute(useCaseOwner, useCaseThreadId, useCasePayload);

    // assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCaseOwner,
    }));

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseThreadId);

    expect(mockCommentRepository.addComment)
      .toBeCalledWith(new AddComment(useCaseOwner, useCaseThreadId, {
        content: useCasePayload.content,
      }));
  });
});

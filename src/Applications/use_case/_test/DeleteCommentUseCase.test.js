const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment action correctly', async () => {
    // arrange
    const useCaseOwner = 'user-123';
    const useCaseThreadId = 'thread-123';
    const useCaseCommentId = 'comment-123';

    /** dependency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // action and assert
    await expect(deleteCommentUseCase.execute(useCaseOwner, useCaseThreadId, useCaseCommentId))
      .resolves.not.toThrowError();

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseThreadId);
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(useCaseCommentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCaseOwner, useCaseCommentId);
    expect(mockCommentRepository.deleteCommentById)
      .toBeCalledWith(useCaseCommentId);
  });
});

const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');

describe('GetThreadDetailsUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    // arrange
    const useCaseThreadId = 'thread-123';

    const expectedCommentDetails = ({
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: '**komentar telah dihapus**',
    });

    const expectedThreadDetails = new ThreadDetails({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date().toISOString(),
      username: 'dicoding',
      comments: [expectedCommentDetails],
    });

    /** dependency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getThreadCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: new Date().toISOString(),
          content: 'komentar akan dihapus',
          is_delete: true,
        },
      ]));

    mockThreadRepository.getDetailsThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date().toISOString(),
        username: 'dicoding',
      }));

    /** instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // action
    const threadDetails = await getThreadDetailsUseCase.execute(useCaseThreadId);

    // assert
    console.log(threadDetails);
    console.log(expectedThreadDetails);

    expect(threadDetails).toStrictEqual(expectedThreadDetails);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseThreadId);
    expect(mockCommentRepository.getThreadCommentById).toBeCalledWith(useCaseThreadId);
    expect(mockThreadRepository.getDetailsThreadById).toBeCalledWith(useCaseThreadId);
  });
});

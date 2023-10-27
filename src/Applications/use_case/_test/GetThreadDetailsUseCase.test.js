const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');

describe('GetThreadDetailsUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    // arrange
    const useCaseThreadId = 'thread-123';

    const expectedThreadDetails = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2023-10-25T15:58:20.407Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023-10-25T15:58:20.407Z',
          content: 'sebuah komentar',
        },
      ],
    };

    /** dependency */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getThreadCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-123',
        username: 'dicoding',
        date: '2023-10-25T15:58:20.407Z',
        content: 'sebuah komentar',
        is_delete: false,
      }]));

    mockThreadRepository.getDetailsThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: useCaseThreadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2023-10-25T15:58:20.407Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2023-10-25T15:58:20.407Z',
            content: 'sebuah komentar',
            is_delete: false,
          },
        ],
      }));

    /** instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // action
    const threadDetails = await getThreadDetailsUseCase.execute(useCaseThreadId);

    // assert
    expect(threadDetails).toStrictEqual(expectedThreadDetails);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseThreadId);
    expect(mockCommentRepository.getThreadCommentById).toBeCalledWith(useCaseThreadId);
    expect(mockThreadRepository.getDetailsThreadById).toBeCalledWith(useCaseThreadId);
  });
});

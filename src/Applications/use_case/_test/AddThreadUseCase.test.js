const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // arrange
    const useCaseOwner = 'user-123';
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCaseOwner,
    });

    /** dependency */
    const mockThreadRepository = new ThreadRepository();

    /** mock */
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread));

    /** instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // action
    const addedThread = await addThreadUseCase.execute(useCaseOwner, useCasePayload);

    // assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCaseOwner,
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread(
        useCaseOwner,
        useCasePayload,
      ),
    );
  });
});

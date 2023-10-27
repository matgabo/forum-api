const ThreadDetails = require('../ThreadDetails');

describe('an ThreadDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2022-10-25T07:19:09.775Z',
      username: '',
    };

    // action and assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // arrange
    const payload = {
      id: 123,
      title: true,
      body: 'sebuah body thread',
      date: '2022-10-25T07:19:09.775Z',
      username: 'user-123',
      comments: [],
    };

    // action and assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create threadDetails object correctly', () => {
    // arrange
    const payload = {
      id: 'user-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date().toISOString(),
      username: 'user-123',
    };

    // action
    const threadDetails = new ThreadDetails(payload);

    // assert
    expect(threadDetails).toBeInstanceOf(ThreadDetails);
    expect(threadDetails.id).toEqual(payload.id);
    expect(threadDetails.title).toEqual(payload.title);
    expect(threadDetails.body).toEqual(payload.body);
    expect(threadDetails.date).toEqual(payload.date);
    expect(threadDetails.username).toEqual(payload.username);
  });
});

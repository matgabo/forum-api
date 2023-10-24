const AddComment = require('../AddComment');

describe('an AddComment entities', () => {
  it('should throw error when owner is invalid', () => {
    // arrange
    const owner = '';
    const threadId = 'thread-123';
    const payload = {
      content: 'sebuah comment',
    };

    // action and assert
    expect(() => new AddComment(owner, threadId, payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when owner did not meet data specification', () => {
    // arrange
    const owner = 123;
    const threadId = 'thread-123';
    const payload = {
      content: 'sebuah comment',
    };

    // action and assert
    expect(() => new AddComment(owner, threadId, payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const payload = {
      content: '',
    };

    // action and assert
    expect(() => new AddComment(owner, threadId, payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data specification', () => {
    // arrange
    const owner = 'user-123';
    const threadId = 'thread-123';
    const payload = {
      content: 123,
    };

    // action and assert
    expect(() => new AddComment(owner, threadId, payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when threadId is invalid', () => {
    // arrange
    const owner = 'user-123';
    const threadId = '';
    const payload = {
      content: 123,
    };

    // action and assert
    expect(() => new AddComment(owner, threadId, payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should create addComment object correctly', () => {
    // arrange
    const expectedOwner = 'user-123';
    const expectedThreadId = 'thread-123';
    const payload = {
      content: 'sebuah comment',
    };

    // action
    const { owner, threadId, content } = new AddComment(expectedOwner, expectedThreadId, payload);

    // assert
    expect(owner).toEqual(expectedOwner);
    expect(threadId).toEqual(expectedThreadId);
    expect(content).toEqual(payload.content);
  });
});

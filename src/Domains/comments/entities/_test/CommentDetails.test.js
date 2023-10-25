const CommentDetails = require('../CommentDetails');

describe('CommentDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: '',
    };

    // action and assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // arrange
    const payload = {
      id: 123,
      username: true,
      date: new Date().toISOString(),
      content: 'sebuah comment',
    };

    // action and assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetails entities correctly', () => {
    // arrange
    const payload = {
      id: 'user-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: 'sebuah comment',
    };

    // action
    const commentDetails = new CommentDetails(payload);

    // assert
    expect(commentDetails).toBeInstanceOf(CommentDetails);
    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(payload.date);
    expect(commentDetails.content).toEqual(payload.content);
  });
});

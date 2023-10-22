const AddThread = require('../AddThread');

describe('an AddThread entities', () => {
  it('should throw error when owner is invalid', () => {
    // arrange
    const owner = '';
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // action and assert
    expect(() => new AddThread(owner, payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when owner did not meet data specification', () => {
    // arrange
    const owner = 123;
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // action and assert
    expect(() => new AddThread(owner, payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const owner = 'user-123';
    const payload = {
      title: 'sebuah thread',
    };

    // action and assert
    expect(() => new AddThread(owner, payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload when payload did not meet data type specification', () => {
    // arrange
    const owner = 'user-123';
    const payload = {
      title: 123,
      body: 'sebuah body thread',
    };

    // action and assert
    expect(() => new AddThread(owner, payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    // arrange
    const expectedOwner = 'user-123';
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // action
    const { owner, title, body } = new AddThread(expectedOwner, payload);

    // assert
    expect(owner).toEqual(expectedOwner);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});

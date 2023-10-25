const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, threadId, useCasePayload) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const comment = new AddComment(owner, threadId, useCasePayload);
    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;

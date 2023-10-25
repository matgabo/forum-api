class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, threadId, commentId) {
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyCommentById(commentId);
    await this._commentRepository.verifyCommentOwner(owner, commentId);

    return this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;

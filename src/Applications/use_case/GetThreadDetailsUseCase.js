class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyAvailableThread(threadId);

    const threadComments = await this._commentRepository.getThreadCommentById(threadId);

    const thread = await this._threadRepository.getDetailsThreadById(threadId);

    const updatedComments = threadComments.map((comment) => {
      if (comment.is_delete === true) {
        comment.content = '**komentar telah dihapus**';
      }
      delete comment.is_delete;
      return comment;
    });

    return ({
      ...thread,
      comments: updatedComments,
    });
  }
}

module.exports = GetThreadDetailsUseCase;

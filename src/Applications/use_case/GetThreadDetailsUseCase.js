const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');

class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const threadComments = await this._commentRepository.getThreadCommentById(threadId);
    const threadDetails = await this._threadRepository.getDetailsThreadById(threadId);

    threadComments.forEach((comment) => {
      if (comment.is_delete === true) {
        comment.content = '**komentar telah dihapus**';
      }

      delete comment.is_delete;
    });

    return new ThreadDetails({
      ...threadDetails,
      comments: threadComments,
    });
  }
}

module.exports = GetThreadDetailsUseCase;

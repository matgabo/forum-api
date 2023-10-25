class DeleteComment {
  constructor(owner, threadId, commentId) {
    this._verifyParamsAndPayload(owner, threadId, commentId);

    this.owner = owner;
    this.threadId = threadId;
    this.commentId = commentId;
  }

  _verifyParamsAndPayload(owner, threadId, commentId) {
    if (!owner || !threadId || !commentId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;

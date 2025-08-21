export default function CommentItem({ comment }) {
  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <img 
          src={comment.imageUrl} 
          alt={`${comment.username}'s avatar`}
          className="avatar-image"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`;
          }}
        />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-username">{comment.username}</span>
          <span className="comment-timestamp">{comment.timestamp}</span>
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
    </div>
  )
} 
import RobotProfileImage from '../assets/robot.png';
import UserProfileImage from '../assets/user1.png';
import './ChatMessage.css'
export function ChatMessage({ message, sender }) {
  // const { message, sender } = props;
  // const message = props.message;
  // const sender = props.sender;
  return (
    <div
      className={sender === "user" ? "chat-message-user" : "chat-message-bot"}
    >
      {sender === "bot" && (
        <img src={RobotProfileImage} className="chat-message-profile" />
      )}
      <div className="chat-message-text">{message}</div>
      {sender === "user" && (
        <img src={UserProfileImage} className="chat-message-profile" />
      )}
    </div>
  );
}
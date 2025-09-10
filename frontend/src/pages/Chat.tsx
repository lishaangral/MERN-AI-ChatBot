import { useRef } from 'react'
import { useAuth } from '../context/useAuth.ts';
import {IoMdSend} from 'react-icons/io';

// type Message = {
//   role: "user" | "assistant",
//   content:string,
// }
const Chat = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();

  // const [chatMessages, setchatMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    console.log(inputRef.current?.value);
    // const content = inputRef.current?.value as string;
    // if (inputRef && inputRef.current) {
    //   inputRef.current.value = "";
    // }
    // const newMessage: Message = {role: "user", content};
    // setchatMessages((prev) => [...prev, newMessage]);
    // comst chatData = await sendChatRequest(content); 
    // setChatMessages([...chatData.chats]);
  }

  return (
    <div>
      {auth?.user?.name}'s Chat
      <div>
        
        <input ref={inputRef}></input>
        <button onClick={handleSubmit}><IoMdSend /></button>
      </div>
    </div>
  )
}

export default Chat
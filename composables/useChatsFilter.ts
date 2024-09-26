export const useChatsFilter = () => {
  // ?order_by=updated_at:desc,name:desc,model:desc
  const chatsFilter = useState('chats-filter', () => ref(''));
  return chatsFilter;
}

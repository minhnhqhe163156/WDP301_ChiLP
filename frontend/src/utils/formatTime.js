// Định dạng thời gian hiển thị
export const formatMessageTime = (date) => {
  // Nếu tin nhắn từ hôm nay, hiển thị giờ
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default formatMessageTime;
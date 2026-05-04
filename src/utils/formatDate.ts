export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let dayString = '';
  if (diffDays === 0) {
    dayString = 'Сегодня';
  } else if (diffDays === 1) {
    dayString = 'Вчера';
  } else if (diffDays < 5) {
    dayString = `${diffDays} дня назад`;
  } else {
    dayString = `${diffDays} дней назад`;
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${dayString}, ${hours}:${minutes}`;
};
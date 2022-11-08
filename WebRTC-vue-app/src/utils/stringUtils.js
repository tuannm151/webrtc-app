export const generateBgColor = (id) => {
  // id is a string
  const colors = [
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-gray-500',
  ];

  // add up all the char codes
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % colors.length;
  return colors[index];
};

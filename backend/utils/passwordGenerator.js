/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Generated password
 */
const generatePassword = (length = 12) => {
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  let password = '';
  
  // Ensure at least one character from each category
  password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
  password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
  password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
  password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

  // Fill the rest with random characters
  const allChars = charset.uppercase + charset.lowercase + charset.numbers + charset.symbols;
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a simple password for display purposes
 * @param {number} length - Length of password (default: 8)
 * @returns {string} - Generated password
 */
const generateSimplePassword = (length = 8) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return password;
};

module.exports = {
  generatePassword,
  generateSimplePassword
};

// Create the utils directory and logger file
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  
  error: (message, error = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR', 
      timestamp: new Date().toISOString(),
      message,
      error: error.message || error,
      stack: error.stack
    }));
  },
  
  warn: (message, data = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(), 
      message,
      ...data
    }));
  }
};

module.exports = logger;S
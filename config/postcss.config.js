const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    process.env.HUGO_ENVIRONMENT !== 'development' ? autoprefixer() : null,
  ],
};

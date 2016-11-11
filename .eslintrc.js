module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'no-console': 0,
    'no-param-reassign': 0,
    'object-curly-spacing': 0,
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'ignore',
    }],
  }
};

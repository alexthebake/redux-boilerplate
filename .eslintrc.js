module.exports = {
  "extends": "airbnb",
  "env": {
    "es6": true,
    "mocha": true
  },
  "globals": {
    // lodash
    "_": true,
    // testing stuff
    "assert": true,
    "expect": true,
    "sinon": true,
  },
  "rules": {
    "import/prefer-default-export": "off",
  },
};

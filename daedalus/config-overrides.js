const {
    override,
    addDecoratorsLegacy,
    //disableEsLint,
    //see more functions in the customize-cra repo in github
  } = require("customize-cra");

module.exports = override(addDecoratorsLegacy());
/**
 * Hydro configuration
 *
 * @param {Hydro} hydro
 */

module.exports = function(hydro) {
  require('babel-core/register')({
    extensions: ['.js']
  })
  hydro.set({
    timeout: 500,
    plugins: [
      require('hydro-bdd')
    ]
  })
}

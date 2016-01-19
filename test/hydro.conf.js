/**
 * Hydro configuration
 *
 * @param {Hydro} hydro
 */

module.exports = function(hydro) {
  hydro.set({
    timeout: 500,
    plugins: [
      require('hydro-bdd')
    ]
  })
}

/* eslint-env node */
const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    boot: [
      'axios',
      'pinia'
    ],
    css: [
      'app.scss'
    ],
    extras: [
      'roboto-font',
      'material-icons'
    ],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'hash'
    },
    devServer: {
      port: 9000,
      open: true
    },
    framework: {
      config: {},
      lang: 'es',
      plugins: [
        'Notify',
        'Loading',
        'Dialog'
      ]
    },
    animations: []
  }
})

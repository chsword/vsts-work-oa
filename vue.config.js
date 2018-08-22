module.exports = {
  baseUrl: process.env.NODE_ENV=='development'?'/': './',

  devServer: {
  },

  outputDir: undefined,
  assetsDir: 'lib',
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined
}
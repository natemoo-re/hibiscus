exports.config = {
  namespace: 'hibiscus',
  generateDistribution: false,
  generateWWW: true,
  distDir: 'dist/',
  srcDir: 'src/',
  copy: [
    { src: 'index.html' }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}

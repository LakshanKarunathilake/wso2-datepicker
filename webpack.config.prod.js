const CopyWebpackPlugin = require('copy-webpack-plugin');
const widgetConf = require('./resources/widgetConf.json');

const APP_NAME = widgetConf.name;

module.exports = {
  entry: './src/Widget/MyWidget.jsx',
  output: {
    path: `${__dirname}/dist/${APP_NAME}`,
    publicPath: '/',
    filename: `${APP_NAME}.js`,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader' }],
      },
      {
        test: /\.(png|jpg|svg|cur|gif|eot|svg|ttf|woff|woff2)$/,
        use: ['url-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /MyWidget.jsx/,
        loader: 'string-replace-loader',
        options: {
          search: '../../Mocking/Widget',
          replace: '@wso2-dashboards/widget',
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './resources/widgetConf.json',
      },
    ]),
  ],
};

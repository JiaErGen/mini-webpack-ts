const path = require('path')
const fs = require('fs')
const WebpackBar = require('webpackbar');
const DeleteAssetsWebpackPlugin = require('delete-assets-webpack-plugin');

// src目录
const src = path.join(__dirname, './src')
// dist目录
const dist = path.join(__dirname, './dist')

module.exports = {
  // 上下文
  context: src,
  entry: () => getEntry(src),
  // 配置出口
  output: {
    clean: true,
    path: dist,
  },
  // 配置输出信息
  stats: 'errors-warnings',
  // 观察模式，会自动监听文件变化
  watch: true,
  mode: 'development',
  module: {
    rules: [
      // 先使用less loader 处理，后在通过 file-loader 将文件放到指定位置
      {
        test: /\.less$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].wxss',
            },
          },
          {
            loader: 'less-loader',
          },
        ]
      },
      // file-loader 将文件放到指定位置
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].json',
            },
          },
        ],
      },
      // 处理 ts 和 js 文件
      {
        test: /\.(ts|js)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].js',
              outputPath: (url) => {
                if (url.startsWith('_/')) {
                  return url.substr(2);
                }
                return url;
              },
            },
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: '90',
                    },
                  },
                ],
                '@babel/preset-typescript',
              ],
            }
          }
        ]
      },
      // 处理图片等资源
      {
        test: /\.(png|svg|jpg|jpeg|gif|md|axml|acss|sjs|wxs|wxss|DS_Store|snap|txt|ttf|woff|woff2)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ]
      },
    ]
  },
  plugins: [
    new DeleteAssetsWebpackPlugin(['main.js']), // 删除 main.js
    new WebpackBar(), // 进度条
  ],
}

// 获取指定目录下的全部文件
function getEntry(dir, list = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach((item) => {
    const pathName = path.join(dir, item.name);
    if (item.isDirectory()) {
      getEntry(pathName, list);
    } else {
      list.push(pathName);
    }
  });
  return list;
}

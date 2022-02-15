# webpack配置小程序ts less

在微信、百度、字节小程序中如何支持typescript less 或者 sass 
目前微信已经支持了 typescript 和 less，但是百度和字节等小程序还不支持，如果需要支持我们可以使用webpack进行一些配置就能支持，并且还可以支持eslint等辅助开发的功能 
以微信小程序举例，新建完一个项目应该是如下目录 

[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861257-3fc8bf87-ea84-48c3-8fbb-d7aa2138c8c3.png?x-oss-process=image%2Fresize%2Cw_912%2Climit_0)]()

#### 1.修改文件目录 
在新建一个src目录，把小程序代码全部放进去，后面webpack读取该目录下所有文件进行打包 
[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861136-74da21cb-d2d6-4f3d-8a52-6070ed5db32f.png?x-oss-process=image%2Fresize%2Cw_986%2Climit_0)]()

#### 2.npm init -y 
在项目目录下执行 npm init -y，后面会进行安装一些依赖

[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861182-f0a2e9d3-2a03-4d6e-a774-c5f2fbe9130b.png?x-oss-process=image%2Fresize%2Cw_1500%2Climit_0)]()

#### 3.安装项目所需要的依赖
安装webpack 和 相关loader
用于webpack构建 
``` javascript
// 安装webpack
yarn add webpack webpack-cli --dev
// 或者 npm install --save-dev webpack webpack-cli 

// 用于处理文件，将src的文件放置到dist 
yarn add file-loader --dev 

// 安装其他依赖 
// less 如果需要使用less需要安装 less 和 less-loader 
yarn add less less-loader --dev 

// 处理ts 和 js bable-loader 
// 使用 babel-loader 需要安装  @babel/core
yarn add babel-loader @babel/core --dev 

// 处理js 
yarn add @babel/preset-env --dev 

// 处理ts
yarn add @babel/preset-typescript --dev 

// ts项目还需要安装 typescript
yarn add typescript --dev 
```
#### 4.插件 
``` javascript
// 进度条插件
yarn add webpackbar --dev
// 删除webpack 生成的多余 main.js文件 
yarn add delete-assets-webpack-plugin --dev 
```
#### 5.package.json 
在package.json 文件 scripts 处添加一个webpack启动配置
``` javascript
"dev": "webpack --config webpack.config.js" 
```
如果按照上面的操作走下来，package.json文件内容应该为如下内容 
``` javascript
{
  "name": "mini-webpack-ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack --config webpack.config.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.17.2",
    "@babel/preset-env": "^7.16.11",
    "@babel/preset-typescript": "^7.16.7",
    "babel-loader": "^8.2.3",
    "delete-assets-webpack-plugin": "^1.0.0",
    "file-loader": "^6.2.0",
    "less": "^4.1.2",
    "less-loader": "^10.2.0",
    "typescript": "^4.5.5",
    "webpack": "^5.68.0",
    "webpack-cli": "^4.9.2",
    "webpackbar": "^5.0.2"
  }
}
```

#### 6.webpack.config.js 
然后在项目新建一个webpack.config.js文件 
内容如下 
``` javascript
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

// 
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
```

#### 7.配置tsconfig.json 
ts项目需要 tsconfig.json，随便配置即可 
``` javascript
{
  "compilerOptions": {
    "allowJs": false,
    "module": "CommonJS",
    "lib": ["ESNext", "dom"],
    "strict": false,
    "esModuleInterop": true,
    "baseUrl": "./",
    "typeRoots": ["./node_modules/"],
  },
  "include": ["./**/*.ts"]
}
```
#### 8.npm run dev 
然后运行 npm run dev启动即可，在使用小程序模拟器打开dist下内容 
[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861147-426845b8-f756-4f00-9baa-e13000282d30.png?x-oss-process=image%2Fresize%2Cw_1112%2Climit_0)]()

#### 9.修改代码 
然后修改项目中的 .js 修改为 .ts，.wxss修改为.less 即可，然后在观察dist文件内容 

[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861119-89fcf3fe-c690-4f3a-a6dd-c0c5c814c6a0.png?x-oss-process=image%2Fresize%2Cw_1500%2Climit_0)]()

[![](https://cdn.nlark.com/yuque/0/2022/png/12388514/1644912861645-6d10f1de-6916-4bc5-84e8-61a278583f7d.png?x-oss-process=image%2Fresize%2Cw_1500%2Climit_0)]()
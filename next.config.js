const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  lessVarsFilePath: './theme/default.less',
  lessVarsFilePathAppendToEndOfContent: true,
  nextjs: {
    localIdentNameFollowDev: true,
  },

  webpack(config) {
    return config;
  },
});

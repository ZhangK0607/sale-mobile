import App from './App'

import { createSSRApp } from 'vue'

// 开发环境下启用 vConsole 进行移动端调试
// #ifdef H5
// if (process.env.NODE_ENV === 'development') {
  import('vconsole').then(({ default: VConsole }) => {
    const vConsole = new VConsole()
  })
// }
// #endif
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
import { addCommonParams } from "./event";
import { setupErrorHandling, setupUnhandledRejectionHandling } from './error';

// 定义配置项和上传信息的类型
export interface SDKConfig {
    project_id: string;  // 项目 ID
    upload_percent: number;  // 采样频率
    page_id: string;  // 页面标识（如 URL）
  }
  

  export function getUserEnvironmentInfo(): { browser_info: string, os_info: string, uid: string, timestamp: string } {
    // 浏览器信息
    const browserInfo = navigator.userAgent;

    // 获取操作系统信息
    let osInfo = "Unknown OS"; // 默认操作系统为 "Unknown"
    if (/Windows NT 10.0/.test(browserInfo)) osInfo = "Windows 10";
    else if (/Windows NT 6.1/.test(browserInfo)) osInfo = "Windows 7";
    else if (/Macintosh/.test(browserInfo)) osInfo = "Mac OS";
    else if (/Linux/.test(browserInfo)) osInfo = "Linux";
    else if (/Android/.test(browserInfo)) osInfo = "Android";
    else if (/iPhone|iPad|iPod/.test(browserInfo)) osInfo = "iOS";

    // 模拟用户 ID（在实际场景中应该通过用户认证信息获取）
    const userId = localStorage.getItem('user_id') || 'anonymous_user'; 

    // 获取当前时间
    const timestamp = new Date().toISOString();

    return { browser_info: browserInfo, os_info: osInfo, uid: userId, timestamp };
}

  
// 初始化错误捕获
function initErrorHandling() {
  setupErrorHandling();  // 设置同步错误捕获
  setupUnhandledRejectionHandling();  // 设置 Promise 错误捕获
}

  
  // register 函数：初始化 SDK 配置并上传数据
  export function register(config: SDKConfig) {
    // 获取用户环境信息
    const userEnvironment = getUserEnvironmentInfo();
  
    // 合并配置和用户环境信息
    const completeConfig: SDKConfig = {
      ...config,
    };
  
    addCommonParams(userEnvironment);

  // 设置错误捕获
    initErrorHandling();

    console.log('SDK initialized with config:', completeConfig);

  }
  
  
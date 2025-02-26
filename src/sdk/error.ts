import { sendEvent } from './event';
// 错误信息捕获：捕获同步错误
export function setupErrorHandling() {
    window.onerror = function (
      message: string | Event,  // 错误消息（可能是 Event 类型）
      source: string | undefined, // 错误发生的文件（可能是 undefined）
      lineno: number | undefined, // 错误发生的行号（可能是 undefined）
      colno: number | undefined, // 错误发生的列号（可能是 undefined）
      error: Error | null | undefined // 错误对象（可能是 null 或 undefined）
    ): boolean {
      // 如果 message 是 Event 类型，将其转换为字符串
      if (message instanceof Event) {
        message = `Error event: ${message.type}`;
      }
  
      // 如果 source 是 undefined，设置为默认值
      const sourceString = source || 'Unknown source';
  
      // 如果 lineno 或 colno 是 undefined，设置为默认值
      const lineNumber = lineno || 0;
      const columnNumber = colno || 0;
  
      // 如果 error 是 undefined，设置为 null
      const errorObject = error || null;
  
      // 构造错误上报的参数
      const errorParams = {
        message,
        source: sourceString,
        lineno: lineNumber,
        colno: columnNumber,
        error_stack: errorObject?.stack || '',  // 错误堆栈信息
        timestamp: new Date().toISOString(),
      };
  
      sendEvent('javascript_error', errorParams, 1);  // 上报错误，采样率为 100%
      return true;  // 阻止浏览器默认处理错误（如弹出警告框）
    };
}


  // 错误信息捕获：捕获未处理的 Promise 错误
  export function setupUnhandledRejectionHandling() {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const errorParams = {
        message: event.reason?.message || 'Unknown error',
        stack: event.reason?.stack || '',
        timestamp: new Date().toISOString(),
      };
  
      sendEvent('unhandled_promise_rejection', errorParams, 1);  // 上报错误，采样率为 100%
    });
  }
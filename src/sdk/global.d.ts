declare global {
    interface Window {
      sdkProjectId?: string;  // 可选属性
      sdkUploadPercent?: number;  // 可选属性
      [key: string]: any;  // 添加索引签名，允许通过字符串索引访问属性
      onerror: (message: string, source: string, lineno: number, colno: number, error: Error) => boolean;
    }
  }

  
  export {};  // 使该文件成为一个模块，避免全局作用域污染
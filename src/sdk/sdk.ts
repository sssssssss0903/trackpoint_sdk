
// 导入相关函数
import { sendEvent } from './event';
import { register, SDKConfig,  } from './register';

// 全局对象，存储 SDK 配置信息
const defaultConfig: SDKConfig = {
  project_id: 'demo',
  upload_percent: 0.99,
  page_id: window.location.href,
};

(function() {
  // 获取项目配置，如果没有提供配置，则使用默认配置
  const sdkConfig: SDKConfig = {
    ...defaultConfig,
    project_id: window.sdkProjectId || defaultConfig.project_id,
    upload_percent: window.sdkUploadPercent || defaultConfig.upload_percent,
  };

  // 调用 register 函数，传入配置
  register(sdkConfig);

  // 自动上传页面加载事件
  window.addEventListener('load', () => {
    sendEvent('page_load', {
      page_url: window.location.href,
      page_title: document.title,
      timestamp: new Date().toISOString(),
    }, sdkConfig.upload_percent);
  });

  // 绑定按钮和链接的点击事件
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      sendEvent('button_click', {
        button_id: button.id,
        button_text: button.innerText || button.value,
        timestamp: new Date().toISOString(),
      }, sdkConfig.upload_percent);
    });
  });

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent('link_click', {
        link_href: link.href,
        link_text: link.innerText,
        timestamp: new Date().toISOString(),
      }, sdkConfig.upload_percent);
    });
  });

  // 防抖处理输入框事件
  const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeout: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    }) as T;
  };

  document.querySelectorAll('input, textarea').forEach((input: Element) => {
    const target = input as HTMLInputElement | HTMLTextAreaElement;
    target.addEventListener('input', debounce((event: Event) => {
      sendEvent('input_field_change', {
        input_id: target.id,
        input_value: target.value,
        timestamp: new Date().toISOString(),
      }, sdkConfig.upload_percent);
    }, 200));  // 缩短延迟时间为 200ms
  });

  // 自动监听页面滚动事件
  window.addEventListener('scroll', () => {
    sendEvent('page_scroll', {
      scroll_position: window.scrollY,
      page_height: document.documentElement.scrollHeight,
      timestamp: new Date().toISOString(),
    }, sdkConfig.upload_percent);
  });

  // 自动监听表单提交事件
  document.querySelectorAll('form').forEach((form: HTMLFormElement) => {
    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();  // 阻止表单默认提交行为

      sendEvent('form_submit', {
        form_id: form.id,
        form_action: form.action,
        timestamp: new Date().toISOString(),
      }, sdkConfig.upload_percent);

      // 延迟提交表单，确保事件上传后再提交
      setTimeout(() => {
        form.submit();  // 手动提交表单
      }, 500);  // 延迟 500ms 提交表单，确保事件上传
    });
  });
})();

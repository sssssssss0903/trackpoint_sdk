// 用于存储通用参数的全局对象
let commonParams: Record<string, any> = {};

// addCommonParams 函数：允许在任意时刻添加通用参数
export function addCommonParams(params: Record<string, any>) {
  // 合并新的参数到 existing commonParams
  commonParams = { ...commonParams, ...params };
  console.log('Updated common params:', commonParams);
}

function shouldReportEvent(uploadPercent: number): boolean {
  // 生成一个 [0, 1) 之间的随机数
  const random = Math.random();
  
  // 如果随机数小于采样频率，则上报事件
  return random < uploadPercent;
}
// 事件上报函数
export function sendEvent(eventName: string, params: Record<string, any>, uploadPercent: number) {
  // 判断是否需要上报
  if (shouldReportEvent(uploadPercent)) {
    // 合并通用参数和事件参数
    const eventParams = { ...commonParams, ...params };

    // 上报事件
    console.log(`Event ${eventName} uploaded with params:`, eventParams);  // 修复了这里的拼接问题
    
    // 这里通常会发送事件数据到服务器
    const apiUrl = 'http://localhost:3001/api/upload-events';  // 处理事件数据的接口
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_data: eventParams,  // 发送合并后的参数
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Event uploaded successfully:', data);
      })
      .catch((error) => {
        console.error('Error uploading event:', error);
      });
  } else {
    console.log(`Event ${eventName} skipped due to sampling rate.`);  // 修复了这里的拼接问题
  }
}

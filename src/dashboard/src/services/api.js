// src/services/api.js
import axios from 'axios';

// 创建 Axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // !!后端服务器地址
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取事件数据（例如：PV/UV 数据）
export const getEventData = async (eventName, startDate, endDate) => {
  // 确保 `startDate` 和 `endDate` 符合 MySQL `DATETIME` 格式
  const formatDateForAPI = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  };

  const formattedStartDate = formatDateForAPI(startDate);
  const formattedEndDate = formatDateForAPI(endDate);

  console.log(` Fetching event data: eventName=${eventName}, startDate=${formattedStartDate}, endDate=${formattedEndDate}`);

  try {
    const response = await api.get('/get-events-pv-uv', {
      params: {
        event_name: eventName,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      },
    });

    if (response.data && response.data.success) {
      console.log(" Received event data:", response.data.data);
      return response.data.data; // 返回数据库查询的数据
    } else {
      console.warn(" Invalid API response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching event data:', error);
    return [];
  }
};

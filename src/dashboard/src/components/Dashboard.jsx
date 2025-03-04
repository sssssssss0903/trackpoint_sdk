import React, { useState, useEffect } from 'react';
import EventChart from './EventChart';  // 引入图表组件
import { getEventData } from '../services/api';  // 引入API请求
import debounce from "lodash.debounce"; // 需要安装 `lodash.debounce`

const Dashboard = () => {
  const formatDateForInput = (date) => {
    return new Date(date).toISOString().slice(0, 16); // 只取 `YYYY-MM-DDTHH:mm`
  };

  // 设置初始时间，符合 `datetime-local` 格式
  const [eventName, setEventName] = useState('user_login');
  const [startDate, setStartDate] = useState(formatDateForInput(new Date('2025-02-18T00:00:00Z')));
  const [endDate, setEndDate] = useState(formatDateForInput(new Date('2025-02-18T23:59:59Z')));
  const [eventData, setEventData] = useState([]);

  // 处理时间变化
  const handleStartDateChange = (e) => {
    console.log("Start Date Changed:", e.target.value);
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    console.log("End Date Changed:", e.target.value);
    setEndDate(e.target.value);
  };

  // 防抖的 API 请求，避免过度请求
  const fetchEventData = debounce(async (eventName, startDate, endDate, setEventData) => {
    console.log(`Fetching event data: eventName=${eventName}, startDate=${startDate}, endDate=${endDate}`);
    
    try {
      const data = await getEventData(eventName, startDate, endDate);
      
      if (!data || data.length === 0) {
        console.warn("No data received from API.");
      } else {
        console.log("Fetched event data:", data);
      }
      
      setEventData(data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  }, 100); // 100ms 内连续输入不会触发新的请求

  useEffect(() => {
    console.log("useEffect triggered: Fetching event data...");
    fetchEventData(eventName, startDate, endDate, setEventData);
  }, [eventName, startDate, endDate]);

  return (
    <div>
      <h1>数据看板</h1>
      <div>
        <label>选择事件: </label>
        <select onChange={(e) => {
          console.log("Event Name Changed:", e.target.value);
          setEventName(e.target.value);
        }} value={eventName}>
          <option value="user_login">用户登录</option>
          <option value="page_load">页面访问</option>
        </select>
      </div>
      <div>
        <label>开始日期: </label>
        <input type="datetime-local" onChange={handleStartDateChange} value={startDate} />
        <label>结束日期: </label>
        <input type="datetime-local" onChange={handleEndDateChange} value={endDate} />
      </div>
      
      {/* 调试数据输出 */}
      <div>
        <h2>调试信息</h2>
        <p><strong>当前事件:</strong> {eventName}</p>
        <p><strong>开始时间:</strong> {startDate}</p>
        <p><strong>结束时间:</strong> {endDate}</p>
        <p><strong>数据条数:</strong> {eventData.length}</p>
        {eventData.length === 0 && <p style={{ color: 'red' }}>⚠️ 没有数据，检查 API 返回值！</p>}
      </div>

      <EventChart eventData={eventData} /> {/* 传递事件数据到图表组件 */}
    </div>
  );
};

export default Dashboard;

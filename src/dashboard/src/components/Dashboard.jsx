import React, { useState, useEffect } from "react";
import EventChart from "./EventChart";
import EventTable from "./EventTable"; // 引入事件表格组件
import { getEventData } from "../services/api";
import { Button } from "antd";
import debounce from "lodash.debounce";

const Dashboard = () => {
  const formatDateForInput = (date) => {
    return new Date(date).toISOString().slice(0, 16); // 只取 YYYY-MM-DDTHH:mm
  };

  const [eventName, setEventName] = useState("user_login");
  const [startDate, setStartDate] = useState(formatDateForInput(new Date("2025-02-18T00:00:00Z")));
  const [endDate, setEndDate] = useState(formatDateForInput(new Date("2025-02-18T23:59:59Z")));
  const [eventData, setEventData] = useState([]);

  const fetchEventData = debounce(async (eventName, startDate, endDate, setEventData) => {
    console.log(`Fetching event data: eventName=${eventName}, startDate=${startDate}, endDate=${endDate}`);

    try {
      let data = await getEventData(eventName, startDate, endDate);

      if (!data || data.length === 0) {
        console.warn("No data received from API.");
        setEventData([]);
        return;
      }

      console.log("Fetched event data:", data);

      data = data.map((event) => ({
        event_name: event.event_name,
        pv: event.pv,
        uv: event.uv,
      }));

      setEventData(data);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setEventData([]);
    }
  }, 100);

  useEffect(() => {
    console.log("useEffect triggered: Fetching event data...");
    fetchEventData(eventName, startDate, endDate, setEventData);
  }, [eventName, startDate, endDate]);

  return (
    <div>
      <h1>数据看板</h1>

      {/* 事件选择器 */}
      <div>
        <label>选择事件: </label>
        <select
          onChange={(e) => {
            console.log("Event Name Changed:", e.target.value);
            setEventName(e.target.value);
          }}
          value={eventName}
        >
          <option value="user_login">用户登录</option>
          <option value="page_load">页面访问</option>
        </select>
      </div>

      {/* 时间选择器 */}
      <div>
        <label>开始日期: </label>
        <input type="datetime-local" onChange={(e) => setStartDate(e.target.value)} value={startDate} />
        <label>结束日期: </label>
        <input type="datetime-local" onChange={(e) => setEndDate(e.target.value)} value={endDate} />
      </div>

      {/* 事件图表 */}
      <EventChart eventData={eventData} />

      {/* 事件表格 */}
      <EventTable />
    </div>
  );
};

export default Dashboard;

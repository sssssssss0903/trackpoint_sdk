import React, { useState, useEffect } from "react";
import { Table, Button, Modal, message, Typography } from "antd";
import { getAllEvents, deleteEvent } from "../services/api";

const EventTable = () => {
  const [allEventData, setAllEventData] = useState([]); // 存储所有事件数据
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 选中的事件 ID

  // 获取所有事件数据
  const fetchAllEvents = async () => {
    try {
      const data = await getAllEvents();
      console.log("获取所有事件数据:", data);
      setAllEventData(data || []); // 避免数据为空导致崩溃
    } catch (error) {
      console.error(" 获取所有事件数据失败:", error);
      message.error("获取所有事件数据失败");
      setAllEventData([]);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // 删除事件
  const handleDeleteEvent = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择事件");
      return;
    }
  
    const eventIdToDelete = selectedRowKeys[0];
  
    console.log("直接删除事件 ID:", eventIdToDelete);
  
    if (!eventIdToDelete || isNaN(eventIdToDelete)) {
      message.error("无效的事件 ID");
      return;
    }
  
    try {
      console.log(" 发送删除请求，事件 ID:", eventIdToDelete);
      await deleteEvent(eventIdToDelete);
      message.success("事件删除成功");
      setSelectedRowKeys([]); // 清空选中状态
      fetchAllEvents(); // 重新获取数据
    } catch (error) {
      console.error(" 删除事件失败:", error);
      message.error("删除事件失败");
    }
  };
  

  // 表格列定义
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "事件名称",
      dataIndex: "event_name",
      key: "event_name",
    },
    {
      title: "事件数据",
      dataIndex: "event_data",
      key: "event_data",
      render: (data) => <pre>{JSON.stringify(data, null, 2)}</pre>,
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>所有事件列表</Typography.Title>

      {/* 刷新事件按钮 */}
      <Button type="primary" onClick={fetchAllEvents} style={{ marginBottom: 10 }}>
        刷新事件数据
      </Button>

      {/* 事件删除按钮 */}
      <Button
        type="primary"
        danger
        onClick={handleDeleteEvent}
        disabled={selectedRowKeys.length === 0}
        style={{ marginLeft: 10 }}
      >
        删除选中事件
      </Button>

      {/* 事件表格 */}
      <Table
        rowSelection={{
          type: "radio",
          selectedRowKeys,
          onChange: (selectedKeys) => {
            console.log("选中的事件 ID:", selectedKeys);
            setSelectedRowKeys(selectedKeys || []);
          },
        }}
        columns={columns}
        dataSource={allEventData || []}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default EventTable;

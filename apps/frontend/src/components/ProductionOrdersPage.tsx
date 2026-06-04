'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Space,
  Spin,
  Tag,
} from 'antd';
import { ProductionOrder, ProductionOrderStatus } from '@po/types';
import { productionOrdersApi } from '@/lib/api';
import dayjs from 'dayjs';

export const ProductionOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await productionOrdersApi.getAll();
      setOrders(data || []);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async (values: any) => {
    try {
      const payload = {
        reference: values.reference,
        product: values.product,
        quantity: values.quantity,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await productionOrdersApi.update(editingId, payload);
        message.success('Order updated successfully');
      } else {
        await productionOrdersApi.create(payload);
        message.success('Order created successfully');
      }

      form.resetFields();
      setIsModalVisible(false);
      setEditingId(null);
      fetchOrders();
    } catch (error) {
      message.error(editingId ? 'Failed to update order' : 'Failed to create order');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Order',
      content: 'Are you sure you want to delete this order?',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await productionOrdersApi.delete(id);
          message.success('Order deleted successfully');
          fetchOrders();
        } catch (error) {
          message.error('Failed to delete order');
        }
      },
    });
  };

  const handleReschedule = async () => {
    try {
      setLoading(true);
      const result = await productionOrdersApi.rescheduleConflicts();
      if (result.success) {
        message.success(result.message);
        fetchOrders();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('Failed to reschedule conflicts');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductionOrderStatus) => {
        const colors: Record<ProductionOrderStatus, string> = {
          planned: 'blue',
          scheduled: 'cyan',
          in_progress: 'orange',
          completed: 'green',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: ProductionOrder) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue({
                reference: record.reference,
                product: record.product,
                quantity: record.quantity,
                startDate: dayjs(record.startDate),
                endDate: dayjs(record.endDate),
              });
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Production Orders</h1>
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Button type="primary" onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalVisible(true);
            }}>
              Create New Order
            </Button>
            <Button onClick={handleReschedule} loading={loading}>
              Reschedule Conflicts
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
          />
        </Space>
      </Spin>

      <Modal
        title={editingId ? 'Edit Order' : 'Create New Order'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEdit}
        >
          <Form.Item
            label="Reference"
            name="reference"
            rules={[{ required: true, message: 'Please enter reference' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Product"
            name="product"
            rules={[{ required: true, message: 'Please enter product' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

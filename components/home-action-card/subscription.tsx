import type { NextPage } from 'next';
import Head from 'next/head';
import {
  Button,
  Col,
  Divider,
  Row,
  Typography,
  Image,
  Form,
  Input,
  Alert,
  message,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { firebaseInstance } from '../../config/firebase-config';

const Subscription = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (values, saveAnswerDuringCreation?: false) => {
    setLoading(true);
    const db = getFirestore(firebaseInstance);

    try {
      const docRef = await addDoc(collection(db, 'users'), {
        email: values.email,
      });
      if (docRef.id) {
        // setSuccess(true);
        message.success('Success!');
        form.resetFields();
      }
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
    return setLoading(false);
  };

  return (
    <Row>
      <Form form={form} onFinish={onSubmit} labelAlign={'left'} colon={false}>
        <Row justify='space-between'>
          <Form.Item
            label={'Email'}
            name={'email'}
            rules={[{ required: true }]}
          >
            <Input placeholder={'e.g. vitalik@gmail.com'} type='email' />
          </Form.Item>
          <Button
            type={'primary'}
            icon={<SendOutlined />}
            htmlType={'submit'}
            loading={loading}
            style={{ marginLeft: '16px' }}
          >
            Subscribe
          </Button>
        </Row>
      </Form>
    </Row>
  );
};

export default Subscription;

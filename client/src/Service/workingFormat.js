import api from './api';

export const getWorkingFormats = async () => {
  const res = await api.get('/api/user/working/formats');
  return res.data;
};

export const getWorkingTools = async () => {
  const res = await api.get('/api/user/working/tools');
  return res.data;
};

export const workImageAndFormatePurchase = async (id) => {
  const res = await api.post('/api/user/working/buy', { id });
  return res.data;
};
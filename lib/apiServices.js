import { api, apiAUTH } from "./axiosInstance";


/**
 * Calls an api with GET method without auth token
 * 
 * uses api (Axios Instance) to call the api
 * 
 * @param {string} url - API endpoint excluding the BASE_URL
 * @returns {Promise<Object>} a promise that resolves to the requested data 
 */
export const getAPI = async (url) => {
  const response = await api.get(url);
  return response;
};

/**
 * Calls an api with GET method with auth token
 * 
 * uses apiAUTH (Axios Instance) to call the api
 * 
 * @param {string} url - API endpoint excluding the BASE_URL
 * @returns {Promise<Object>} a promise that resolves to the requested data 
 */
export const getAPIAuth = async (url) => {
    const response = await apiAUTH.get(url);
    return response;
};

/**
 * Calls an api with POST method without auth token
 * 
 * uses api (Axios Instance) to call the api
 * 
 * @param {string} url - API endpoint excluding the BASE_URL 
 * @param {object} params - object which is to be posted
 * @returns {Promise<Object>} a promise that resolves to the server message with or without posted data 
 */
export const postAPI = async (url, params) => {
  const response = await api.post(url, params);
  return response;
};

/**
 * Calls an api with POST method with auth token
 * 
 * uses apiAUTH (Axios Instance) to call the api
 * 
 * @param {string} url - API endpoint excluding the BASE_URL 
 * @param {object} params - object which is to be posted
 * @returns {Promise<Object>} a promise that resolves to the server message with or without posted data 
 */
export const postAPIAuth = async (url, params, headers) => {
    const response = await apiAUTH.post(url, params,{ headers:{...(headers || {}) }});
    return response;
};

/**
 * Calls an api with POST method with auth token and "Content-Type":"multipart/form-data" header
 * 
 * uses apiAUTH (Axios Instance) to call the api
 * 
 * @param {string} url - API endpoint excluding the BASE_URL 
 * @param {object} params - object which is to be posted
 * @returns {Promise<Object>} a promise that resolves to the server message with or without posted data 
 */
export const formDataAuth = async (url, params) => {
    const response = await apiAUTH.post(url, params,{
      headers: {
      "Content-Type": "multipart/form-data"
    }
    });
    return response;
};

/**
 * PATCH with auth (JSON or FormData). For FormData, omit manual Content-Type so the client sets multipart boundaries.
 */
export const patchAPIAuth = async (url, data, config) => {
  const response = await apiAUTH.patch(url, data, config);
  return response;
};

/**
 * DELETE with auth token.
 */
export const deleteAPIAuth = async (url, config) => {
  const response = await apiAUTH.delete(url, config);
  return response;
};

/**
 * PUT with auth token.
 */
export const putAPIAuth = async (url, data, config) => {
  const response = await apiAUTH.put(url, data, config);
  return response;
};
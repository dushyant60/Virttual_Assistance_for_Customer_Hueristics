import { BlobServiceClient } from "@azure/storage-blob";
import { clearCache, getCache, setCache } from "./cacheutils";


const containerName = process.env.REACT_APP_AZURE_STORAGE_CONTAINER_NAME;
const sasToken = process.env.REACT_APP_AZURE_STORAGE_SAS_TOKEN;
const storageAccountName = process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME;
const uploadUrl = `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`;


const blobService = new BlobServiceClient(uploadUrl);
const containerClient = blobService.getContainerClient(containerName);

export const isStorageConfigured = () => {
  return !storageAccountName || !sasToken ? false : true;
};

export const getBlobsInContainer = async () => {  
  const cacheKey = 'blobListCache';  
  const cachedBlobList = getCache(cacheKey);  
  
  if (cachedBlobList) {  
    return cachedBlobList;  
  }  
  
  const returnedBlobUrls = [];  
  for await (const blob of containerClient.listBlobsFlat()) {  
    const blobClient = containerClient.getBlobClient(blob.name);  
    const properties = await blobClient.getProperties();  
    const lastModified = properties.lastModified.toLocaleDateString(undefined, {  
      year: 'numeric',  
      month: 'short',  
      day: 'numeric'  
    });  
    const time = properties.lastModified.toLocaleTimeString();  
    const sizeInBytes = properties.contentLength;  
    const sizeInKB = Math.ceil(sizeInBytes / 1024);  
    const blobItem = {  
      id: `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}?${sasToken}`,  
      url: `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}?${sasToken}`,  
      name: blob.name,  
      size: sizeInKB + "KB",  
      type: properties.contentType,  
      date: lastModified,  
      time: time,  
      file: blob  
    };  
  
    returnedBlobUrls.push(blobItem);  
  }  
  
  setCache(cacheKey, returnedBlobUrls); // store the blob list in cache  
  return returnedBlobUrls;  
};  

const cacheKey = 'blobListCache'; // common cache key  
  
const createBlobInContainer = async (file) => {  
  const blobClient = containerClient.getBlockBlobClient(file.name);  
  const options = { blobHTTPHeaders: { blobContentType: file.type } };  
  await blobClient.uploadData(file, options);  
  clearCache(cacheKey); // clear cache after uploading a new file  
};  
  
export const deleteBlobFromContainer = async (blobUrl) => {  
  const blobUrlWithoutSas = blobUrl.split('?')[0];  
  const blobName = blobUrlWithoutSas.substring(blobUrlWithoutSas.lastIndexOf('/') + 1);  
  const blobClient = containerClient.getBlobClient(blobName);  
  await blobClient.delete();  
  clearCache(cacheKey); // clear cache after deleting a file  
};  

const uploadFileToBlob = async (file) => {
  if (!file) return;

  await createBlobInContainer(file);
};

export default uploadFileToBlob;